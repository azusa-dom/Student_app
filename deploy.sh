#!/bin/bash
cd /workspaces/Student_app

echo "Adding files to git..."
git add .

echo "Committing changes..."
git commit -m "fix: add missing StudentRoutes and ParentRoutes components"

echo "Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "Build successful! Deploying..."
    npm run deploy
    echo "Deployment complete!"
else
    echo "Build failed!"
    exit 1
fi

echo "Opening website..."
"$BROWSER" https://azusa-dom.github.io/Student_app/