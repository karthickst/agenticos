# 📝 Gherkin Requirements Guide

## ✅ Fixed: Case-Insensitive Keywords

The backend now accepts Gherkin keywords in **any case**:
- ✅ `Given`, `given`, `GIVEN` all work
- ✅ `When`, `when`, `WHEN` all work
- ✅ `Then`, `then`, `THEN` all work
- ✅ `And`, `and`, `AND` all work
- ✅ `But`, `but`, `BUT` all work

## Quick Start

### Minimum Valid Requirement

```gherkin
Given a user
When they act
Then result
```

This is the **minimum** valid Gherkin that will be accepted.

## Common Issues & Solutions

### ❌ Error: "No valid Gherkin steps found"

**Problem**: Your text doesn't contain any Gherkin keywords

**Bad Example:**
```
User wants to login
System shows dashboard
End of scenario
```

**Good Example:**
```
Given a user wants to login
When they enter credentials
Then system shows dashboard
```

### ❌ Error: "Request failed with status code 422"

**Common Causes:**

1. **No keywords at all**
   ```
   ❌ This is just plain text
   ✅ Given this is a step
   ```

2. **Keywords in middle of line**
   ```
   ❌ The user Given has an account
   ✅ Given the user has an account
   ```

3. **Empty Gherkin field**
   ```
   ❌ (blank)
   ✅ Given something
   ```

## Valid Patterns

### Pattern 1: Standard BDD
```gherkin
Given a user is logged in
And they are on the dashboard
When they click the "Logout" button
Then they are logged out
And they see the login page
```

### Pattern 2: Starting with When
```gherkin
When a user clicks the signup button
Then they see the registration form
```

### Pattern 3: Using domain attributes
```gherkin
Given a user exists with email ${User.email}
When they login with password ${User.password}
Then they access the ${User.role} dashboard
```

### Pattern 4: Multiple scenarios
```gherkin
Given a user is not authenticated
When they try to access protected page
Then they are redirected to login

And when they enter valid credentials
Then they can access the protected page
```

## Templates

### Login Scenario
```gherkin
Given a user account exists with email "test@example.com"
And the password is "SecurePass123"
When the user enters their credentials
And clicks the "Sign In" button
Then they are successfully logged in
And redirected to the dashboard
```

### Create Resource
```gherkin
Given a user is logged in as admin
When they navigate to the create page
And fill in the required fields
And click "Save"
Then the resource is created
And they see a success message
```

### Error Handling
```gherkin
Given a user is on the login page
When they enter an invalid email format
And click "Submit"
Then they see an error message
But the form is not submitted
```

### API Integration
```gherkin
Given the API is available
When a POST request is sent to /api/users
And the request body contains valid user data
Then the response status is 201 Created
And the response contains the new user ID
```

## Pro Tips

### 1. Use the Template Buttons
Click **+ Given**, **+ When**, **+ Then** in the editor to insert keywords quickly.

### 2. One Action Per Step
```gherkin
❌ When they login and see dashboard and click button
✅ When they login
   And see dashboard
   And click button
```

### 3. Be Specific
```gherkin
❌ Given setup
✅ Given a user account with admin privileges
```

### 4. Use Domain Attributes
Reference your domains:
```gherkin
Given a ${User.name} exists
When they update their ${User.email}
Then the ${User.profile} is saved
```

### 5. Keep It Readable
```gherkin
Given a user named "Alice" with role "admin"
When Alice logs into the system
Then Alice sees the admin dashboard
And Alice can access all management features
```

## Testing Your Gherkin

### In Browser Console
```javascript
const gherkin = `Given a user
When they act
Then result`

// Should be true if valid
console.log(/^\s*(Given|When|Then|And|But)\s+/im.test(gherkin))
```

### Backend Test
Check logs after submitting:
```bash
tail -f backend/logs/goagenticos.log | grep -i "gherkin\|validation"
```

## Keywords Reference

| Keyword | Purpose | Example |
|---------|---------|---------|
| `Given` | Setup/Precondition | `Given a user exists` |
| `When` | Action/Event | `When they click login` |
| `Then` | Expected Result | `Then they see dashboard` |
| `And` | Additional step (same type) | `And they see welcome message` |
| `But` | Exception/Alternative | `But they cannot access admin` |

## FAQ

### Q: Can I start with "When" instead of "Given"?
**A:** Yes! Any keyword works now. We removed the strict "must start with Given" rule.

### Q: Are keywords case-sensitive?
**A:** No! Use `given`, `Given`, or `GIVEN` - all work the same.

### Q: Can I have blank lines?
**A:** Yes, blank lines are ignored. Only lines with keywords matter.

### Q: What's the minimum requirement?
**A:** At least ONE line with a Gherkin keyword (Given/When/Then/And/But).

### Q: Can I use special characters?
**A:** Yes! Use quotes, numbers, symbols in your step text:
```gherkin
Given a user with email "test+123@example.com"
When they enter password "P@ssw0rd!"
Then status code is 200
```

## Still Getting 422 Errors?

1. **Restart backend** with latest code
   ```bash
   cd backend
   cargo build
   cargo run
   ```

2. **Check your text** - does it have ANY of these words at the start of a line?
   - Given, When, Then, And, But

3. **Try the minimum example:**
   ```
   Given a
   When b
   Then c
   ```

4. **Check logs:**
   ```bash
   tail -f backend/logs/goagenticos.log
   ```

5. **Contact support** with:
   - Your exact Gherkin text
   - Browser console screenshot
   - Backend log output

---

**Quick Reference:**
```gherkin
Given [setup/precondition]
When [action/event]
Then [expected result]
And [additional same-type step]
But [exception/alternative]
```

✅ Case-insensitive
✅ Any keyword can be first
✅ Blank lines OK
✅ Special characters OK
