#!/usr/bin/env node

const consola = require('consola');
const args = process.argv.slice(2);


function displayBanner() {
  console.log(`
  ┌─────────────────────────────────────────┐
  │               StaticShort               │
  │     Create static URL shortener pages   │
  └─────────────────────────────────────────┘
  `);
}

function showHelp() {
  console.log(`
  Usage:
    static-short [command]

  Commands:
    start       Start a development server to redirect pages
    build       Generate redirect pages (default)
    clean       Remove existing redirect pages
    help        Show this help message

  Examples:
    static-short          # Generate redirect pages
    static-short build    # Same as above
    static-short clean    # Clean redirect directories
    static-short help     # Show this help message
  `);
}

function compile() {
  const { generateRedirects } = require('./core/compile');

  console.log('🚀 Generating redirect pages...\n');

  generateRedirects();
}

function clean() {
  const { cleanRedirectPages } = require('./core/clean');

  console.log('🧹 Cleaning redirect directories...\n');

  cleanRedirectPages();
}

function startServer() {
  const { startDevServer } = require('./core/server');

  clean();
  compile();

  console.log('🌐 Starting development server...\n');

  startDevServer({ port: 8081 });
}

/*-------------------------- Main --------------------------*/

displayBanner();

// Check for argument
const command = args[0] || 'build';

switch (command.toLowerCase()) 
{
  case 'build':
    compile();
    break;

  case 'clean':
    clean();
    break;

  case 'help':
    showHelp();
    break;

  case 'start':
    startServer();
    break;

  default:
    consola.error(`Unknown command: ${command}`);
    showHelp();
    process.exit(1);
}
