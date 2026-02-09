# Agentic Operation System (goagenticos.com)

A web application that enables business users to write software specifications using Gherkin syntax, domain modeling, and visual workflows, with Claude AI integration for generating software specifications.

## Technology Stack

- **Frontend**: Next.js 14 with TypeScript + React Flow
- **Backend**: Rust with Axum REST API
- **Database**: Vercel Postgres (PostgreSQL)
- **Deployment**: Vercel (Frontend) + Railway/Render (Backend)
- **AI**: Claude by Anthropic

## Project Structure

```
goagenticos/
├── frontend/           # Next.js frontend application
│   ├── app/           # Next.js 14 App Router
│   ├── components/    # React components
│   ├── lib/           # Utilities, API client, types
│   └── public/        # Static assets
├── backend/           # Rust backend API
│   ├── src/           # Rust source code
│   ├── migrations/    # Database migrations
│   └── Cargo.toml     # Rust dependencies
└── README.md
```

## Features

### Phase 1 - Foundation ✅
- ✅ Next.js project setup with TypeScript
- ✅ Rust backend with Axum framework
- ✅ Database schema with all core tables
- ✅ JWT-based authentication system
- ✅ User registration and login
- ✅ Tailwind CSS + Shadcn/ui components
- ✅ Dashboard layout with navigation
- ✅ API client with authentication

### Phase 2 - Domain Management ✅
- ✅ Project CRUD operations
- ✅ Project list and detail pages
- ✅ Domain creation and management
- ✅ Domain attribute definition
- ✅ Data type support (string, number, boolean, date, email, URL)
- ✅ Required field validation
- ✅ Domain attribute picker component
- ✅ Protected API endpoints with JWT middleware

### Phase 3 - Requirements System ✅
- ✅ React Flow visual canvas with drag-and-drop
- ✅ Custom requirement nodes showing Gherkin steps
- ✅ Gherkin scenario editor (Given/When/Then)
- ✅ Domain attribute integration in requirements
- ✅ Syntax templates and quick-insert buttons
- ✅ Visual flow connections between requirements
- ✅ Requirement CRUD operations
- ✅ Automatic step parsing from Gherkin text
- ✅ Domain reference extraction (${Domain.attribute})
- ✅ Node position persistence
- ✅ MiniMap and controls for canvas navigation

### Phase 4 - Data Management ✅
- ✅ Data bag creation and management
- ✅ CSV file import with Papa Parse
- ✅ JSON file import
- ✅ Automatic schema detection from imported data
- ✅ Drag-and-drop file upload interface
- ✅ Data preview before import
- ✅ Data item management (view, delete)
- ✅ Link data bags to requirements
- ✅ Select specific data items or use all items
- ✅ View linked data bags per requirement
- ✅ Unlink data bags from requirements

### Phase 5 - Test Case Management ✅
- ✅ Test case creation linked to requirements
- ✅ Test case CRUD operations
- ✅ Data bag integration in test cases
- ✅ Select test data from data bags
- ✅ Expected outcome definition
- ✅ Test status tracking (Pending, Passed, Failed)
- ✅ Status update via dropdown
- ✅ Organize test cases by requirement
- ✅ View test data in JSON format
- ✅ Test case editing and deletion

### Upcoming Features
- Claude AI integration for specification generation
- Auto-update specifications on requirement changes
- Visual flow simulation and playback
- Test execution and results tracking

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Rust 1.70+ and Cargo
- PostgreSQL database (or Vercel Postgres)

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file:
```bash
cp .env.local.example .env.local
```

4. Update the environment variables:
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
RUST_API_URL=http://localhost:3001
```

5. Run the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a `.env` file:
```bash
cp .env.example .env
```

3. Update the environment variables:
```
DATABASE_URL=postgres://user:password@localhost/goagenticos
JWT_SECRET=your-super-secret-jwt-key-change-this
CLAUDE_API_KEY=your-anthropic-api-key
RUST_LOG=info
PORT=3001
```

4. Install sqlx-cli for migrations:
```bash
cargo install sqlx-cli --no-default-features --features postgres
```

5. Run database migrations:
```bash
sqlx migrate run
```

6. Build and run the backend:
```bash
cargo run
```

The backend API will be available at `http://localhost:3001`

