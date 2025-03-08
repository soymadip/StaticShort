const fs = require("fs");
const path = require("path");
const consola = require("consola");
const { loadConfig, loadShortlinks } = require('./confLoader');

const config = loadConfig();
const shortlinks = loadShortlinks();

const outputDir = path.join(__dirname, "..", config.outputDirectory);


if (!shortlinks) 
{
  consola.error("No shortlinks found. Exiting...");
  process.exit(1);
}

consola.info(`Found ${Object.keys(shortlinks).length} shortlinks.`);
const shortlinkKeys = Object.keys(shortlinks);



// Check if output directory exists
if (fs.existsSync(outputDir)) 
{
  // Read all entries
  const entries = fs.readdirSync(outputDir, { withFileTypes: true });

  // Delete only directories that match shortlink keys
  entries
    .filter(entry => entry.isDirectory() && shortlinkKeys.includes(entry.name))
    .forEach(entry => {
      const entryPath = path.join(outputDir, entry.name);
      fs.rmSync(entryPath, { recursive: true, force: true });
      consola.success(`Deleted: ${entry.name}`);
    });

  consola.success("CleanUp complete!");

} else {
  consola.warn(`Output directory doesn't exist: ${outputDir}`);
}
