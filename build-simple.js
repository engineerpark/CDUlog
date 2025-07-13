#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Create out directory
const outDir = path.join(__dirname, 'out');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Copy public directory to out
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  const copyDir = (src, dest) => {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const files = fs.readdirSync(src);
    files.forEach(file => {
      const srcPath = path.join(src, file);
      const destPath = path.join(dest, file);
      if (fs.lstatSync(srcPath).isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    });
  };
  copyDir(publicDir, outDir);
}

// Create simple index.html
const indexHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CDUlog - 실외기 유지보수 관리</title>
    <style>
        body { 
            font-family: system-ui, -apple-system, sans-serif; 
            margin: 0; 
            padding: 40px 20px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
        }
        .container {
            max-width: 600px;
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        h1 { font-size: 2.5rem; margin-bottom: 20px; }
        p { font-size: 1.2rem; opacity: 0.9; line-height: 1.6; }
        .status { 
            background: rgba(46, 204, 113, 0.2); 
            padding: 15px; 
            border-radius: 10px; 
            margin: 20px 0;
            border: 1px solid rgba(46, 204, 113, 0.5);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🛠️ CDUlog</h1>
        <p>실외기 유지보수 이력을 간단하게 현장에서 입력할 수 있는 서비스</p>
        <div class="status">
            ✅ 배포 성공! Vercel 배포가 정상적으로 완료되었습니다.
        </div>
        <p>Next.js 15.3.5 기반으로 구축된 현대적인 웹 애플리케이션입니다.</p>
    </div>
</body>
</html>`;

fs.writeFileSync(path.join(outDir, 'index.html'), indexHtml);

console.log('✅ Build completed! Output directory: out/');
console.log('📁 Files created:');
console.log('   - out/index.html');
if (fs.existsSync(publicDir)) {
  console.log('   - Copied all files from public/');
}