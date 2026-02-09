# Comprehensive Logging Guide

This application includes extensive logging on both backend (Rust) and frontend (Next.js) to help debug issues and monitor application behavior.

## 📁 Log File Locations

### Backend Logs
- **Location**: `backend/logs/goagenticos.log`
- **Format**: JSON with timestamps, thread IDs, file locations, and line numbers
- **Rotation**: Daily

### Frontend Logs
- **Location**: `frontend/logs/frontend.log`
- **Format**: ISO timestamp with structured JSON data
- **Contains**: API calls, component lifecycle, user actions, and errors

## 🔍 Viewing Logs in Real-Time

### Backend Logs
```bash
# From project root
tail -f backend/logs/goagenticos.log

# With colored output (if you have bat installed)
tail -f backend/logs/goagenticos.log | bat --language log

# Filter for errors only
tail -f backend/logs/goagenticos.log | grep -i error

# Filter for specific endpoint
tail -f backend/logs/goagenticos.log | grep -i "requirements"
```

### Frontend Logs
```bash
# From project root
tail -f frontend/logs/frontend.log

# Filter for API calls
tail -f frontend/logs/frontend.log | grep -i "api_request\|api_response\|api_error"

# Filter for errors only
tail -f frontend/logs/frontend.log | grep -i "ERROR"

# Filter for specific component
tail -f frontend/logs/frontend.log | grep -i "RequirementEditor"
```

### Watch Both Logs Simultaneously
```bash
# Using split terminal or tmux
# Terminal 1:
tail -f backend/logs/goagenticos.log

# Terminal 2:
tail -f frontend/logs/frontend.log

# Or use multitail if installed:
multitail backend/logs/goagenticos.log frontend/logs/frontend.log
```

## 📊 What Gets Logged

### Backend (Rust)

#### 1. Server Lifecycle
- Application startup
- Database connection
- Server shutdown
- Configuration loaded

#### 2. HTTP Requests/Responses
- Method and URL
- Status code
- Response time (latency in milliseconds)
- Request headers (when debug level)

#### 3. Database Operations
- Full SQL query details (when errors occur)
- Connection pool events
- Transaction boundaries

#### 4. Authentication
- Login attempts (success/failure)
- Token validation
- Unauthorized access attempts

#### 5. Business Logic
- **Requirement Creation**:
  - Payload received
  - Validation steps
  - Gherkin parsing
  - Step creation
  - Success/failure with IDs

- **Specification Generation**:
  - Job creation
  - Claude API calls
  - Job status updates
  - Completion/failure

#### 6. Errors
- Full error type
- Error message
- Stack trace (when available)
- Context (request ID, user ID, etc.)

### Frontend (Next.js)

#### 1. Application Lifecycle
- App start
- Page navigation
- User leaving app

#### 2. API Calls
- **Request**: Method, URL, payload
- **Response**: Status, data, duration
- **Error**: Full error details, status, response data

#### 3. Component Lifecycle
- Mount/unmount
- Renders (debug level)
- Props changes

#### 4. User Actions
- Button clicks
- Form submissions
- Navigation

#### 5. Errors
- Unhandled errors
- Promise rejections
- React Error Boundary catches
- Full stack traces

## 🎛️ Log Levels

### Backend
Set via `RUST_LOG` environment variable:

```bash
# In backend/.env
RUST_LOG=debug                    # Most verbose
RUST_LOG=info                     # Normal operations
RUST_LOG=warn                     # Warnings only
RUST_LOG=error                    # Errors only

# Per-module configuration
RUST_LOG=debug,sqlx=info,hyper=warn
```

### Frontend
Set via `NEXT_PUBLIC_LOG_LEVEL` environment variable:

```bash
# In frontend/.env.local
NEXT_PUBLIC_LOG_LEVEL=debug      # Most verbose
NEXT_PUBLIC_LOG_LEVEL=info       # Normal operations
NEXT_PUBLIC_LOG_LEVEL=warn       # Warnings only
NEXT_PUBLIC_LOG_LEVEL=error      # Errors only
```

## 🐛 Debugging Common Issues

### 1. 422 Validation Error on Requirement Creation

**Check Backend Logs:**
```bash
tail -f backend/logs/goagenticos.log | grep -A 10 "Creating new requirement"
```

Look for:
- "Validation failed for requirement" - shows validation errors
- "Gherkin validation failed" - shows Gherkin syntax issues
- Full payload that was rejected

