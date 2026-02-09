# 🚀 Quick Logging Reference

## Essential Commands

### View All Backend Logs
```bash
tail -f backend/logs/goagenticos.log
```

### View All Frontend Logs
```bash
tail -f frontend/logs/frontend.log
```

### View Both Logs (Split Terminal)
```bash
# Terminal 1
tail -f backend/logs/goagenticos.log

# Terminal 2
tail -f frontend/logs/frontend.log
```

## Filter by Type

### Backend Errors Only
```bash
tail -f backend/logs/goagenticos.log | grep -i error
```

### Frontend API Calls
```bash
tail -f frontend/logs/frontend.log | grep "API Request\|API Response\|API Error"
```

### Authentication Issues
```bash
# Backend
tail -f backend/logs/goagenticos.log | grep -i "unauthorized\|login\|token"

# Frontend
tail -f frontend/logs/frontend.log | grep -i "auth\|login\|401"
```

### Requirement Creation Debug
```bash
# Backend - see full flow
tail -f backend/logs/goagenticos.log | grep -i "requirement"

# Frontend - see API calls
tail -f frontend/logs/frontend.log | grep -i "requirement"
```

### Claude Specification Generation
```bash
tail -f backend/logs/goagenticos.log | grep -i "specification\|claude"
```

## Log Locations

- **Backend**: `/Users/kthiru6667/claudeprogs/goagenticos/backend/logs/goagenticos.log`
- **Frontend**: `/Users/kthiru6667/claudeprogs/goagenticos/frontend/logs/frontend.log`

## What's Logged

### ✅ Backend Logs Include
- HTTP requests with method, URL, status, latency
- Database queries and errors with full context
- Authentication attempts and failures
- Gherkin validation details
- Claude API calls and responses
- Full error stack traces with file:line numbers

### ✅ Frontend Logs Include
- All API requests/responses with timing
- Component lifecycle (mount/unmount/errors)
- User actions and interactions
- Unhandled errors and promise rejections
- Full error stack traces

## Quick Debugging

### Problem: "Request failed with status code 422"
```bash
# See what was sent
tail -100 frontend/logs/frontend.log | grep -A 10 "422"

# See backend validation
tail -100 backend/logs/goagenticos.log | grep -i "validation"
```

### Problem: Application won't start
```bash
# Backend
tail -50 backend/logs/goagenticos.log

# Frontend - check browser console and
tail -50 frontend/logs/frontend.log
```

### Problem: Slow API calls
```bash
# Backend - look for high latency
grep "latency" backend/logs/goagenticos.log | tail -20

# Frontend - look for long durations
grep "duration" frontend/logs/frontend.log | tail -20
```

## Change Log Level

### Backend
Edit `backend/.env`:
```
RUST_LOG=debug   # For detailed logs
RUST_LOG=info    # For normal logs
```

### Frontend
Edit `frontend/.env.local`:
```
NEXT_PUBLIC_LOG_LEVEL=debug  # For detailed logs
NEXT_PUBLIC_LOG_LEVEL=info   # For normal logs
```

Then restart the applications.

---
**See LOGGING.md for comprehensive documentation**
