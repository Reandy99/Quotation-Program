#!/bin/bash
# QuoteFlow Creative - Quick Deployment Fix Script
# This script fixes the critical deployment issues identified in the audit

set -e

echo "🔧 QuoteFlow Creative - Deployment Fix Script"
echo "=============================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

echo "📦 Step 1: Installing Netlify Next.js plugin..."
npm install --save-dev @netlify/plugin-nextjs

echo ""
echo "📝 Step 2: Updating netlify.toml configuration..."
cat > netlify.toml << 'EOF'
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[functions]
  node_bundler = "esbuild"
EOF

echo ""
echo "🔧 Step 3: Fixing dev server configuration..."
# Use Node.js to update package.json
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.scripts.dev = 'next dev';
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
"

echo ""
echo "✅ Configuration fixes applied!"
echo ""
echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. Commit and push these changes:"
echo "   git add netlify.toml package.json package-lock.json"
echo "   git commit -m 'fix: Add Netlify Next.js plugin and fix configuration'"
echo "   git push"
echo ""
echo "2. Configure environment variables in Netlify Dashboard:"
echo "   - Go to: Site Settings → Environment Variables"
echo "   - Add: NEXT_PUBLIC_SUPABASE_URL"
echo "   - Add: NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo ""
echo "3. Verify database migrations in Supabase:"
echo "   - Go to: SQL Editor"
echo "   - Run: supabase/schema.sql"
echo "   - Run: supabase/migrations/002_clients_invoices.sql"
echo "   - Run: supabase/migrations/003_follow_ups.sql"
echo "   - Run: supabase/migrations/20260502_add_invoice_branding_fields.sql"
echo ""
echo "4. Trigger a new deploy in Netlify"
echo ""
echo "5. Test the site:"
echo "   - Visit: https://rndpro.netlify.app/signup"
echo "   - Create a test account"
echo "   - Verify dashboard loads"
echo "   - Test creating a lead"
echo ""
echo "✨ Done! Your deployment should work correctly after these steps."
