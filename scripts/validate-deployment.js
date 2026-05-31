#!/usr/bin/env node

/**
 * Pre-deployment validation checklist for Cloudflare Workers
 * Verifies all required configuration before building/deploying
 */

const fs = require('fs');
const path = require('path');

const checks = {
  passed: [],
  failed: [],
  warnings: [],
};

console.log('\n🔍 Validating Cloudflare Workers Deployment Setup...\n');

// Check 1: wrangler.toml exists
const wranglerPath = path.join(__dirname, '../wrangler.toml');
if (fs.existsSync(wranglerPath)) {
  checks.passed.push('✓ wrangler.toml exists');
  const wranglerContent = fs.readFileSync(wranglerPath, 'utf-8');
  if (wranglerContent.includes('nodejs_compat')) {
    checks.passed.push('✓ nodejs_compat flag configured');
  } else {
    checks.warnings.push('⚠ nodejs_compat flag not found in wrangler.toml');
  }
  if (wranglerContent.includes('2024-09-23') || wranglerContent.includes('compatibility_date')) {
    checks.passed.push('✓ Compatibility date configured');
  }
} else {
  checks.failed.push('✗ wrangler.toml not found');
}

// Check 2: open-next.config.ts exists
const openNextPath = path.join(__dirname, '../open-next.config.ts');
if (fs.existsSync(openNextPath)) {
  checks.passed.push('✓ open-next.config.ts exists');
} else {
  checks.failed.push('✗ open-next.config.ts not found (required for opennextjs-cloudflare)');
}

// Check 3: Dependencies installed
const nodeModulesPath = path.join(__dirname, '../node_modules/@opennextjs/cloudflare');
if (fs.existsSync(nodeModulesPath)) {
  checks.passed.push('✓ @opennextjs/cloudflare installed');
} else {
  checks.warnings.push('⚠ @opennextjs/cloudflare not installed - run npm install');
}

const wranglerModulePath = path.join(__dirname, '../node_modules/wrangler');
if (fs.existsSync(wranglerModulePath)) {
  checks.passed.push('✓ wrangler CLI installed');
} else {
  checks.warnings.push('⚠ wrangler not installed - run npm install');
}

// Check 4: Environment variables
const envPath = path.join(__dirname, '../.env.local');
const envExamplePath = path.join(__dirname, '../.env.example');

if (!fs.existsSync(envPath)) {
  checks.warnings.push('⚠ .env.local not found - create from .env.example');
} else {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const requiredEnvVars = [
    'DATABASE_URL',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'RESEND_API_KEY',
  ];

  requiredEnvVars.forEach(envVar => {
    if (envContent.includes(envVar) && !envContent.includes(`${envVar}=`)) {
      checks.warnings.push(`⚠ ${envVar} not set in .env.local`);
    } else if (envContent.includes(`${envVar}=`)) {
      checks.passed.push(`✓ ${envVar} configured`);
    }
  });
}

// Check 5: Prisma setup
const prismaPath = path.join(__dirname, '../prisma/schema.prisma');
if (fs.existsSync(prismaPath)) {
  checks.passed.push('✓ Prisma schema exists');
} else {
  checks.failed.push('✗ Prisma schema not found');
}

// Check 6: next.config.ts doesn't have problematic settings
const nextConfigPath = path.join(__dirname, '../next.config.ts');
if (fs.existsSync(nextConfigPath)) {
  const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf-8');
  if (!nextConfigContent.includes('experimental: { turbopack: true }') &&
      !nextConfigContent.includes('turbopack: true')) {
    checks.passed.push('✓ Turbopack not enabled (good for Workers)');
  }
}

// Check 7: Package scripts
const packagePath = path.join(__dirname, '../package.json');
if (fs.existsSync(packagePath)) {
  const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  if (packageContent.scripts && packageContent.scripts['build:workers']) {
    checks.passed.push('✓ build:workers script configured');
  } else {
    checks.warnings.push('⚠ build:workers script not found in package.json');
  }
  if (packageContent.scripts && packageContent.scripts['deploy:workers']) {
    checks.passed.push('✓ deploy:workers script configured');
  }
}

// Check 8: Git status
const execSync = require('child_process').execSync;
try {
  const gitStatus = execSync('git status --short', { stdio: 'pipe' }).toString();
  if (gitStatus.includes('package.json') || gitStatus.includes('wrangler.toml')) {
    checks.warnings.push('⚠ Uncommitted changes in deployment config files - commit before deploying');
  }
} catch {
  checks.warnings.push('⚠ Not a git repository or git not found');
}

// Print results
console.log('PASSED CHECKS:');
checks.passed.forEach(msg => console.log('  ' + msg));

if (checks.warnings.length > 0) {
  console.log('\nWARNINGS:');
  checks.warnings.forEach(msg => console.log('  ' + msg));
}

if (checks.failed.length > 0) {
  console.log('\nFAILED CHECKS (Critical):');
  checks.failed.forEach(msg => console.log('  ' + msg));
}

console.log('\n' + '='.repeat(60));

if (checks.failed.length > 0) {
  console.log('\n❌ Deployment validation FAILED');
  console.log('Fix the critical issues above before deploying.\n');
  process.exit(1);
} else if (checks.warnings.length > 0) {
  console.log('\n⚠️  Deployment validation passed with warnings');
  console.log('Review the warnings above before deploying.\n');
  process.exit(0);
} else {
  console.log('\n✅ All checks passed! Ready to deploy.\n');
  process.exit(0);
}
