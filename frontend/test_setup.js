/**
 * Frontend Setup Test
 * Checks if all required files and dependencies are in place
 */

const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'app/page.tsx',
  'app/login/page.tsx',
  'app/register/page.tsx',
  'app/courses/page.tsx',
  'app/courses/[id]/page.tsx',
  'app/lesson/[id]/page.tsx',
  'app/profile/page.tsx',
  'app/pricing/page.tsx',
  'app/admin/page.tsx',
  'app/admin/grading/page.tsx',
  'app/admin/builder/page.tsx',
  'components/NavBar.tsx',
  'components/Footer.tsx',
  'components/GlobalAudioPlayer.tsx',
  'components/QuestLogSidebar.tsx',
  'components/AdminSidebar.tsx',
  'contexts/AuthContext.tsx',
  'lib/api.ts',
  'app/layout.tsx',
  'app/globals.css',
  'tailwind.config.ts',
];

const requiredDirs = [
  'app',
  'components',
  'contexts',
  'lib',
  'public/assets',
];

console.log('='.repeat(60));
console.log('FRONTEND SETUP VERIFICATION');
console.log('='.repeat(60));
console.log('');

let allGood = true;

// Check directories
console.log('Checking directories...');
requiredDirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (fs.existsSync(dirPath)) {
    console.log(`[OK] ${dir}/`);
  } else {
    console.log(`[MISSING] ${dir}/`);
    allGood = false;
  }
});

console.log('');
console.log('Checking required files...');
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`[OK] ${file}`);
  } else {
    console.log(`[MISSING] ${file}`);
    allGood = false;
  }
});

// Check assets
console.log('');
console.log('Checking assets...');
const assetsDir = path.join(__dirname, 'public/assets');
if (fs.existsSync(assetsDir)) {
  const assets = fs.readdirSync(assetsDir);
  const requiredAssets = ['Logo.png', 'Mambo_Inn.mp3', 'Background_video.mp4'];
  requiredAssets.forEach(asset => {
    if (assets.includes(asset)) {
      console.log(`[OK] assets/${asset}`);
    } else {
      console.log(`[MISSING] assets/${asset}`);
      allGood = false;
    }
  });
} else {
  console.log('[MISSING] public/assets/ directory');
  allGood = false;
}

// Check package.json
console.log('');
console.log('Checking dependencies...');
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
const requiredDeps = ['next', 'react', 'react-dom', 'axios', 'framer-motion', 'aos', 'react-icons'];
requiredDeps.forEach(dep => {
  if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
    console.log(`[OK] ${dep}`);
  } else {
    console.log(`[MISSING] ${dep}`);
    allGood = false;
  }
});

console.log('');
console.log('='.repeat(60));
if (allGood) {
  console.log('[SUCCESS] All frontend files and dependencies are in place!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Start backend: cd backend && uvicorn main:app --reload');
  console.log('2. Start frontend: npm run dev');
  console.log('3. Open http://localhost:3000');
} else {
  console.log('[WARNING] Some files or dependencies are missing.');
  console.log('Please check the list above and install missing items.');
}
console.log('='.repeat(60));

process.exit(allGood ? 0 : 1);

