const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Find all JavaScript/TypeScript files in the project
exec('find . -type f -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx"', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error finding files: ${error}`);
    return;
  }
  
  const files = stdout.trim().split('\n');
  
  files.forEach(file => {
    // Skip node_modules and dist directories
    if (file.includes('node_modules') || file.includes('dist') || file.includes('scripts/fix-deprecated-apis.js')) {
      return;
    }
    
    const filePath = path.resolve(file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Check if the file contains the deprecated API
    if (content.includes('util._extend')) {
      console.log(`Fixing deprecated API in ${file}`);
      
      // Replace the deprecated API with Object.assign
      const updatedContent = content.replace(/util\._extend\(([^)]+)\)/g, 'Object.assign($1)');
      
      // Write the updated content back to the file
      fs.writeFileSync(filePath, updatedContent);
      
      console.log(`Fixed ${file}`);
    }
  });
  
  console.log('Finished replacing deprecated util._extend API calls');
});
