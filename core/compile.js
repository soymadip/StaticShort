const fs = require('fs');
const path = require('path');
const consola = require('consola');
const { URL } = require('url');
const { loadConfig, loadShortlinks, getOutputDir } = require('./confLoader');

const config = loadConfig();
const shortlinks = loadShortlinks();
const templatePath = path.join(__dirname, '..', 'templates', config.template || 'default.html');

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

  let processedTemplate = template;
  
  // Put redirect methods 
  const redirectContent = `
    <title>Redirecting to ${url}</title>
    ${redirectScript}${metaRefresh}${favicon}`;

  // Inject redirects
  if (processedTemplate.includes('<head>')) 
  {
    // After first <head>
    const headMatch = processedTemplate.match(/<head[^>]*>/i);

    if (headMatch) 
    {
      const insertPosition = headMatch.index + headMatch[0].length;

      processedTemplate = processedTemplate.slice(0, insertPosition) 
        + redirectContent 
        + processedTemplate.slice(insertPosition);
    }
  }
  else if (processedTemplate.includes('<html')) 
  {
    processedTemplate = processedTemplate.replace(/<html[^>]*>/i, `$&\n  <head>${redirectContent}</head>`);
  }
  else 
  {
    processedTemplate = `<!DOCTYPE html>\n<html>\n  <head>${redirectContent}</head>\n${processedTemplate}</html>`;
  }

  // parse variables
  return processedTemplate
    .replace(/{{URL}}/g, url)
    .replace(/{{DOMAIN}}/g, domain)
    .replace(/{{KEY}}/g, key)
    .replace(/{{FAVICON_URL}}/g, faviconUrl);
}


function parseIndexPage(outputBaseDir, shortlinks, deployPath) {
  const IndexTemplatePath = path.join(__dirname, '..', 'templates', '_index.html');
  
  if (!fs.existsSync(IndexTemplatePath))
  {
    consola.error(`Index template not found at ${IndexTemplatePath}`);
    return false;
  }
  
  try {
    const IndexContent = fs.readFileSync(IndexTemplatePath, 'utf8');
    
    // Get the count of entries
    const count = Object.keys(shortlinks).length;
    
    const basePath = deployPath === '/' ? '' : deployPath;

    const shortlinkList = Object.entries(shortlinks)
      .map(([key, url]) => `<li><a href="${basePath}/${key}/" class="row-link"><span class="key">/${key}</span><span class="arrow">→</span><span class="domain-name">${url}</span></a></li>`)
      .join('\n              ');

    // Parse template variables
    const parsedIndex = indexContent
      .replace('{{SHORTLINKS}}', shortlinkList)
      .replace('{{COUNT}}', count)
      .replace('{{FAVICON_URL}}', config.favicon);
    
    // Write to index.html
    fs.writeFileSync(path.join(outputBaseDir, 'index.html'), parsedIndex);

    return true;

  } catch (error) {

    consola.warn(`❌ Failed to add Index page: ${error.message}`);
    return false;
  }
}


function generateRedirects() {

  const deployPath = config.deploy_path;
  const outputBaseDir = getOutputDir();

  if (!shortlinks) 
  {
    consola.error('❌ No shortlinks in your shortlink DB.');
    return;
  }

  try 
  {
    // Read & validate template
    if (!fs.existsSync(templatePath))
    {
      consola.error(new Error(`❌ Template file not found ${templatePath}`));
    }
    
    const templateContent = fs.readFileSync(templatePath, 'utf8');

    console.log(`📝 Template loaded: ${templatePath}\n`);

    if (!fs.existsSync(outputBaseDir)) 
    {
      fs.mkdirSync(outputBaseDir, { recursive: true });
      consola.success(`📁 Created build directory: ${outputBaseDir}`);
    }

    console.log("\n" + "─".repeat(50));
    console.log("🔗 Generating shortlinks :-");
    
    let count = 0;

    if (config.addIndex === true)
    {
      const indexSuccess = parseIndexPage(outputBaseDir, shortlinks, deployPath);

      if (indexSuccess)
      {
        const displayPath = deployPath === '/' ? '/' : deployPath;

        consola.success(`    ${displayPath}        →  index page`);
        count++;
      }
    }

    for (const [key, url] of Object.entries(shortlinks)) 
    {
      // Create {{key}} directory
      const shortlinkDir = path.join(outputBaseDir, key);

      if (!fs.existsSync(shortlinkDir)) 
      {
        fs.mkdirSync(shortlinkDir, { recursive: true });
      }

      // Generate HTML
      const htmlContent = processTemplate(templateContent, key, url);
      
      // Write to index.html
      const outputPath = path.join(shortlinkDir, 'index.html');

      fs.writeFileSync(outputPath, htmlContent);

      const displayPath = deployPath === '/' ? 
        `/${key}` : 
        `${deployPath}/${key}`;

      consola.success(`    ${displayPath}  →  ${url}`);

      count++;
    }

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
