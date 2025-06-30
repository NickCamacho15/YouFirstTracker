# You. First. - A Premium Self-Leadership Platform

## Overview

You. First. is a comprehensive self-leadership and productivity platform built around identity-based goal setting, habit tracking, and personal reflection. The application is designed as a digital companion for the You.™ apparel brand, providing users with tools to set goals, track habits, log reading sessions with reflections, and engage with a community feed.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Styling**: TailwindCSS with shadcn/ui component library for consistent, modern UI design
- **Form Handling**: React Hook Form with Zod validation for robust form management
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for full-stack type safety
- **Session Management**: Express sessions with in-memory storage
- **Authentication**: Custom implementation using bcrypt for password hashing
- **API Design**: RESTful API endpoints with JSON responses

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: @neondatabase/serverless for optimized serverless connections

## Key Components

### Authentication System
- Custom user authentication with email/password
- Session-based authentication using express-session
- Password hashing with bcrypt
- Protected routes requiring authentication
- User registration with email validation

### Goal Management
- Main goal creation with descriptions and due dates
- Micro-goals as subtasks for larger goals
- Progress tracking with completion percentages
- Visual progress indicators and due date management

### Habit Tracking
- Custom habit creation with frequency settings (daily focus)
- Daily completion tracking with streak counting
- Visual habit cards with completion status
- Week view for habit consistency monitoring

### Reading & Reflection System
- Timer-based reading sessions
- Book title tracking
- Post-session reflection prompts
- Reflection sharing to community feed
- Reading session history

### Community Feed
- Social feed for sharing achievements
- Post filtering by type (goals, habits, reflections)
- User avatars and display names
- Achievement celebration and motivation

### UI/UX Design
- Modern, clean interface with consistent styling
- Responsive design for mobile and desktop
- Loading states and error handling
- Toast notifications for user feedback
- Modal dialogs for data entry

## Data Flow

1. **Authentication Flow**: User registers/logs in → Session established → Protected routes accessible
2. **Goal Flow**: Create goal → Add micro-goals → Track progress → Share achievements
3. **Habit Flow**: Create habit → Daily check-ins → Streak tracking → Community sharing
4. **Reading Flow**: Start timer → End session → Write reflection → Post to community
5. **Community Flow**: User actions → Generate posts → Display in feed → Social engagement

## External Dependencies

### Core Framework Dependencies
- React ecosystem (React, React DOM, React Router via Wouter)
- TanStack Query for data fetching and caching
- Express.js for backend API
- Drizzle ORM for database operations

### UI and Styling
- TailwindCSS for utility-first styling
- Radix UI primitives for accessible components
- Lucide React for consistent iconography
- Class Variance Authority for component variants

### Development and Build Tools
- Vite for development server and bundling
- TypeScript for type checking
- ESBuild for production bundling
- PostCSS with Autoprefixer for CSS processing

### Authentication and Security
- bcrypt for password hashing
- express-session for session management
- connect-pg-simple for PostgreSQL session storage

### Utility Libraries
- date-fns for date manipulation
- Zod for schema validation
- clsx and twMerge for conditional styling

## Deployment Strategy

The application is configured for deployment on Replit with:
- Development server running on Node.js with hot reload
- Production build process using Vite and ESBuild
- Environment variable configuration for database connections
- Static file serving for production builds
- Session secret configuration for secure sessions

Build scripts include:
- `dev`: Development server with hot reload
- `build`: Production build with client and server bundling
- `start`: Production server startup
- `db:push`: Database schema deployment

## Changelog

- June 30, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.