#!/bin/bash

# Student App Deployment Script
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