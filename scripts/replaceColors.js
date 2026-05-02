const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, '..', 'src', 'components');

function replaceColorsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace arbitrary Tailwind values with theme classes
  content = content.replace(/from-\[\#0a4f49\]/g, 'from-primary');
  content = content.replace(/via-\[\#0a4f49\]/g, 'via-primary');
  content = content.replace(/to-\[\#0a4f49\]/g, 'to-primary');
  content = content.replace(/bg-\[\#0a4f49\]/g, 'bg-primary');
  content = content.replace(/text-\[\#0a4f49\]/g, 'text-primary');
  content = content.replace(/border-\[\#0a4f49\]/g, 'border-primary');
  
  // Secondary color replacements (#14b8a6)
  content = content.replace(/from-\[\#14b8a6\]/g, 'from-secondary');
  content = content.replace(/via-\[\#14b8a6\]/g, 'via-secondary');
  content = content.replace(/to-\[\#14b8a6\]/g, 'to-secondary');
  content = content.replace(/bg-\[\#14b8a6\]/g, 'bg-secondary');
  content = content.replace(/text-\[\#14b8a6\]/g, 'text-secondary');
  content = content.replace(/border-\[\#14b8a6\]/g, 'border-secondary');

  // Primary light replacements (#0d6b63)
  content = content.replace(/from-\[\#0d6b63\]/g, 'from-primary-light');
  content = content.replace(/via-\[\#0d6b63\]/g, 'via-primary-light');
  content = content.replace(/to-\[\#0d6b63\]/g, 'to-primary-light');
  content = content.replace(/bg-\[\#0d6b63\]/g, 'bg-primary-light');
  
  // Primary dark replacements (#073d38)
  content = content.replace(/from-\[\#073d38\]/g, 'from-primary-dark');
  content = content.replace(/via-\[\#073d38\]/g, 'via-primary-dark');
  content = content.replace(/to-\[\#073d38\]/g, 'to-primary-dark');
  content = content.replace(/bg-\[\#073d38\]/g, 'bg-primary-dark');

  fs.writeFileSync(filePath, content, 'utf8');
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      replaceColorsInFile(fullPath);
    }
  }
}

processDirectory(directory);
console.log('Colors replaced successfully!');
