const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, '../src/app');

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (file === 'page.tsx' || file === 'route.ts') {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (!content.includes("runtime = 'edge'") && !content.includes('runtime = "edge"')) {
        const edgeExport = "export const runtime = 'edge';";
        
        // Handle "use client" directive which must be the very first statement
        const useClientRegex = /^[\ufeff\s]*('|")use client('|");?\s*/i;
        const match = content.match(useClientRegex);
        
        if (match) {
          const insertPosition = match[0].length;
          content = content.slice(0, insertPosition) + `\n${edgeExport}\n` + content.slice(insertPosition);
        } else {
          content = `${edgeExport}\n\n${content}`;
        }
        
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Patched: ${path.relative(path.join(__dirname, '..'), fullPath)}`);
      }
    }
  }
}

walk(directory);
console.log('Finished injecting edge runtime configuration.');