**Check Frontend Logs:**
```bash
tail -f frontend/logs/frontend.log | grep -A 5 "API Error"
```

### 2. Authentication Issues

**Backend:**
```bash
tail -f backend/logs/goagenticos.log | grep -i "unauthorized\|login\|token"
```

**Frontend:**
```bash
tail -f frontend/logs/frontend.log | grep -i "auth\|login\|401"
```

### 3. Database Connection Issues

**Backend:**
```bash
tail -f backend/logs/goagenticos.log | grep -i "database\|sqlx\|pool"
```

### 4. Claude API Issues

**Backend:**
```bash
tail -f backend/logs/goagenticos.log | grep -i "claude\|anthropic\|specification"
```

Look for:
- API call attempts
- Response status
- Error messages from Claude API

## 📈 Log Analysis Tips

### Count Errors in Last Hour
```bash
# Backend
tail -n 10000 backend/logs/goagenticos.log | grep "ERROR" | wc -l

# Frontend
tail -n 10000 frontend/logs/frontend.log | grep "ERROR" | wc -l
```

### Find Slowest API Calls
```bash
# Backend - look for high latency values
grep "latency" backend/logs/goagenticos.log | sort -t: -k5 -n | tail -20

# Frontend - look for high duration values
grep "duration" frontend/logs/frontend.log | grep -o "duration\":[0-9]*" | sort -t: -k2 -n | tail -20
```

### Track User Actions
```bash
tail -f frontend/logs/frontend.log | grep "user_action"
```

### Monitor Specification Generation
```bash
# See the full flow
tail -f backend/logs/goagenticos.log | grep -i "specification\|claude"
```

## 🔧 Advanced Usage

### JSON Log Parsing with jq
```bash
# Pretty print backend logs (if JSON formatted)
tail -f backend/logs/goagenticos.log | jq '.'

# Filter by error type
cat backend/logs/goagenticos.log | jq 'select(.level == "ERROR")'

# Extract API errors
cat frontend/logs/frontend.log | grep api_error | jq '.'
```

### Log Rotation
Backend logs automatically rotate daily. To manually archive:

```bash
# Archive old logs
cd backend/logs
gzip goagenticos.log.2025-02-07

# Keep only last 7 days
find . -name "*.log.*.gz" -mtime +7 -delete
```

## 🚨 Error Notification

For production, consider:
1. **Log aggregation**: Send logs to ELK, Datadog, or CloudWatch
2. **Error monitoring**: Sentry, Rollbar, or similar
3. **Alerts**: Set up alerts for error spikes

## 📝 Example Log Outputs

### Backend - Successful Requirement Creation
```
2026-02-08T14:30:15.123Z  INFO goagenticos_backend::handlers::requirements: Creating new requirement project_id=abc-123 title="User Login"
2026-02-08T14:30:15.124Z  DEBUG goagenticos_backend::handlers::requirements: Requirement payload received payload={...}
2026-02-08T14:30:15.125Z  DEBUG goagenticos_backend::handlers::requirements: Validating Gherkin syntax
2026-02-08T14:30:15.126Z  DEBUG goagenticos_backend::handlers::requirements: Creating requirement in database
2026-02-08T14:30:15.145Z  INFO goagenticos_backend::handlers::requirements: Requirement created successfully requirement_id=def-456
2026-02-08T14:30:15.146Z  DEBUG goagenticos_backend::handlers::requirements: Parsing Gherkin scenario into steps
2026-02-08T14:30:15.147Z  DEBUG goagenticos_backend::handlers::requirements: Parsed 3 steps from Gherkin step_count=3
```

### Frontend - API Call with Error
```
[2026-02-08T14:30:15.100Z] INFO: API Request: POST /requirements | {"type":"api_request","method":"POST","url":"/requirements","data":{...}}
[2026-02-08T14:30:15.200Z] ERROR: API Error: POST /requirements | {"type":"api_error","method":"POST","url":"/requirements","error":{"message":"Request failed with status code 422","status":422,"data":{"error":"Invalid Gherkin..."}}}
```

## 📚 Additional Resources

- [Rust tracing documentation](https://docs.rs/tracing)
- [Next.js logging best practices](https://nextjs.org/docs)
- [Structured logging guide](https://www.structlog.org/)

---

**Last Updated**: 2026-02-08
**Version**: 1.0
