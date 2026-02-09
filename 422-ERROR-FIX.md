# 422 Error Fix - CamelCase vs Snake_Case Issue

## Problem

The frontend was getting a **422 Unprocessable Entity** error when creating requirements.

## Root Cause

**Field name mismatch between frontend and backend:**

### Frontend (TypeScript)
The frontend was sending JSON with camelCase field names:
```json
{
  "title": "Test",
  "description": "Test description",
  "gherkinScenario": "Given a user..."
}
```

### Backend (Rust)
The backend DTOs were using snake_case field names without serde rename configuration:
```rust
pub struct CreateRequirementRequest {
    pub title: String,
    pub description: Option<String>,
    pub gherkin_scenario: String,  // Expected "gherkin_scenario"
}
```

**What happened:**
- Serde (Rust's JSON deserializer) couldn't find the `gherkin_scenario` field
- It received `gherkinScenario` from the frontend
- Deserialization failed BEFORE reaching the handler
- Request was rejected with 422 status
- No handler logs appeared because the request never reached the handler

## Solution

Added `#[serde(rename_all = "camelCase")]` attribute to all DTOs in `/backend/src/dto/requirement_dto.rs`:

```rust
#[derive(Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]  // <-- THIS LINE
pub struct CreateRequirementRequest {
    #[validate(length(min = 1, max = 255))]
    pub title: String,
    pub description: Option<String>,
    #[validate(length(min = 1))]
    pub gherkin_scenario: String,  // Now accepts "gherkinScenario"
    pub position_x: Option<f64>,
    pub position_y: Option<f64>,
}
```

Applied the same fix to:
- `UpdateRequirementRequest`
- `CreateConnectionRequest`

## Verification

After the fix, the backend successfully accepts camelCase field names:

```bash
curl -X POST 'http://localhost:3001/api/v1/projects/.../requirements' \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Test",
    "description": "Test",
    "gherkinScenario": "Given a user\nWhen they act\nThen result"
  }'
```

**Result:** ✅ Success (201 Created)

## Other Issues Fixed

During troubleshooting, we also fixed:

1. **Case-insensitive Gherkin parsing** - Keywords like "given", "Given", "GIVEN" all work
2. **Comprehensive logging** - Added detailed logging throughout backend and frontend
3. **Vercel deployment configuration** - Complete deployment setup

## Testing

Requirements can now be created successfully from the frontend:

1. Navigate to a project
2. Click "Create Requirement"
3. Enter title and Gherkin scenario
4. Click "Save Requirement"

The requirement will be created with all Gherkin steps properly parsed.

## Logs Location

- Backend logs: `backend/logs/goagenticos.log.YYYY-MM-DD`
- Frontend logs: `frontend/logs/frontend.log`

To monitor in real-time:
```bash
# Backend logs
tail -f backend/logs/goagenticos.log.*

# Frontend logs
tail -f frontend/logs/frontend.log
```

## Related Files

- `/backend/src/dto/requirement_dto.rs` - Fixed DTOs
- `/backend/src/utils/gherkin_parser.rs` - Case-insensitive parsing
- `/frontend/lib/types/requirement.ts` - Frontend types
- `/frontend/components/requirements/GherkinEditor.tsx` - Editor component
- `/frontend/app/(dashboard)/projects/[projectId]/requirements/page.tsx` - Requirements page

---

**Status:** ✅ FIXED

**Date:** 2026-02-08

**Build:** Rebuild required after DTO changes

```bash
cd backend
cargo build
cargo run
```
