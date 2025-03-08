const fs = require('fs');
const path = require('path');
const consola = require('consola');
const { URL } = require('url');
const { loadConfig, loadShortlinks } = require('./confLoader');

const config = loadConfig();
const shortlinks = loadShortlinks();
const templatePath = path.join(__dirname, '..', 'templates', config.template || 'default.html');

const redirectScript = `
    <!-- Instant redirect -->
    <script>
      window.location.replace("{{url}}");
      console.log("Redirecting to: {{url}}");
    </script>
`;

const metaRefresh = `
    <!-- Fallback redirect -->
    <meta http-equiv="refresh" content="0.2;url={{url}}" />
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
  
  // Insert redirectScript & metaRefresh
  let processedTemplate = template.replace(/<head>/i, `<head>${redirectScript}`);

  processedTemplate = processedTemplate.replace(/<\/head\s*>/i, `${metaRefresh}</head>`);

  // Replace placeholders with actual values
  processedTemplate = processedTemplate
    .replace(/{{url}}/g, url)
    .replace(/{{domain}}/g, domain)
    .replace(/{{key}}/g, key);

  // Set title if titleFormat is defined
  if (config.titleFormat) 
  {
    const title = config.titleFormat
      .replace(/{{domain}}/g, domain)
      .replace(/{{key}}/g, key)
      .replace(/{{url}}/g, url);

    processedTemplate = processedTemplate.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
  }

  // Validate that both redirect methods were inserted
  if (!processedTemplate.includes("window.location.replace") || !processedTemplate.includes("meta http-equiv=\"refresh\""))
  {
    consola.warn(`Warning: One or more redirect methods may not have been inserted for ${key}`);
  }

  return processedTemplate;
}


function generateRedirects() {

  if (!shortlinks) 
  {
    consola.error('No shortlinks available. Check your shortlinks file.');
    return;
  }

  try 
  {
    // Read HTML template
    const templateContent = fs.readFileSync(templatePath, 'utf8');
    consola.info(`Template loaded from ${templatePath}`);

    // Check output directory
    const outputBaseDir = path.join(__dirname, '..', config.outputDirectory);

    if (!fs.existsSync(outputBaseDir)) 
    {
      fs.mkdirSync(outputBaseDir, { recursive: true });
      consola.success(`Created output dir: ${outputBaseDir}`);
    }

    // Loop over each entry
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
      consola.success(`Generated redirect for "${key}" → ${url}`);

      // Increse count
      count++;
    }

    consola.success(`✅ Generated ${count} shortlinks in ${outputBaseDir}`);
  } 
  catch (error) 
  {
    consola.error(`Failed to generate redirects: ${error.message}`);
    consola.error(error);
  }
}

module.exports = { generateRedirects };

