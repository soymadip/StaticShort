const fs = require("fs");
const path = require("path");
const jsoncParser = require("jsonc-parser");
const consola = require("consola");

const defaultConfig = {
  outputDirectory: "redirect",
  shortLinkDB: "shortlinks.jsonc",
  titleFormat: "Redirecting you to {{domain}}"
};

// Cache for loaded data
let cachedConfig = null;
let cachedShortlinks = null;

function loadConfig() {
  if (cachedConfig) return cachedConfig;

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
        throw new Error(`JSONC parse errors: ${errors.map(e => e.error).join(", ")}`);
      }

      // Validate required fields
      const finalConfig = { ...defaultConfig, ...config };

      if (!finalConfig.outputDirectory) 
      {
        throw new Error("'outputDirectory' is missing in config");
      }

      consola.success("Configuration loaded successfully");
      cachedConfig = finalConfig;
      return cachedConfig;
    }

  }
  catch (error)
  {
    consola.warn(`Config error: ${error.message}. Using defaults`);
  }

  cachedConfig = defaultConfig;
  return cachedConfig;
}

function loadShortlinks() {
  if (cachedShortlinks) return cachedShortlinks;

  const config = loadConfig(true);
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
        throw new Error(`JSONC parse errors: ${errors.map(e => e.error).join(", ")}`);
      }

      // Validate shortlinks
      Object.entries(shortlinks).forEach(([key, url]) => {

        if (typeof url !== 'string' || !url.startsWith('http')) 
        {
          throw new Error(`Invalid URL for shortlink "${key}": ${url}`);
        }
      });

      cachedShortlinks = shortlinks;

      return cachedShortlinks;

    } else {
      throw new Error(`Shortlinks file not found at ${shortlinksPath}`);
    }

  } catch (error) {

      consola.error(`Failed to load shortlinks: ${error.message}`);
      return null;
  }
}

module.exports = {
  loadConfig,
  loadShortlinks
};
