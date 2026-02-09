#!/bin/bash
# Setup script for Vercel Postgres database

set -e

echo "🚀 Setting up Vercel Postgres Database"
echo "======================================"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm i -g vercel
fi

# Check if sqlx CLI is installed
if ! command -v sqlx &> /dev/null; then
    echo "❌ sqlx CLI not found. Installing..."
    cargo install sqlx-cli --no-default-features --features postgres
fi

echo "✅ All required tools installed"
echo ""

# Login to Vercel
echo "📝 Logging into Vercel..."
vercel login

echo ""
echo "🔗 Linking project to Vercel..."
vercel link

echo ""
echo "📊 Creating Postgres database..."
vercel postgres create

echo ""
echo "🔑 Please get your DATABASE_URL from Vercel Dashboard:"
echo "   1. Go to https://vercel.com/dashboard"
echo "   2. Navigate to Storage → Postgres"
echo "   3. Click on your database"
echo "   4. Go to .env.local tab"
echo "   5. Copy the POSTGRES_URL value"
echo ""

read -p "📋 Enter your DATABASE_URL: " DATABASE_URL

if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL cannot be empty"
    exit 1
fi

echo ""
echo "🔄 Running database migrations..."
cd backend
export DATABASE_URL="$DATABASE_URL"
sqlx migrate run

echo ""
echo "✅ Database setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Set DATABASE_URL in your backend deployment (Railway/Render)"
echo "   2. Deploy your backend"
echo "   3. Deploy your frontend to Vercel"
echo ""
echo "💡 See DEPLOYMENT.md for detailed deployment instructions"
