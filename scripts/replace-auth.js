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
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('getServerSession') || content.includes('getEdgeSession')) {
        let original = content;
        const isApiRoute = file === 'route.ts';

        if (isApiRoute) {
          // Ensure NextRequest is imported if needed
          if (!content.includes('NextRequest') && content.includes('NextResponse')) {
            content = content.replace('NextResponse', 'NextResponse, NextRequest');
          }

          // Regex to find any async function or standard function and its parameters
          // e.g. async function checkAdminAuth() or export async function GET(request: NextRequest)
          const funcRegex = /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/g;
          let match;
          let functionsList = [];
          
          while ((match = funcRegex.exec(content)) !== null) {
            const funcName = match[1];
            const paramsText = match[2];
            const startIdx = match.index;
            functionsList.push({ funcName, paramsText, startIdx });
          }

          // Sort functions by start index descending so we replace from bottom to top
          functionsList.sort((a, b) => b.startIdx - a.startIdx);

          for (let i = 0; i < functionsList.length; i++) {
            const currentFunc = functionsList[i];
            const funcStart = currentFunc.startIdx;
            // Find the end of the function block (either next function start or end of file)
            const funcEnd = i > 0 ? functionsList[i - 1].startIdx : content.length;
            
            let funcBlock = content.slice(funcStart, funcEnd);
            
            if (funcBlock.includes('getServerSession') || funcBlock.includes('getEdgeSession(')) {
              // Determine if there is a request/req parameter in the function signature
              let paramName = '';
              const paramMatch = currentFunc.paramsText.match(/(\w+)\s*:\s*(NextRequest|Request)/i) || 
                                 currentFunc.paramsText.match(/^(request|req|_request|r)\b/i);
              if (paramMatch) {
                paramName = paramMatch[1];
              }

              // Replace getServerSession(authOptions) with the correct call
              const replacement = paramName ? `getEdgeSession(${paramName})` : `getEdgeSession()`;
              funcBlock = funcBlock.replace(/getServerSession\s*\(\s*authOptions\s*\)/g, replacement);
              funcBlock = funcBlock.replace(/getEdgeSession\(\s*(request|req)\s*\)/g, replacement);
              
              content = content.slice(0, funcStart) + funcBlock + content.slice(funcEnd);
            }
          }

          // Final safety fallback for any getServerSession calls outside functions
          content = content.replace(/getServerSession\s*\(\s*authOptions\s*\)/g, 'getEdgeSession()');
        } else {
          // Page/Component - use cookie-based getEdgeSession()
          content = content.replace(/getServerSession\s*\(\s*authOptions\s*\)/g, 'getEdgeSession()');
        }

        // Clean imports
        content = content.replace(
          /import\s+\{\s*getServerSession\s*\}\s+from\s+["']next-auth(\/next)?["'];?/g,
          'import { getEdgeSession } from "@/lib/auth-helper";'
        );
        content = content.replace(/import\s+\{\s*authOptions\s*\}\s+from\s+["']@\/lib\/auth["'];?\r?\n?/g, '');
        content = content.replace(/import\s+authOptions\s+from\s+["']@\/lib\/auth["'];?\r?\n?/g, '');

        if (content !== original) {
          fs.writeFileSync(fullPath, content, 'utf8');
          console.log(`Optimized Auth (v3): ${path.relative(path.join(__dirname, '..'), fullPath)}`);
        }
      }
    }
  }
}

walk(directory);
console.log('Finished refactoring authentication handlers (v3).');
