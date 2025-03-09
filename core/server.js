const path = require('path');
const fs = require('fs');

const liveServer = require('live-server');
const consola = require('consola');
const { loadConfig } = require('./confLoader');


function startDevServer(options = {}) {
  const config = loadConfig();
  
  // Remove leading slash
  const buildDir = config.buildDir.replace(/^\/+/, '');
  const outputDir = path.resolve(process.cwd(), buildDir);
  
  // Check if the output directory exists
  if (!fs.existsSync(outputDir))
  {
    consola.error(`Build directory doesn't exist: ${outputDir}`);
    consola.info('Run "npm run build" first to generate redirect pages.');
    process.exit(1);
  }

  // Default config
  const params = {
    port: options.port || 8080,
    host: '0.0.0.0',
    root: outputDir,
    open: true,
    file: 'index.html',
    wait: 1000,
    mount: [],
    logLevel: 2,
  };

  consola.info(`Server starting at http://localhost:${params.port}`);
  consola.info(`Serving from directory: ${outputDir}`);

  // Start live server
  liveServer.start(params);
}

module.exports = {
  startDevServer
};
