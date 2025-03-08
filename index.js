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


/*-------------------------- Main --------------------------*/

displayBanner();

// Check for argument
const command = args[0] || 'build';


switch (command.toLowerCase()) 
{
  case 'build':
    consola.start('Generating redirect pages...');
    const { generateRedirects } = require('./core/compile');
    generateRedirects();
    break;

  case 'clean':
    consola.start('Cleaning redirect directories...');
    require('./core/clean');
    break;

  case 'help':
    showHelp();
    break;

  default:
    consola.error(`Unknown command: ${command}`);
    showHelp();
    process.exit(1);
}
