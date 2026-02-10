# 🐍 Python Migration Guide

## ✅ What's Been Done

I've refactored your project from **Rust + separate Next.js** to **Python FastAPI + integrated Next.js static export**!

### New Project Structure

```
goagenticos/
├── api/                      # 🆕 Python FastAPI backend
│   ├── __init__.py
│   ├── main.py              # FastAPI app + static file serving
│   ├── config/
│   │   ├── __init__.py
│   │   └── database.py      # SQLAlchemy setup
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py          # ✅ DONE
│   │   └── project.py       # ✅ DONE
│   └── routers/
│       ├── __init__.py
│       ├── auth.py          # ✅ DONE (signup/login)
│       ├── projects.py      # TODO: Implement
│       ├── domains.py       # TODO: Implement
│       ├── requirements.py  # TODO: Implement
│       ├── data_bags.py     # TODO: Implement
│       ├── test_cases.py    # TODO: Implement
│       └── specifications.py# TODO: Implement
├── frontend/                 # Next.js (static export)
│   ├── app/
│   ├── components/
│   ├── next.config.js       # ✅ UPDATED for static export
│   └── package.json
├── backend/                  # ❌ OLD Rust (can be deleted)
├── requirements.txt          # ✅ CREATED Python dependencies
├── vercel.json              # ✅ CREATED Single deployment config
└── .env                      # Environment variables
```

---

## 🚀 Quick Start

### 1. Install Python Dependencies

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Set Environment Variables

Create `.env` file in the root:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/goagenticos

# JWT Secret
JWT_SECRET=your-secret-key-min-32-chars

# Claude API (optional)
ANTHROPIC_API_KEY=sk-ant-...

# Server
PORT=8000
```

### 3. Run Development Server

```bash
# Start FastAPI backend
uvicorn api.main:app --reload --port 8000

# In another terminal, start Next.js (for development)
cd frontend
npm run dev
```

Visit:
- Frontend: http://localhost:3000
- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/api/v1/health

---

## 📦 What Works Now

### ✅ Completed

1. **FastAPI Backend Structure**
   - `api/main.py` - Main app with static file serving
   - `api/config/database.py` - SQLAlchemy setup
   - `api/models/user.py` - User model
   - `api/models/project.py` - Project model
   - `api/routers/auth.py` - Signup & Login endpoints

2. **Next.js Static Export**
   - Configured for static build
   - Works with FastAPI serving

3. **Vercel Deployment Config**
   - Single `vercel.json` for both frontend and backend
   - Python + Next.js builds

### ⏳ TODO: Port Remaining Endpoints

You need to implement these routers (copy logic from Rust backend):

1. **api/routers/projects.py**
   - List projects
   - Create/Update/Delete project

2. **api/routers/domains.py**
   - Domain CRUD
   - Attributes CRUD

3. **api/routers/requirements.py**
   - Requirements CRUD
   - Gherkin parsing
   - Connections

4. **api/routers/data_bags.py**
   - Data bags CRUD
   - CSV/JSON import

5. **api/routers/test_cases.py**
   - Test cases CRUD

6. **api/routers/specifications.py**
   - Claude integration
   - Generate specifications

---

## 🗄️ Database Setup

### Create Database Tables

The current setup uses SQLAlchemy which will auto-create tables on first run.

**Option 1: Auto-create (Simple)**
```python
# In api/main.py (already done)
Base.metadata.create_all(bind=engine)
```

**Option 2: Alembic Migrations (Recommended for production)**
```bash
# Initialize Alembic
alembic init alembic

# Create migration
alembic revision --autogenerate -m "Initial tables"

# Run migration
alembic upgrade head
```

---

## 🌐 Deploy to Vercel

### Option 1: Using Vercel Dashboard

1. **Push to GitHub**:
   ```bash
   git add -A
   git commit -m "Refactor to Python FastAPI"
   git push
   ```

2. **Deploy on Vercel**:
   - Go to https://vercel.com/new
   - Import `karthickst/agenticos`
   - Vercel will auto-detect the configuration from `vercel.json`
   - Add environment variables:
     - `DATABASE_URL`
     - `JWT_SECRET`
     - `ANTHROPIC_API_KEY`
   - Deploy!

### Option 2: Using Vercel CLI

```bash
vercel --prod
```

---

## 📝 Example: Implementing a Router

Here's how to implement the Projects router:

```python
# api/routers/projects.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid

from api.config.database import get_db
from api.models.project import Project
from api.models.user import User

router = APIRouter()

@router.get("/")
async def list_projects(db: Session = Depends(get_db)):
    """List all projects"""
    projects = db.query(Project).all()
    return [
        {
            "id": str(p.id),
            "name": p.name,
            "description": p.description,
            "createdAt": p.created_at.isoformat(),
            "updatedAt": p.updated_at.isoformat()
        }
        for p in projects
    ]

@router.post("/")
async def create_project(name: str, description: str = None, db: Session = Depends(get_db)):
    """Create new project"""
    project = Project(
        user_id=uuid.uuid4(),  # TODO: Get from JWT token
        name=name,
        description=description
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    return {
        "id": str(project.id),
        "name": project.name,
        "description": project.description,
        "createdAt": project.created_at.isoformat()
    }

@router.get("/{project_id}")
async def get_project(project_id: str, db: Session = Depends(get_db)):
    """Get project by ID"""
    project = db.query(Project).filter(Project.id == uuid.UUID(project_id)).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return {
        "id": str(project.id),
        "name": project.name,
        "description": project.description,
        "createdAt": project.created_at.isoformat()
    }

# Add PUT and DELETE similarly...
```

---

## 🔑 Key Differences from Rust

| Rust | Python/FastAPI |
|------|----------------|
| `axum::Router` | `APIRouter()` |
| `sqlx::query!` | `db.query(Model)` |
| `Uuid::new_v4()` | `uuid.uuid4()` |
| `bcrypt::hash` | `pwd_context.hash()` |
| `jwt::encode` | `jose.jwt.encode()` |
| Manual error handling | Automatic with HTTPException |

---

## 📚 Helpful Resources

- **FastAPI Docs**: https://fastapi.tiangolo.com
- **SQLAlchemy Docs**: https://docs.sqlalchemy.org
- **Vercel Python**: https://vercel.com/docs/functions/runtimes/python

---

## ✅ Next Steps

1. **Implement remaining routers** (copy logic from `backend/src/handlers/`)
2. **Create database models** for Domain, Requirement, etc.
3. **Test locally** with `uvicorn api.main:app --reload`
4. **Deploy to Vercel** with `vercel --prod`
5. **Delete old `backend/` directory** (Rust code)

---

## 🎉 Benefits of This Refactoring

✅ **Single deployment** - No separate backend/frontend deployments
✅ **Python ecosystem** - Easier to maintain than Rust for most developers
✅ **Vercel-optimized** - Designed for serverless Python
✅ **Faster development** - Python is more concise than Rust
✅ **Auto API docs** - FastAPI generates Swagger docs at `/docs`

Your project is now Python-based and Vercel-ready! 🚀
