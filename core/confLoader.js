const fs = require("fs");
const path = require("path");
const jsoncParser = require("jsonc-parser");
const consola = require("consola");

let cachedConfig = null;
let cachedShortlinks = null;
let splitConfig = null;

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

// Make onsistent path formatting
function formatPath(path, type) {
  switch (type) {
    case 'display':
      return path === '/' ? '/' : path;
    case 'url':
      return path === '/' ? '' : path;
    case 'link':
      return (key) => path === '/' ? `/${key}` : `${path}/${key}`;
    default:
      return path;
  }
}

function getConfig() {

  if (splitConfig !== null)
  {
    return splitConfig;
  }

  const configPath = path.join(__dirname, "..", "config.js");

  if (fs.existsSync(configPath)) 
  {
    try 
    {
      splitConfig = require(configPath);
      console.log(`📝 Configuration loaded: ${configPath}`);
      return splitConfig;

    } catch (error) 
    {
      consola.error(`Error loading config.js: ${error.message}. Falling back to JSONC configs.`);
      splitConfig = false;
    }
  } else {
    splitConfig = false;
  }

  return splitConfig;
}


function parseDeployPath(deployPath) {

  if (!deployPath)
  {
    return '/';
  }

  // Ensure path starts with '/'
  let final = deployPath.startsWith('/') ? deployPath : `/${deployPath}`;
  
  // Remove trailing slash if not root
  return (final !== '/' && final.endsWith('/')) ? final.slice(0, -1) : final;
}


// Get output directory based on buildDir and deploy_path
function getOutputDir() {
  const config = loadConfig();
  const buildDir = path.join(__dirname, "..", config.buildDir);
  
  return config.deploy_path === '/' 
    ? buildDir
    : path.join(buildDir, config.deploy_path.substring(1));
}


function loadConfig() {

  if (cachedConfig)
  {
    return cachedConfig;
  }
  
  // Try to load from config.js first
  const unified = getConfig();

  if (unified && unified.config) {
    const configData = unified.config.link_shrotener || unified.config;
    const finalConfig = { ...defaultConfig, ...configData };

    finalConfig.deploy_path = parseDeployPath(finalConfig.deploy_path);
    cachedConfig = finalConfig;

    return cachedConfig;
  }

  // Otherwise load from static-short.jsonc
  const configPath = path.join(__dirname, "..", "static-short.jsonc");
  try
  {
    if (!fs.existsSync(configPath)) 
    {
      consola.warn("Config file not found, using defaults");

      cachedConfig = { ...defaultConfig };
      cachedConfig.deploy_path = parseDeployPath(defaultConfig.deploy_path);
      return cachedConfig;
    }
    
    const configContent = fs.readFileSync(configPath, "utf8");
    const errors = [];
    const config = jsoncParser.parse(configContent, errors);

    if (errors.length > 0)
    {
      consola.error(`JSONC parse errors: ${errors.map(e => e.error).join(", ")}`);
      return { ...defaultConfig };
    }

    const finalConfig = { ...defaultConfig, ...config };

    if (!finalConfig.buildDir) 
    {
      consola.error(`'buildDir' is missing in config`);
      return { ...defaultConfig };
    }

    finalConfig.deploy_path = parseDeployPath(finalConfig.deploy_path);

    console.log(`📝 Configuration loaded: ${configPath}`);

    cachedConfig = finalConfig;

    return cachedConfig;
  }

  catch (error)
  {
    consola.warn(`  Config error: ${error.message}. Using defaults`);
    cachedConfig = { ...defaultConfig };
    cachedConfig.deploy_path = parseDeployPath(defaultConfig.deploy_path);
  
    return cachedConfig;
  }
}


function loadShortlinks() {
  
  if (cachedShortlinks)
  {
    return cachedShortlinks;
  }

  const validateShortlinks = (links) => {
    if (!links) return false;
    
    let isValid = true;
    Object.entries(links).forEach(([key, url]) => {
      if (typeof url !== 'string' || !url.startsWith('http')) 
      {
        consola.error(`Invalid URL for shortlink "${key}": ${url}`);
        isValid = false;
      }
    });

    return isValid;
  };

  // Try loading from config.js first
  const unified = getConfig();

  if (unified && unified.config)
  {
    const shortLinks = unified.config.shortLinks || 
                      (unified.config.link_shrotener && unified.config.link_shrotener.shortLinks);
    
    if (shortLinks)
    {
      validateShortlinks(shortLinks);
      cachedShortlinks = shortLinks;

      console.log(`🔗 Shortlinks loaded: ${Object.keys(shortLinks).length}`);
      return cachedShortlinks;
    }
  }

  // Otherwise load from shortlinks file
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
        consola.error(`JSONC parse errors: ${errors.map(e => e.error).join(", ")}`);
        return null;
      }

      // Validate shortlinks
      validateShortlinks(shortlinks);

      cachedShortlinks = shortlinks;
      
      console.log(`🔗 Shortlinks loaded: ${Object.keys(shortlinks).length}`);
      
      return cachedShortlinks;
    } 
    
    consola.error(`Shortlink DB not found at ${shortlinksPath}`);
    return null;

  } catch (error) {

    consola.error(`Failed to load shortlinks: ${error.message}`);
    return null;
  }
}


module.exports = {
  loadConfig,
  loadShortlinks,
  getOutputDir,
  parseDeployPath,
  formatPath
};
