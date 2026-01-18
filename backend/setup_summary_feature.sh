#!/bin/bash
# Setup script for OpenAI review summary feature

set -e

echo "==================================="
echo "OpenAI Summary Feature Setup"
echo "==================================="
echo ""

# Check if we're in the right directory
if [ ! -f "firebase.json" ]; then
    echo "❌ Error: Please run this script from the backend directory"
    exit 1
fi

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Error: Firebase CLI not installed"
    echo "Install with: npm install -g firebase-tools"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f "functions/.env" ]; then
    echo "📝 Creating .env file from template..."
    cp functions/.env.example functions/.env
    echo "✅ Created functions/.env"
    echo "⚠️  Please edit functions/.env and add your OpenAI API key"
else
    echo "✅ .env file already exists"
fi

# Install Python dependencies
echo ""
echo "📦 Installing Python dependencies..."
cd functions
pip install -q openai==1.59.5
echo "✅ OpenAI package installed"
cd ..

# Prompt for secret setup
echo ""
echo "🔐 Secret Management Setup"
echo ""
read -p "Do you want to set up the OPENAI_API_KEY secret in Firebase now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Setting up Firebase secret..."
    firebase functions:secrets:set OPENAI_API_KEY
    echo "✅ Secret configured"
else
    echo "⏭️  Skipped secret setup"
    echo "   Run manually: firebase functions:secrets:set OPENAI_API_KEY"
fi

# Summary
echo ""
echo "==================================="
echo "✅ Setup Complete!"
echo "==================================="
echo ""
echo "Next steps:"
echo "1. Edit functions/.env with your OpenAI API key (for local dev)"
echo "2. Configure Firebase secret: firebase functions:secrets:set OPENAI_API_KEY"
echo "3. Deploy functions: firebase deploy --only functions"
echo ""
echo "Documentation:"
echo "- Setup: SUMMARY_FEATURE.md"
echo "- Secrets: SECRETS_MANAGEMENT.md"
echo ""
