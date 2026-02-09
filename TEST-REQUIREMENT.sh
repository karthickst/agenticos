#!/bin/bash
# Test requirement creation with various scenarios

API_URL="http://localhost:3001/api/v1"

# First, login to get a token (replace with your credentials)
echo "Testing Requirement Creation"
echo "============================"
echo ""

# Test 1: Valid Gherkin with Given
echo "Test 1: Valid Gherkin starting with Given"
curl -X POST "$API_URL/projects/YOUR_PROJECT_ID/requirements" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "User Login",
    "description": "User can log in to the system",
    "gherkinScenario": "Given a user exists\nWhen they enter valid credentials\nThen they are logged in"
  }' | jq .

echo ""
echo "---"
echo ""

# Test 2: Valid Gherkin starting with When
echo "Test 2: Valid Gherkin starting with When"
curl -X POST "$API_URL/projects/YOUR_PROJECT_ID/requirements" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Quick Test",
    "description": "Testing non-Given start",
    "gherkinScenario": "When a user clicks the button\nThen something happens"
  }' | jq .

echo ""
echo "---"
echo ""

# Test 3: Invalid - no keywords
echo "Test 3: Invalid - no Gherkin keywords"
curl -X POST "$API_URL/projects/YOUR_PROJECT_ID/requirements" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Invalid Test",
    "description": "This should fail",
    "gherkinScenario": "This is just plain text without keywords"
  }' | jq .

echo ""
echo "---"
echo ""

# Test 4: Empty gherkin
echo "Test 4: Invalid - empty Gherkin"
curl -X POST "$API_URL/projects/YOUR_PROJECT_ID/requirements" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Empty Test",
    "description": "Empty gherkin",
    "gherkinScenario": ""
  }' | jq .
