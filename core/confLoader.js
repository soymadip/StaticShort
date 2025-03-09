const fs = require("fs");
const path = require("path");
const jsoncParser = require("jsonc-parser");
const consola = require("consola");

let cachedConfig = null;
let cachedShortlinks = null;


// ---------------- Default Options ----------------

const defaultConfig = {

  buildDir: "build",
  deploy_path: "/",
  shortLinkDB: "shortlinks.jsonc",
  addIndex: true,
  template: "default.html",
  metaDelay: 0.2,
  favicon: "https://raw.githubusercontent.com/soymadip/StaticShort/refs/heads/main/Assets/icon.svg"
};


// ---------------- Functions ----------------


function parseDeployPath(deployPath) {

  if (!deployPath)
  {
    return '/';
  }

  let final = deployPath;

  if (!final.startsWith('/'))
  {
    final = '/' + final;
  }

  if (final.endsWith('/') && final !== '/')
  {
    final = final.slice(0, -1);
  }

  return final;
}


// Get output directory based on buildDir and deploy_path
function getOutputDir() {
  const config = loadConfig();
  const buildDir = path.join(__dirname, "..", config.buildDir);
  
  if (config.deploy_path === '/')
  {
    return buildDir;
  } else {

    return path.join(buildDir, config.deploy_path.substring(1));
  }
}


function loadConfig() {

  if (cachedConfig)
  {
    return cachedConfig;
  }

  const configPath = path.join(__dirname, "..", "static-short.jsonc");

  try
  {
    if (fs.existsSync(configPath)) 
    {
      const configContent = fs.readFileSync(configPath, "utf8");
      const errors = [];
      const config = jsoncParser.parse(configContent, errors);

      if (errors.length > 0) 
      {
        consola.error(`❌ JSONC parse errors: ${errors.map(e => e.error).join(", ")}`);
        return { ...defaultConfig };
      }

      // Validate required fields
      const finalConfig = { ...defaultConfig, ...config };

      if (!finalConfig.buildDir) 
      {
        consola.error(`❌ 'buildDir' is missing in config`);
        return { ...defaultConfig };
      }

      // Normalize deploy_path
      finalConfig.deploy_path = parseDeployPath(finalConfig.deploy_path);

      console.log(`📝 Configuration loaded: ${configPath}`);

      cachedConfig = finalConfig;

      return cachedConfig;
    }
  }
  catch (error)
  {
    consola.warn(`  Config error: ${error.message}. Using defaults`);
  }

  cachedConfig = { ...defaultConfig };
  cachedConfig.deploy_path = parseDeployPath(defaultConfig.deploy_path);
  
  return cachedConfig;
}


function loadShortlinks() {
  
  if (cachedShortlinks)
  {
    return cachedShortlinks;
  }

  const config = loadConfig();
  const shortlinksPath = path.join(__dirname, "..", config.shortLinkDB);

  try
  {
    if (fs.existsSync(shortlinksPath)) 
    {
      const shortlinksContent = fs.readFileSync(shortlinksPath, "utf8");
      const errors = [];
      const shortlinks = jsoncParser.parse(shortlinksContent, errors);

      if (errors.length > 0) 
      {
        consola.error(`❌ JSONC parse errors: ${errors.map(e => e.error).join(", ")}`);
        return null;
      }

      // Validate shortlinks
      Object.entries(shortlinks).forEach(([key, url]) => {

        if (typeof url !== 'string' || !url.startsWith('http')) 
        {
          consola.error(`❌ Invalid URL for shortlink "${key}": ${url}`);
        }
      });

      cachedShortlinks = shortlinks;
      
      console.log(`🔗 Shortlinks loaded: ${Object.keys(shortlinks).length}`);
      
      return cachedShortlinks;

    } else {
      consola.error(`❌ Shortlink DB not found at ${shortlinksPath}`);
      return null;
    }

  } catch (error) {

    consola.error(`❌ Failed to load shortlinks: ${error.message}`);
    return null;
  }
}


module.exports = {
  loadConfig,
  loadShortlinks,
  getOutputDir,
  parseDeployPath
};
