const fs = require('fs');
const path = require('path');

const openNextDir = path.join(process.cwd(), '.open-next');
const assetsDir = path.join(openNextDir, 'assets');

console.log('🚀 Running post-build-cf script...');

// 1. Copy assets to the root of .open-next
if (fs.existsSync(assetsDir)) {
    console.log('  - Copying assets...');
    const files = fs.readdirSync(assetsDir);
    files.forEach(file => {
        const src = path.join(assetsDir, file);
        const dest = path.join(openNextDir, file);
        
        if (fs.lstatSync(src).isDirectory()) {
            fs.cpSync(src, dest, { recursive: true });
        } else {
            fs.copyFileSync(src, dest);
        }
    });
}

// 2. Create _routes.json
console.log('  - Creating _routes.json...');
const routes = {
    version: 1,
    include: ["/*"],
    exclude: ["/_next/static/*", "/images/*", "/favicon.ico"]
};
fs.writeFileSync(
    path.join(openNextDir, '_routes.json'), 
    JSON.stringify(routes, null, 2)
);

// 3. Move worker.js to _worker.js
const oldWorker = path.join(openNextDir, 'worker.js');
const newWorker = path.join(openNextDir, '_worker.js');

if (fs.existsSync(oldWorker)) {
    console.log('  - Renaming worker.js to _worker.js...');
    fs.renameSync(oldWorker, newWorker);
} else {
    console.log('  - worker.js already moved or not found.');
}

console.log('✅ Post-build-cf complete!');
