const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(__dirname + '/src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace various URL concatenation functions
    let newContent = content.replace(/path\.startsWith\("http"\) \? path : `\$\{API_URL\}\/\$\{path\.replace\(\/\\\\\/g, "\/"\)\}`/g, 'path');
    newContent = newContent.replace(/url\.startsWith\("http"\) \? url : `\$\{API_URL\}\/\$\{url\}`/g, 'url');
    newContent = newContent.replace(/path\.startsWith\("http"\) \? path : `\$\{API_URL\}\/\$\{path\}`/g, 'path');
    newContent = newContent.replace(/cleanPath\.startsWith\("http"\) \? cleanPath : `\$\{API_URL\}\/\$\{cleanPath\}`/g, 'cleanPath');

    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log('Updated ' + filePath);
    }
  }
});
