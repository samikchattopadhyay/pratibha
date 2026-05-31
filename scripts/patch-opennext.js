const fs = require('fs');
const path = require('path');

const targetFile = path.join(
  __dirname,
  '../node_modules/@opennextjs/aws/dist/build/copyTracedFiles.js'
);

if (fs.existsSync(targetFile)) {
  let content = fs.readFileSync(targetFile, 'utf8');

  // Check if patch is already applied
  if (!content.includes('cpSync(resolvedSrc')) {
    console.log('🩹 Patching OpenNext copyTracedFiles.js to fallback on Windows symlink copy...');

    const originalBlock = `            catch (e) {
                if (e.code !== "EEXIST") {
                    throw e;
                }
            }`;

    const patchedBlock = `            catch (e) {
                if (e.code !== "EEXIST") {
                    const resolvedSrc = path.resolve(path.dirname(from), symlink);
                    if (existsSync(resolvedSrc)) {
                        if (statSync(resolvedSrc).isDirectory()) {
                            cpSync(resolvedSrc, to, { recursive: true });
                        } else {
                            copyFileSync(resolvedSrc, to);
                        }
                    } else {
                        throw e;
                    }
                }
            }`;

    if (content.includes(originalBlock)) {
      content = content.replace(originalBlock, patchedBlock);
      fs.writeFileSync(targetFile, content, 'utf8');
      console.log('✅ OpenNext copyTracedFiles.js patched successfully.');
    } else {
      console.warn('⚠️ Could not find the original symlink block to patch. OpenNext version might have changed.');
    }
  } else {
    console.log('✅ OpenNext copyTracedFiles.js patch is already applied.');
  }
} else {
  console.warn('⚠️ OpenNext copyTracedFiles.js not found in node_modules.');
}
