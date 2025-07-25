const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create extension build directory
const buildDir = path.join(__dirname, 'extension-build');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// Copy all files from public to build directory
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      try {
        // Read the source file
        const content = fs.readFileSync(srcPath);
        
        // Write to destination
        fs.writeFileSync(destPath, content);
        
        // Validate the copy
        const destContent = fs.readFileSync(destPath);
        if (content.length !== destContent.length) {
          console.error(`Warning: File ${entry.name} may not have been copied correctly. Source size: ${content.length}, Destination size: ${destContent.length}`);
        } else {
          console.log(`Successfully copied ${entry.name} (${content.length} bytes)`);
        }
      } catch (error) {
        console.error(`Error copying file ${entry.name}:`, error);
      }
    }
  }
}

// Copy public directory contents to build directory
const publicDir = path.join(__dirname, 'public');
copyDir(publicDir, buildDir);

// Verify critical files
const criticalFiles = [
  'background.js',
  'popup.js',
  'solana-wallet.js',
  'gh-pages-bridge.js',
  'wallet-connect-script.js'
];

console.log('\nVerifying critical files:');
criticalFiles.forEach(file => {
  const filePath = path.join(buildDir, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    if (stats.size > 0) {
      console.log(`✓ ${file} (${stats.size} bytes)`);
    } else {
      console.error(`✗ ${file} exists but is empty (0 bytes)`);
    }
  } else {
    console.error(`✗ ${file} is missing from build directory`);
  }
});

console.log('\nExtension files copied to build directory!');
console.log('Extension is ready in the "extension-build" folder.');
console.log('\nTo load the extension in Chrome:');
console.log('1. Open Chrome and navigate to chrome://extensions/');
console.log('2. Enable "Developer mode" (toggle in the top right)');
console.log('3. Click "Load unpacked" and select the "extension-build" folder');
console.log('\nTo load the extension in Firefox:');
console.log('1. Open Firefox and navigate to about:debugging#/runtime/this-firefox');
console.log('2. Click "Load Temporary Add-on..." and select any file in the "extension-build" folder'); 