## Database Schema

### Core Tables

1. **users** - User authentication
2. **projects** - Top-level container for specifications
3. **domains** - Business domain entities
4. **domain_attributes** - Domain properties
5. **requirements** - Gherkin scenarios with position data
6. **requirement_steps** - Individual Given/When/Then steps
7. **requirement_connections** - Visual flow connections
8. **data_bags** - Imported test data collections
9. **data_bag_items** - Individual data records
10. **requirement_data_bag_links** - Link requirements to test data
11. **test_cases** - Test cases per requirement
12. **specifications** - Claude-generated specs
13. **specification_jobs** - Async generation tracking

## API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/login` - User login

### Health Check
- `GET /api/v1/health` - Service health status

### Projects (Protected)
- `GET /api/v1/projects` - List all user projects
- `POST /api/v1/projects` - Create new project
- `GET /api/v1/projects/:id` - Get project details
- `PUT /api/v1/projects/:id` - Update project
- `DELETE /api/v1/projects/:id` - Delete project

### Domains (Protected)
- `GET /api/v1/projects/:project_id/domains` - List domains with attributes
- `POST /api/v1/projects/:project_id/domains` - Create domain
- `GET /api/v1/domains/:id` - Get domain with attributes
- `PUT /api/v1/domains/:id` - Update domain
- `DELETE /api/v1/domains/:id` - Delete domain

### Domain Attributes (Protected)
- `GET /api/v1/domains/:domain_id/attributes` - List attributes
- `POST /api/v1/domains/:domain_id/attributes` - Create attribute
- `GET /api/v1/attributes/:id` - Get attribute
- `PUT /api/v1/attributes/:id` - Update attribute
- `DELETE /api/v1/attributes/:id` - Delete attribute

### Requirements (Protected)
- `GET /api/v1/projects/:project_id/requirements` - List requirements with steps
- `POST /api/v1/projects/:project_id/requirements` - Create requirement
- `GET /api/v1/requirements/:id` - Get requirement with steps
- `PUT /api/v1/requirements/:id` - Update requirement (auto-parses Gherkin)
- `DELETE /api/v1/requirements/:id` - Delete requirement

### Requirement Connections (Protected)
- `GET /api/v1/projects/:project_id/connections` - List connections
- `POST /api/v1/projects/:project_id/connections` - Create connection
- `DELETE /api/v1/connections/:id` - Delete connection

### Data Bags (Protected)
- `GET /api/v1/projects/:project_id/data-bags` - List data bags with items
- `POST /api/v1/projects/:project_id/data-bags` - Create data bag
- `GET /api/v1/data-bags/:id` - Get data bag with items
- `PUT /api/v1/data-bags/:id` - Update data bag
- `DELETE /api/v1/data-bags/:id` - Delete data bag

### Data Bag Items (Protected)
- `POST /api/v1/data-bags/:data_bag_id/items` - Import data (CSV/JSON)
- `GET /api/v1/data-bags/:data_bag_id/items` - List items
- `DELETE /api/v1/data-bag-items/:id` - Delete item

### Requirement Data Bag Links (Protected)
- `POST /api/v1/requirements/:requirement_id/data-bags` - Link data bag
- `GET /api/v1/requirements/:requirement_id/data-bags` - List links
- `DELETE /api/v1/requirement-data-bag-links/:id` - Delete link

### Test Cases (Protected)
- `GET /api/v1/requirements/:requirement_id/test-cases` - List test cases
- `POST /api/v1/requirements/:requirement_id/test-cases` - Create test case
- `GET /api/v1/test-cases/:id` - Get test case
- `PUT /api/v1/test-cases/:id` - Update test case (including status)
- `DELETE /api/v1/test-cases/:id` - Delete test case

