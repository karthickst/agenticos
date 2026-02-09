#!/bin/bash

# Deployment Readiness Checker for GoAgenticOS
# This script checks if your project is ready for Vercel deployment

set -e

echo "🔍 Checking deployment readiness..."
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Check Node.js
echo "📦 Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} Node.js installed: $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js not found. Install from https://nodejs.org"
    ERRORS=$((ERRORS + 1))
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓${NC} npm installed: $NPM_VERSION"
else
    echo -e "${RED}✗${NC} npm not found"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# Check Rust
echo "🦀 Checking Rust..."
if command -v cargo &> /dev/null; then
    CARGO_VERSION=$(cargo --version)
    echo -e "${GREEN}✓${NC} Cargo installed: $CARGO_VERSION"
else
    echo -e "${RED}✗${NC} Cargo not found. Install from https://rustup.rs"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# Check Frontend
echo "⚛️  Checking Frontend..."
if [ -f "frontend/package.json" ]; then
    echo -e "${GREEN}✓${NC} frontend/package.json exists"
else
    echo -e "${RED}✗${NC} frontend/package.json not found"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "frontend/next.config.js" ]; then
    echo -e "${GREEN}✓${NC} frontend/next.config.js exists"
else
    echo -e "${RED}✗${NC} frontend/next.config.js not found"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "frontend/.env.example" ]; then
    echo -e "${GREEN}✓${NC} frontend/.env.example exists"
else
    echo -e "${YELLOW}⚠${NC} frontend/.env.example not found (optional)"
    WARNINGS=$((WARNINGS + 1))
fi

# Check if frontend dependencies are installed
if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Frontend dependencies installed"
else
    echo -e "${YELLOW}⚠${NC} Frontend dependencies not installed. Run: cd frontend && npm install"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# Check Backend
echo "🦀 Checking Backend..."
if [ -f "backend/Cargo.toml" ]; then
    echo -e "${GREEN}✓${NC} backend/Cargo.toml exists"
else
    echo -e "${RED}✗${NC} backend/Cargo.toml not found"
    ERRORS=$((ERRORS + 1))
fi

if [ -d "backend/migrations" ]; then
    MIGRATION_COUNT=$(ls -1 backend/migrations/*.sql 2>/dev/null | wc -l)
    echo -e "${GREEN}✓${NC} Found $MIGRATION_COUNT database migrations"
else
    echo -e "${RED}✗${NC} backend/migrations directory not found"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "backend/.env.example" ]; then
    echo -e "${GREEN}✓${NC} backend/.env.example exists"
else
    echo -e "${YELLOW}⚠${NC} backend/.env.example not found (optional)"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# Check Vercel config
echo "▲ Checking Vercel Configuration..."
if [ -f "vercel.json" ]; then
    echo -e "${GREEN}✓${NC} vercel.json exists"
else
    echo -e "${YELLOW}⚠${NC} vercel.json not found"
    WARNINGS=$((WARNINGS + 1))
fi

if [ -f ".vercelignore" ]; then
    echo -e "${GREEN}✓${NC} .vercelignore exists"
else
    echo -e "${YELLOW}⚠${NC} .vercelignore not found (optional)"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# Check deployment guides
echo "📚 Checking Deployment Documentation..."
if [ -f "VERCEL-DEPLOYMENT-GUIDE.md" ]; then
    echo -e "${GREEN}✓${NC} VERCEL-DEPLOYMENT-GUIDE.md exists"
else
    echo -e "${YELLOW}⚠${NC} VERCEL-DEPLOYMENT-GUIDE.md not found"
    WARNINGS=$((WARNINGS + 1))
fi

if [ -f "DEPLOY.md" ]; then
    echo -e "${GREEN}✓${NC} DEPLOY.md exists"
else
    echo -e "${YELLOW}⚠${NC} DEPLOY.md not found"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# Try building frontend
echo "🏗️  Testing Frontend Build..."
echo "Running: cd frontend && npm run build"
if (cd frontend && npm run build > /dev/null 2>&1); then
    echo -e "${GREEN}✓${NC} Frontend builds successfully"
else
    echo -e "${RED}✗${NC} Frontend build failed. Run 'cd frontend && npm run build' to see errors"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# Summary
echo "================================"
echo "📊 Summary"
echo "================================"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}🎉 All checks passed!${NC} Your project is ready for Vercel deployment."
    echo ""
    echo "Next steps:"
    echo "1. Read DEPLOY.md for quick deploy commands"
    echo "2. Or read VERCEL-DEPLOYMENT-GUIDE.md for detailed guide"
    echo "3. Deploy backend to Railway: cd backend && railway init && railway up"
    echo "4. Deploy frontend to Vercel: cd frontend && vercel --prod"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Found $WARNINGS warning(s)${NC}"
    echo "Your project should deploy, but check warnings above."
    exit 0
else
    echo -e "${RED}❌ Found $ERRORS error(s) and $WARNINGS warning(s)${NC}"
    echo "Please fix the errors above before deploying."
    exit 1
fi
