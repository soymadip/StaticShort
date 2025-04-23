const fs = require('fs');
const path = require('path');
const consola = require('consola');
const { URL } = require('url');
const { loadConfig, loadShortlinks, getOutputDir, formatPath } = require('./confLoader');

const config = loadConfig();

// ----------------- templates -----------------

const redirectScript = `
    <!-- Instant redirect -->
    <script>
      window.location.replace("{{URL}}");
      console.log("Redirecting to: {{URL}}");
    </script>
`;

const metaRefresh = `

    <!-- Fallback redirect -->
    <meta http-equiv="refresh" content="${config.metaDelay};url={{URL}}" />
`;

const favicon = `
    <!-- Favicon -->
    <link
      rel="icon"
      type="image/png"
      href="${config.favicon}"
    />
`;


//---------------- functions ----------------


function getDomainFromURL(url) {

  try
  {
    return new URL(url).hostname;
  }
  catch (error)
  {
    consola.warn(`Invalid URL: ${url}`);
    return 'unknown domain';
  }
}


function processTemplate(template, key, url) {

  const domain = getDomainFromURL(url);
  const faviconUrl = config.favicon;

  // Create the redirect content 
  const redirectContent = `
    <title>Redirecting to ${url}</title>
    ${redirectScript}${metaRefresh}${favicon}`;

  // Process the template based on its structure
  let processedTemplate = template;
  
  // Primary option: Insert after <head> tag if it exists
  if (template.includes('<head>')) {
    const headMatch = template.match(/<head[^>]*>/i);

    if (headMatch) 
    {
      const insertPosition = headMatch.index + headMatch[0].length;
      processedTemplate = template.slice(0, insertPosition) + 
                          redirectContent + 
                          template.slice(insertPosition);
    }
  } 
  // Option 2: Add <head> tag if <html> exists
  else if (template.includes('<html')) {
    processedTemplate = template.replace(
      /<html[^>]*>/i, 
      `$&\n  <head>${redirectContent}</head>`
    );
  } 
  // Option 3: Create a complete HTML document
  else {
    processedTemplate = `<!DOCTYPE html>\n<html>\n  <head>${redirectContent}</head>\n${template}</html>`;
  }

  // parse variables
  return processedTemplate
    .replace(/{{URL}}/g, url)
    .replace(/{{DOMAIN}}/g, domain)
    .replace(/{{KEY}}/g, key)
    .replace(/{{FAVICON_URL}}/g, faviconUrl);
}


function parseIndexPage(outputBaseDir, shortlinks, deployPath) {
  const indexTemplatePath = path.join(__dirname, '..', 'templates', '_index.html');
  
  if (!fs.existsSync(indexTemplatePath)) 
  {
    consola.error(`Index template not found at ${indexTemplatePath}`);
    return false;
  }
  
  try {
    const indexContent = fs.readFileSync(indexTemplatePath, 'utf8');
    const count = Object.keys(shortlinks).length;
    
    // Use the utility function for path formatting
    const basePath = formatPath(deployPath, 'url');
    
    const shortlinkList = Object.entries(shortlinks)
      .map(([key, url]) => {
        return `<li><a href="${basePath}/${key}/" class="row-link">
          <span class="key">/${key}</span>
          <span class="arrow">→</span>
          <span class="domain-name">${url}</span>
        </a></li>`.replace(/\s+/g, ' ');
      })
      .join('\n              ');

    // Parse template variables
    const parsedIndex = indexContent
      .replace('{{SHORTLINKS}}', shortlinkList)
      .replace('{{COUNT}}', count)
      .replace('{{FAVICON_URL}}', config.favicon);
    
    // Write to index page
    fs.writeFileSync(path.join(outputBaseDir, 'index.html'), parsedIndex);

    return true;

  } catch (error) {

    consola.warn(`❌ Failed to add Index page: ${error.message}`);
    return false;
  }
}


function generateRedirects() {
  const shortlinks = loadShortlinks();
  
  const deployPath = config.deploy_path;
  const outputBaseDir = getOutputDir();
  let count = 0;

  if (!shortlinks) 
  {
    consola.error('❌ No shortlinks in your shortlink DB.');
    return;
  }

  try 
  {
    // Get template path from config
    const templatePath = path.join(__dirname, '..', 'templates', config.template || 'default.html');

    // Read & validate template
    if (!fs.existsSync(templatePath))
    {
      throw new Error(`❌ Template file not found ${templatePath}`);
    }
    
    const templateContent = fs.readFileSync(templatePath, 'utf8');

    console.log(`📝 Template loaded: ${templatePath}\n`);

    // Ensure build directory exists
    if (!fs.existsSync(outputBaseDir)) 
    {
      fs.mkdirSync(outputBaseDir, { recursive: true });
      consola.success(`📁 Created build directory: ${outputBaseDir}`);
    }

    console.log("\n" + "─".repeat(50));
    console.log("🔗 Generating shortlinks :-");
    
    // Generate index page if needed
    if (config.addIndex === true)
    {
      const indexSuccess = parseIndexPage(outputBaseDir, shortlinks, deployPath);

      if (indexSuccess)
      {
        const displayPath = formatPath(deployPath, 'display');
        consola.success(`    ${displayPath}        →  index page`);
        count++;
      }
    }

    // Generate redirect pages for each shortlink
    for (const [key, url] of Object.entries(shortlinks)) 
    {
      // Create {{key}} directory
      const shortlinkDir = path.join(outputBaseDir, key);

      if (!fs.existsSync(shortlinkDir)) 
      {
        fs.mkdirSync(shortlinkDir, { recursive: true });
      }

      // Process template
      const htmlContent = processTemplate(templateContent, key, url);
      
      // Write to index.html
      const outputPath = path.join(shortlinkDir, 'index.html');

      fs.writeFileSync(outputPath, htmlContent);

      const displayPath = formatPath(deployPath, 'link')(key);
      consola.success(`    ${displayPath}  →  ${url}`);
      count++;
    }

    // Display summary
    console.log("─".repeat(50) + "\n");
    console.log(`🎉 Generated ${count} shortlinks in \`${outputBaseDir}\``);
    consola.success(` Deploy path: ${deployPath}\n`);
  }
  catch (error) 
  {
    console.log("\n");
    console.log(`❌ Failed to generate redirects: ${error.message}`);
    consola.error(error);
  }
}

module.exports = { 
  generateRedirects,
  parseIndexPage
};
