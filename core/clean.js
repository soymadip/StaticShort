const fs = require("fs");
const path = require("path");
const consola = require("consola");
const { loadConfig, loadShortlinks, getOutputDir } = require('./confLoader');


function cleanRedirectPages() {

  const config = loadConfig();
  const outputDir = getOutputDir();
  const shortlinks = loadShortlinks();
  const deployPath = config.deploy_path;
  const deletedItems = [];

  if (!fs.existsSync(outputDir)) 
  {
    consola.warn(`Build directory doesn't exist\n`);
    return;
  }

  console.log();
  consola.info("Using:");
  console.log(`  Output dir: ${config.buildDir}/`);
  console.log(`  Deploy path: ${deployPath}\n`);

  // Handle index page if enabled
  if (config.addIndex === true) 
  {
    const indexPath = path.join(outputDir, "index.html");
    
    if (fs.existsSync(indexPath)) 
    {
      fs.rmSync(indexPath, { force: true });
      deletedItems.push("index.html");
    }
  }

  if (!shortlinks) 
  {
    consola.error("No shortlinks found in DB.");
    consola.error("Exiting...");
    return;
  }

  const shortlinkKeys = Object.keys(shortlinks);

  consola.info(`Found ${shortlinkKeys.length} shortlinks in DB.`);

  // Read all entries in output directory
  const entries = fs.readdirSync(outputDir, { withFileTypes: true });

  // Filter directories, match shortlink keys
  const existingDirs = entries.filter(entry => entry.isDirectory() && shortlinkKeys.includes(entry.name));

  consola.info(`Exist ${existingDirs.length} shortlinks to clean.\n`);

  existingDirs.forEach(entry =>
  {
    const entryPath = path.join(outputDir, entry.name);

    fs.rmSync(entryPath, { recursive: true, force: true });
    deletedItems.push(`${entry.name}/`);
  });

  if (deletedItems.length > 0)
  {
    console.log("\n" + "─".repeat(50));
    consola.info(` Removed ${deletedItems.length} entries:`);

    deletedItems.forEach(item => {
      consola.success(`  ${item}`);
    });

    console.log("─".repeat(50));
    console.log("\n🎉 CleanUp complete!\n");

  } else {

    consola.info("No items needed to be deleted.");
    console.log("✅ CleanUp complete!\n");
  }
}


module.exports = {

  cleanRedirectPages
}