### Coming Soon
- Specifications generation with Claude
- Test execution and results

## Development Workflow

### Frontend Development
```bash
cd frontend
npm run dev        # Start dev server
npm run build      # Production build
npm run lint       # Run ESLint
```

### Backend Development
```bash
cd backend
cargo run          # Run in development mode
cargo build --release  # Production build
cargo test         # Run tests
```

### Database Migrations
```bash
cd backend
sqlx migrate add <migration_name>   # Create new migration
sqlx migrate run                    # Run pending migrations
sqlx migrate revert                 # Revert last migration
```

## Environment Variables

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `RUST_API_URL` - Rust backend URL (for rewrites)

### Backend (.env)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `CLAUDE_API_KEY` - Anthropic API key
- `RUST_LOG` - Logging level
- `PORT` - Server port

## Security

- JWT tokens with 24-hour expiration
- Password hashing with bcrypt
- Parameterized SQL queries (SQLx prevents injection)
- CORS configuration
- Input validation on all endpoints

## Next Steps

1. **Phase 2**: Domain Management
   - Project CRUD operations
   - Domain and attribute management
   - Domain picker component

2. **Phase 3**: Requirements System
   - Visual editor with React Flow
   - Gherkin scenario builder
   - Domain attribute integration

3. **Phase 4**: Data Management
   - CSV/JSON import
   - Data bag linking

4. **Phase 5**: Test Cases
   - Test case creation
   - Link test data

5. **Phase 6**: Claude Integration
   - Specification generation
   - Model selection
   - History and versioning

6. **Phase 7**: Polish
   - Auto-update workflows
   - Visual simulation
   - UI/UX improvements

7. **Phase 8**: Testing & Deployment
   - Comprehensive testing
   - Vercel deployment
   - Performance optimization

## 🚀 Deployment

This application is production-ready and can be deployed to Vercel and Railway/Render.

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/goagenticos)

### Deployment Options

1. **Frontend**: Deploy to Vercel (recommended)
2. **Backend**: Deploy to Railway, Render, or Fly.io
3. **Database**: Use Vercel Postgres or Neon

### Documentation

- 🚀 **[Quick Deploy Commands](./DEPLOY.md)** - Deploy in 5 minutes
- 📖 **[Complete Vercel Deployment Guide](./VERCEL-DEPLOYMENT-GUIDE.md)** - Detailed step-by-step guide
- 📚 **[Legacy Deployment Guide](./DEPLOYMENT.md)** - Alternative deployment methods
- 🔍 **[Logging Guide](./LOGGING.md)** - Monitor your application

### Deployment Checklist

```bash
# 1. Deploy backend to Railway
cd backend
railway login
railway init
railway up
railway variables set JWT_SECRET="$(openssl rand -hex 32)"
railway variables set ANTHROPIC_API_KEY="your-key-here"
railway variables set DATABASE_URL="your-postgres-url"

# 2. Run database migrations
sqlx migrate run

# 3. Deploy frontend to Vercel
cd ../frontend
vercel --prod
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://your-backend.railway.app/api/v1
vercel --prod
```

See [DEPLOY.md](./DEPLOY.md) for quick commands or [VERCEL-DEPLOYMENT-GUIDE.md](./VERCEL-DEPLOYMENT-GUIDE.md) for complete instructions.

## 📊 Logging & Monitoring

Comprehensive logging is built-in for both backend and frontend:

- **Backend Logs**: `backend/logs/goagenticos.log`
- **Frontend Logs**: `frontend/logs/frontend.log`

```bash
# View backend logs
tail -f backend/logs/goagenticos.log

# View frontend logs
tail -f frontend/logs/frontend.log
```

See [LOGGING.md](./LOGGING.md) for complete logging documentation.

## 🐳 Docker Support

Run the entire stack with Docker:

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## License

MIT

## Contributors

Built with Claude Code
