#!/bin/bash

# Create deployment directory
echo "Creating deployment package..."
rm -rf deploy-package
mkdir -p deploy-package

# Copy only necessary files
echo "Copying application files..."
cp -r app deploy-package/
cp -r components deploy-package/
cp -r contexts deploy-package/
cp -r lib deploy-package/
cp -r middleware deploy-package/
cp -r public deploy-package/
cp -r types deploy-package/

# Copy configuration files
echo "Copying configuration files..."
cp package.json deploy-package/
cp package-lock.json deploy-package/
cp next.config.js deploy-package/
cp tailwind.config.ts deploy-package/
cp tsconfig.json deploy-package/
cp postcss.config.mjs deploy-package/
cp middleware.ts deploy-package/
cp next-env.d.ts deploy-package/
cp .eslintrc.json deploy-package/
cp .env.local deploy-package/

# Create .gitignore for production
cat > deploy-package/.gitignore << 'EOF'
node_modules/
.next/
.env.local
npm-debug.log*
.DS_Store
*.log
EOF

echo "✅ Deployment package ready in ./deploy-package/"
echo "📦 Package size: $(du -sh deploy-package | cut -f1)"