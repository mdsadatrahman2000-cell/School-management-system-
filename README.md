# School Management System

Enterprise-grade School Management System for managing multiple schools.

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with refresh tokens

## Features

- Multi-school support (Enterprise/Chain)
- Role-based access control (8+ roles)
- Admission management
- Student & teacher profiles
- Attendance tracking
- Exam & grading system
- Fee & payment management
- Timetable management
- Communication (messaging, announcements)
- Reports & analytics

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- pnpm 8+

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
pnpm install

# Setup environment variables
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your database credentials

# Run database migrations
pnpm db:migrate

# Seed the database
pnpm db:seed

# Start development servers
pnpm dev
```

### Development

```bash
# Start both frontend and backend
pnpm dev

# Start only backend
pnpm --filter api dev

# Start only frontend
pnpm --filter web dev
```

## Project Structure

```
school-management-system/
├── apps/
│   ├── api/              # Express backend
│   └── web/              # Next.js frontend
├── packages/
│   ├── types/            # Shared TypeScript types
│   ├── utils/            # Shared utilities
│   └── config/           # Shared configuration
└── docs/                 # Documentation
```

## Database Schema

See `apps/api/prisma/schema.prisma` for the complete database schema.

## API Documentation

API documentation will be available at `http://localhost:5000/api/v1/docs` (coming soon).

## License

This project is licensed under the MIT License.
