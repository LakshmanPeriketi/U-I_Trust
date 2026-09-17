const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.jsx')) results.push(file);
    }
  });
  return results;
}

const files = walk('c:/Users/Lakshman/UII-2/U-I_Trust/client/src');
let count = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes("localStorage.getItem('token')")) {
    const newContent = content.replaceAll("localStorage.getItem('token')", "(JSON.parse(localStorage.getItem('uandi_user') || '{}')?.token)");
    fs.writeFileSync(file, newContent);
    count++;
    console.log('Fixed:', path.basename(file));
  }
});
console.log(`Successfully patched ${count} files.`);
