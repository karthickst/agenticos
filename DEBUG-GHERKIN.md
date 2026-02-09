# 🔍 Debugging 422 Requirement Creation Error

## Common Causes

### 1. Missing Gherkin Keywords

**❌ This will FAIL (422 error):**
```
User logs in
System shows dashboard
User clicks button
```

**✅ This will WORK:**
```
Given a user exists
When they log in
Then they see the dashboard
```

### 2. Keywords Must Be at Line Start

**❌ This will FAIL:**
```
The user has an account Given
When the user logs in
Then success
```

**✅ This will WORK:**
```
Given the user has an account
When the user logs in
Then success
```

### 3. Empty Gherkin Scenario

**❌ This will FAIL:**
```
Title: User Login
Description: Test
Gherkin: (empty)
```

**✅ This will WORK:**
```
Title: User Login
Description: Test
Gherkin: Given a user
When they login
Then success
```

### 4. Case Sensitive

Keywords must match exactly (case-insensitive in our parser):
- ✅ Given, When, Then, And, But
- ✅ given, when, then, and, but
- ❌ GIVEN, WHEN, THEN (actually, these work too)

## Valid Keywords

The parser looks for these keywords at the START of each line:
- `Given` - Setup/precondition
- `When` - Action/event
- `Then` - Expected outcome
- `And` - Additional step (same type as previous)
- `But` - Exception/negative case

## Testing Your Gherkin

### Quick Test in Browser Console

Open your browser console on the requirements page and paste:

```javascript
// Test if your Gherkin is valid
const gherkin = `Given a user exists
When they log in
Then they see the dashboard`

console.log('Testing Gherkin:', gherkin)
console.log('Has keywords:', /^\s*(Given|When|Then|And|But)\s+/im.test(gherkin))
```

### Backend Validation Rules

The backend checks:
1. ✅ At least ONE line must start with Given/When/Then/And/But
2. ✅ Lines are trimmed, so leading spaces are OK
3. ✅ Empty lines are ignored
4. ❌ If NO valid lines found → 422 Error

## Examples

### ✅ VALID: Simple Login
```gherkin
Given a user exists with email "test@example.com"
When they enter their credentials
Then they are logged in
And they see the dashboard
```

### ✅ VALID: Starting with When
```gherkin
When a user clicks the login button
Then the login form appears
```

### ✅ VALID: Multiple steps
```gherkin
Given a user is on the home page
And they are not logged in
When they click the "Sign In" button
Then they see a login form
And the form has email and password fields
```

### ❌ INVALID: No keywords
```gherkin
User wants to login
System should show dashboard
This is just description text
```

### ❌ INVALID: Keywords in wrong position
```gherkin
The system Given a user exists
The user When logs in
The system Then shows dashboard
```

### ❌ INVALID: Empty
```gherkin


```

## How to Fix Your Error

1. **Check your Gherkin text** - Make sure each line starts with a keyword
2. **Use the template buttons** in the editor (+ Given, + When, + Then)
3. **Start simple** - Just one Given, one When, one Then
4. **Check the browser console** for frontend validation errors
5. **Check backend logs** for detailed error messages:
   ```bash
   tail -f backend/logs/goagenticos.log | grep -i "requirement\|gherkin"
   ```

## Debug Steps

### Step 1: Check Browser Console
Open DevTools (F12) → Console tab
Look for errors when clicking "Save Requirement"

### Step 2: Check Network Tab
DevTools → Network tab → Look for the POST request
- Check the request payload
- Check the response (should show exact error)

### Step 3: Check Backend Logs
```bash
tail -f backend/logs/goagenticos.log
```

Then try to create the requirement and watch for errors.

### Step 4: Try Minimal Example

In the Gherkin editor, try this minimal example:
```
Given a user
When they act
Then result
```

If this works, your keywords are correct. If not, check for:
- Hidden characters
- Copy-paste issues
- Text encoding problems

## Still Having Issues?

1. Restart the backend:
   ```bash
   cd backend
   cargo build
   cargo run
   ```

2. Clear browser cache and reload

3. Check that you're using the updated code (our validation changes)

4. Create a GitHub issue with:
   - The exact Gherkin text you're trying to submit
   - Screenshot of browser console
   - Backend log output

---

**Quick Fix Template:**

Copy this into your Gherkin editor:
```
Given a user exists
When they perform an action
Then they see a result
```

This should always work! ✅
