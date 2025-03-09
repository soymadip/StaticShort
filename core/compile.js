const fs = require('fs');
const path = require('path');
const consola = require('consola');
const { URL } = require('url');
const { loadConfig, loadShortlinks } = require('./confLoader');

const config = loadConfig();
const shortlinks = loadShortlinks();
const templatePath = path.join(__dirname, '..', 'templates', config.template || 'default.html');

// ----------------- templates -----------------

const redirectScript = `
    <!-- Instant redirect -->
    <script>
      window.location.replace("{{url}}");
      console.log("Redirecting to: {{url}}");
    </script>
    `;

const metaRefresh = `

    <!-- Fallback redirect -->
    <meta http-equiv="refresh" content="${config.metaDelay};url={{url}}" />
    `;

const favicon = `
    <!-- Favicon -->
    <link rel="icon" type="image/png" href="${config.favicon}" />
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
  
  // Prepare redirect content
  const redirectContent = `
    <title>Redirecting to ${url}</title>
    ${redirectScript}${metaRefresh}${favicon}`;

  // Insert redirect content
  if (processedTemplate.includes('<head>')) 
  {
    // Insert after first <head> tag
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

  // parse placeholders
  processedTemplate = processedTemplate
    .replace(/{{url}}/g, url)
    .replace(/{{domain}}/g, domain)
    .replace(/{{key}}/g, key)
    .replace(/{{faviconUrl}}/g, faviconUrl);

  return processedTemplate;
}


function parseIndexPage(outputBaseDir, shortlinks) {
  const IndexTemplatePath = path.join(__dirname, '..', 'templates', '_index.html');
  
  if (!fs.existsSync(IndexTemplatePath))
  {
    consola.error(`Index template not found: ${IndexTemplatePath}`);
    return false;
  }
  
  try {
    const IndexContent = fs.readFileSync(IndexTemplatePath, 'utf8');
    
    // Get the count of entries
    const count = Object.keys(shortlinks).length;
    
    // Generate shortlink list
    const shortlinkList = Object.entries(shortlinks)
      .map(([key, url]) => `<li><a href="${key}/" class="row-link"><span class="key">/${key}</span><span class="arrow">→</span><span class="domain-name">${url}</span></a></li>`)
      .join('\n              ');
    
    // Replace shortlinks, Link count and favicon
    const parsedIndex = IndexContent
      .replace('{{shortlinks}}', shortlinkList)
      .replace('{{count}}', count)
      .replace('{{favicon}}', config.favicon);
    
    // Write to index.html
    fs.writeFileSync(path.join(outputBaseDir, 'index.html'), parsedIndex);

    consola.success(`Added Index page at /`);
    return true;

  } catch (error) {

    consola.warn(`Failed to add Index page: ${error.message}`);

    return false;
  }
}


function generateRedirects() {

  if (!shortlinks) 
  {
    consola.error('No shortlinks in your shortlink DB.');
    return;
  }

  try 
  {
    // Read and validate HTML template
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template file not found: ${templatePath}`);
    }
    
    const templateContent = fs.readFileSync(templatePath, 'utf8');
    consola.success(`Template loaded: ${templatePath}\n`);

    const outputBaseDir = path.join(__dirname, '..', config.buildDir);

    if (!fs.existsSync(outputBaseDir)) 
    {
      fs.mkdirSync(outputBaseDir, { recursive: true });
      consola.success(`Created build directory: ${outputBaseDir}`);
    }

    // Add Index page if enabled
    if (config.addIndex === true) 
    {
      parseIndexPage(outputBaseDir, shortlinks);
    }

    // Loop over each entry
    consola.info("Generating: ");
    let count = 0;

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
      consola.success(`    /${key} → ${url}`);

      // Increse count
      count++;
    }

    console.log(`\n✅ Generated ${count} shortlinks in \`${outputBaseDir}\`\n`);
  } 
  catch (error) 
  {
    consola.error(`\nFailed to generate redirects: ${error.message}`);
    consola.error(error);
  }
}

module.exports = { 
  generateRedirects,
  parseIndexPage
};
