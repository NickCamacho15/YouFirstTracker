# .uoY - The Premium Personal Excellence Platform

## Overview

.uoY is the premium personal excellence platform designed to help users craft their life into a masterpiece. Built around scientifically-backed habit formation, strategic goal progression, and vision manifestation, the application provides users with elegant, gamified tools to achieve extraordinary personal growth. More than productivity software - it's a comprehensive system for personal excellence and life mastery, featuring interactive completion mechanisms and satisfying feedback loops that make taking action irresistible.

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

### Personal Focus
- Clean, distraction-free interface
- Individual productivity tracking
- Personal achievement monitoring
- No social features to maintain focus

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

- July 1, 2025: Rebranded to "The Premium Personal Excellence Platform"
  - Updated platform positioning from self-leadership to personal excellence and life mastery
  - Emphasized the mission of helping users "craft their life into a masterpiece"
  - Added premium welcome messaging with "Action is the touchstone of reality" philosophy
  - Integrated slide-to-complete task functionality with haptic feedback for mobile devices
  - Created engaging task completion system with rhythmic vibration patterns
  - Enhanced dashboard to focus on daily tasks and habits rather than separate goals section
  - Integrated "Future Folder" concept combining vision board with goal progression
  - Made task completion more gamified and satisfying with visual celebration effects
- July 1, 2025: Implemented One-Click Habit Health Score feature
  - Created comprehensive health scoring system with weighted algorithms  
  - Added glassmorphism design with animated gradients and floating elements
  - Real-time calculation of Consistency, Momentum, Balance, and Engagement metrics
  - Letter grade scoring (A+ to F) with color-coded visual feedback
  - Smart recommendations based on performance patterns
  - Removed AI insights section (pending AI integration)
  - Beautiful visual design with backdrop blur effects and hover animations
  - Positioned prominently at top of habits page for instant wellness assessment
- June 30, 2025: Rebranded to .uoY with white theme, electric blue/gold accents, and 67-day habit tracking
  - Updated branding from "You. First." to ".uoY" to match logo aesthetic
  - Implemented clean white background with electric blue and gold accent colors
  - Redesigned habit cards to be vertical and stacked in a responsive grid
  - Updated habit formation tracking from 66 to 67 days with "Bonus day for .uoY" celebration
  - Enhanced completion buttons with electric blue hover states and better visual feedback
  - Added edit functionality with settings button on each habit card
  - Fixed habit toggle API calls with proper parameter ordering
  - Updated both Daily Tracker and Formation Science views to use 67-day cycle
  - Color-coded categories: Mind (electric blue), Body (gold/amber), Soul (indigo)
- June 30, 2025: Enhanced visual design and scientific habit tracking
  - Added beautiful Calm-inspired hero header with nature imagery and gradients
  - Enhanced habit story bar with larger, more prominent colorful bubbles
  - Implemented scientific habit formation tracker with three research-backed stages:
    - Stage 1: Initial Formation (Days 1-18) - Building awareness and momentum
    - Stage 2: Strengthening (Days 19-45) - Neural pathway development
    - Stage 3: Automaticity (Days 46-66) - Habit becomes automatic
  - Added tabbed interface on habits page for Overview and Formation Science views
  - Color-coded habit categories: Mind (purple), Body (orange/red), Soul (emerald/teal)
  - Moved habit bar lower with elevated positioning over hero header
- June 30, 2025: Simplified to focused personal productivity platform
  - Removed social "You" timeline section for distraction-free experience
  - Fixed navigation disappearing issue by moving to app-level rendering
  - Bottom navigation bar that persists across all routes
  - Clean navigation structure: Dashboard, Goals, Habits, Read, Vision
  - Enhanced habit stories with Mind/Body/Soul category colors
  - Focused on individual productivity without social features
- June 30, 2025: Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.