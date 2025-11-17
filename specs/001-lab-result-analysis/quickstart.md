# Quickstart Guide: Lab Result Analysis System

**Feature**: Lab Result Analysis System
**Date**: 2025-11-16
**Branch**: `001-lab-result-analysis`

## Overview

This guide walks you through setting up and running the Lab Result Analysis System locally using Docker, or running in development mode with hot reloading.

## Prerequisites

**Required**:
- **Node.js**: v18.17+ or v20.x+ ([Download](https://nodejs.org/))
- **npm** or **yarn**: Comes with Node.js
- **Docker Desktop**: For containerized deployment ([Download](https://www.docker.com/products/docker-desktop/))
- **OpenAI API Key**: For LLM extraction ([Sign up](https://platform.openai.com/))

**Optional**:
- **Git**: For version control
- **VS Code**: Recommended editor with Prisma extension

## Quick Start (Docker)

### 1. Clone and Setup

```bash
# Navigate to project root
cd my-lims

# Create environment file
cp .env.example .env

# Edit .env and add your OpenAI API key
# OPENAI_API_KEY=sk-...
```

### 2. Start with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# The application will be available at:
# http://localhost:3000
```

### 3. Initialize Database

```bash
# Run database migrations
docker-compose exec app npm run db:migrate

# Seed test types (optional)
docker-compose exec app npm run db:seed
```

### 4. Access the Application

Open your browser to `http://localhost:3000`:
- **Upload Page**: `/upload` - Upload lab result documents
- **Results List**: `/results` - Browse all uploaded results
- **Graphs**: `/graphs` - Visualize test trends

### 5. Stop Services

```bash
# Stop all containers
docker-compose down

# Stop and remove volumes (deletes database data)
docker-compose down -v
```

---

## Development Mode (No Docker)

### 1. Install Dependencies

```bash
# Navigate to project root
cd my-lims

# Install npm packages
npm install
```

### 2. Setup Database

**Option A: Local MariaDB**

```bash
# Install MariaDB on your system
# macOS: brew install mariadb
# Ubuntu: sudo apt-get install mariadb-server
# Windows: Download from https://mariadb.org/download/

# Start MariaDB
# macOS: brew services start mariadb
# Ubuntu: sudo systemctl start mariadb

# Create database
mysql -u root -p
CREATE DATABASE lims_dev;
CREATE USER 'lims_user'@'localhost' IDENTIFIED BY 'lims_password';
GRANT ALL PRIVILEGES ON lims_dev.* TO 'lims_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**Option B: Docker MariaDB Only**

```bash
# Start only the database container
docker-compose up db -d
```

### 3. Configure Environment

```bash
# Copy example environment file
cp .env.example .env.local

# Edit .env.local
nano .env.local
```

**.env.local**:
```bash
# Database connection
DATABASE_URL="mysql://lims_user:lims_password@localhost:3306/lims_dev"

# OpenAI API
OPENAI_API_KEY="sk-your-key-here"

# File uploads (local development)
UPLOAD_DIR="./public/uploads"
MAX_FILE_SIZE="10485760"  # 10MB in bytes

# Next.js
NEXTAUTH_SECRET="development-secret-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Run Database Migrations

```bash
# Generate Prisma client
npx prisma generate

# Run migrations to create tables
npx prisma migrate dev

# Seed test types (optional)
npm run db:seed
```

### 5. Start Development Server

```bash
# Start Next.js dev server with hot reloading
npm run dev

# Application will be available at:
# http://localhost:3000
```

### 6. Open Prisma Studio (Database GUI)

```bash
# In a separate terminal, launch Prisma Studio
npx prisma studio

# Access at: http://localhost:5555
```

---

## Project Structure

```
my-lims/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── upload/             # File upload UI
│   │   ├── results/            # Results list & detail
│   │   ├── graphs/             # Trend visualization
│   │   └── api/                # API route handlers
│   ├── components/             # React components
│   │   ├── ui/                 # Reusable UI components
│   │   ├── FileUpload.tsx
│   │   ├── ResultCard.tsx
│   │   └── TrendGraph.tsx
│   ├── lib/                    # Utility functions & services
│   │   ├── db.ts               # Prisma client singleton
│   │   ├── llm.ts              # LLM extraction service
│   │   ├── storage.ts          # File storage service
│   │   └── validation.ts       # Zod validation schemas
│   └── types/                  # TypeScript type definitions
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── migrations/             # Migration files
│   └── seed.ts                 # Database seed script
├── tests/                      # Test files
├── public/
│   └── uploads/                # Uploaded files (dev only)
├── docker-compose.yml
├── Dockerfile
└── package.json
```

---

## Common Tasks

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run E2E tests (requires app running)
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

### Database Operations

```bash
# Create a new migration
npx prisma migrate dev --name add_new_field

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Push schema changes without migration (dev only)
npx prisma db push

# Seed test data
npm run db:seed

# View database in GUI
npx prisma studio
```

### Code Quality

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format

# Type check
npm run type-check
```

### Building for Production

```bash
# Build Next.js app
npm run build

# Start production server
npm start

# Or use Docker
docker-compose -f docker-compose.prod.yml up --build
```

---

## Testing the Upload Flow

### 1. Prepare a Sample Lab Result

Create a PDF or image with lab test data, or use a sample file:
- **Sample PDF**: [Download](https://example.com/sample-lab-result.pdf)
- **Sample Image**: Take a photo of a paper lab result

### 2. Upload via UI

1. Navigate to http://localhost:3000/upload
2. Click "Choose File" or drag-and-drop
3. Enter patient number (e.g., `PAT-12345`)
4. Enter test date (e.g., `2025-11-15`)
5. Click "Upload and Extract"

### 3. Monitor Extraction

- Watch the progress indicator
- Extraction typically takes 5-15 seconds
- Check browser console for API call details

### 4. View Results

1. Navigate to http://localhost:3000/results
2. Find your uploaded result
3. Click to view extracted test values
4. Verify data accuracy

### 5. Generate Graph

1. Upload at least 2 results for the same test type
2. Navigate to http://localhost:3000/graphs
3. Select patient and test type
4. View trend graph with reference ranges

---

## Troubleshooting

### Database Connection Errors

**Error**: `Can't reach database server`

**Solution**:
```bash
# Check MariaDB is running
# Docker: docker-compose ps
# Local: systemctl status mariadb

# Verify DATABASE_URL in .env
# Check host, port, username, password
```

### File Upload Fails

**Error**: `413 Payload Too Large`

**Solution**:
```bash
# Reduce file size or increase MAX_FILE_SIZE in .env
# Ensure file is < 10MB
# Check file format (PDF, JPEG, PNG only)
```

### LLM Extraction Fails

**Error**: `OpenAI API error: 401 Unauthorized`

**Solution**:
```bash
# Verify OPENAI_API_KEY in .env
# Check API key is active at https://platform.openai.com/api-keys
# Ensure sufficient API credits
```

**Error**: `Extraction timeout after 30s`

**Solution**:
```bash
# Large or complex PDFs may timeout
# Try converting to image format
# Increase timeout in lib/llm.ts if needed
```

### Port Already in Use

**Error**: `Port 3000 is already in use`

**Solution**:
```bash
# Find and kill process using port 3000
# macOS/Linux: lsof -ti:3000 | xargs kill
# Windows: netstat -ano | findstr :3000, then taskkill /PID <PID>

# Or change port in package.json scripts:
# "dev": "next dev -p 3001"
```

---

## Next Steps

1. **Review Documentation**:
   - [Data Model](./data-model.md) - Database schema and entities
   - [API Contracts](./contracts/) - REST API specifications
   - [Implementation Plan](./plan.md) - Technical architecture

2. **Run Tests**:
   ```bash
   npm test
   ```

3. **Start Implementing**:
   ```bash
   # Generate tasks for implementation
   npm run speckit:tasks
   ```

4. **Deploy to Production**:
   - Configure production environment variables
   - Set up HTTPS/SSL certificates
   - Configure S3 for file storage (optional)
   - Set up monitoring and logging

---

## Environment Variables Reference

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | MariaDB connection string | `mysql://user:pass@localhost:3306/lims` | Yes |
| `OPENAI_API_KEY` | OpenAI API key for LLM extraction | `sk-...` | Yes |
| `UPLOAD_DIR` | Directory for uploaded files | `./public/uploads` | No (default) |
| `MAX_FILE_SIZE` | Max upload size in bytes | `10485760` (10MB) | No (default) |
| `NEXTAUTH_SECRET` | Auth secret (future use) | Random string | No (future) |
| `NEXTAUTH_URL` | App URL | `http://localhost:3000` | No (future) |
| `NODE_ENV` | Environment mode | `development`, `production` | No (auto-set) |

---

## Additional Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **Prisma Documentation**: https://www.prisma.io/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **OpenAI API**: https://platform.openai.com/docs
- **Docker Compose**: https://docs.docker.com/compose/

---

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review API contracts in `contracts/` directory
3. Check GitHub issues or create a new one
4. Contact the development team

**Happy coding!**
