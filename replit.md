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

- July 4, 2025: Enhanced Exercise Progress Tracking with Category Filtering and Latest Weight Display  
  - **FIXED**: "Latest" weight now displays actual last weight entered instead of calculated metrics (e.g., "150 lbs" for last bench press)
  - **ENHANCED**: Added category filtering system with buttons: All, Strength, Cardio, and Functional
  - **IMPROVED**: Exercise progress charts now filter by category, showing only relevant exercises
  - **STREAMLINED**: Removed browser confirmation dialog for workout deletion - now direct one-click deletion
  - **UI**: Category and metric toggle buttons positioned side-by-side for better usability
  - **SAFETY**: Added loading states and null checks to prevent errors during data loading
  - **FIXED**: Category filter buttons now remain visible even when no exercises match the selected category
  - **FIXED**: Date handling issues where workout dates were shifting (7/4→7/3, 7/1→6/30) due to timezone conflicts
  - **IMPROVED**: Chart styling - removed black filled areas under progress lines, now clean thin lines only
  - **FIXED**: Chart progression direction - exercise progress now correctly displays upward trends by properly sorting workout data by date
  - **FIXED**: Bodyweight exercise tracking - Pull-ups and other bodyweight exercises now show progression using total reps instead of weight-based calculations
  - **IMPROVED**: Chart tooltips and "Latest" display now show appropriate units (reps for bodyweight exercises, lbs for weighted exercises)
  - **ENHANCED**: Health dashboard now displays real workout data instead of mock metrics
  - **REMOVED**: "Current Weight" section per user request, switched to 3-column layout
  - **NEW**: Category Trends chart showing real exercise distribution across Strength, Cardio, and Functional categories
  - **IMPROVED**: Workout metrics now calculate from actual data: This Week, Total Workouts, Last Workout timing
  - Progress view shows filtered exercises with proper empty states and persistent filter controls
- July 4, 2025: Enhanced Workout Tracking with Category-Specific Metrics and Tooltips
  - **ENHANCED**: Exercise categories updated with detailed tooltips: Strength (muscle/load capacity), Cardio (endurance/aerobic), Functional (real-world movement)
  - **NEW**: Category-specific tracking metrics for comprehensive workout logging
  - **STRENGTH**: Weight (lbs), Reps, Sets tracking for load capacity progression
  - **CARDIO**: Distance, Time, Pace (auto-calc), Heart Rate (avg/max), Type (Run/Bike/Row/etc.) for endurance tracking
  - **FUNCTIONAL**: Workout Name/Block, Time Domain, Rounds Completed, Reps per Round, RPE (1-10), Type (AMRAP/EMOM/For Time/Circuit/Tabata)
  - **DYNAMIC**: Form fields change based on selected exercise category for relevant metric capture
  - **ANALYTICS**: Foundation for category-specific trend analysis (avg weights, weekly cardio time, completion rates, RPE trends)
  - Enhanced dropdown system remembers custom exercises with appropriate category-based tracking options
- July 4, 2025: Added Health & Fitness Section with Workout Tracking Foundation
  - **NEW**: Health tab added to bottom navigation with Activity icon
  - **NEW**: Health page with workout tracking dashboard, logger, and progress tabs
  - **NEW**: Workout database schema (workouts, exercises, workout_exercises, body_weight_logs tables)
  - **NEW**: Comprehensive workout storage layer with full CRUD operations
  - **NEW**: Workout API routes for data management
  - **NEW**: Nutrition database schema (nutrition_plans, meals tables) for meal planning
  - **DASHBOARD**: Clean split-layout dashboard with workout metrics on left, nutrition meal plan on right
  - **DESIGN**: Colorful workout metric cards (blue, green, purple, orange) matching fitness app aesthetic
  - **DESIGN**: Purple gradient nutrition section matching user screenshot with macro tracking (calories, protein, carbs, fat)
  - **FOUNDATION**: Three-tab interface: Dashboard, Log Workout, Progress tracking
  - **SEPARATED**: Comprehensive wellness trends chart moved to dedicated workout section (Log Workout tab)
  - **CLICKABLE**: "Enter Workout Section" button navigates to dedicated workout interface with wellness trends and workout logging
  - **CLICKABLE**: Both workout and nutrition sections designed as separate clickable entities for future expansion
  - Clean main dashboard provides quick metric overview, detailed progress charts accessible via workout section
- July 3, 2025: Removed Navigation Tiles + Enhanced Rules with Category Tiles
  - **REMOVED**: Navigation tiles (Goals, Habits, Read, Vision) from You page dashboard per user request
  - **ENHANCED**: Rules section with clearer failure buttons - changed from small warning icon to prominent red "BROKE RULE" button
  - **NEW**: Category-based rule tiles organized into 6 sections (Digital Wellness, Nutrition, Sleep Hygiene, Mental Health, Fitness, Personal)
  - **IMPROVED**: Each category displays rules as individual tiles in 2-column grid layout for better visibility
  - **DESIGN**: Category sections with emoji headers and color-coded hover states for different categories
  - Rules interface now emphasizes clear action buttons and organized category-based layout
- July 3, 2025: Replaced Navigation Tiles with Gamified Visual Analytics
  - **MAJOR**: Replaced navigation tiles with comprehensive "Personal Excellence Analytics" dashboard
  - **NEW**: Colorful expanding visual data layouts including Habit Ecosystem with ring progressions
  - **NEW**: Performance Matrix hexagonal radar chart with colorful gradient fills (not dot plots)
  - **NEW**: Task Analytics section with real-time progress bars and goal tracking
  - **DESIGN**: Three-column layout: Habit Ecosystem (rings) → Performance Matrix (radar) → Task Analytics (bars)
  - **VISUAL**: Data grows toward edges with animated backgrounds, floating data points, and colorful gradients
  - **IMPROVED**: Morning priming and evening routines sections remain below analytics dashboard
  - Visual design emphasizes expanding, colorful data presentation over simple navigation tiles
- July 3, 2025: Added Overview Tab + Reordered Navigation (Home → Habits → You → Goals → Read)
  - **NEW**: Overview tab as default on habits page with comprehensive live visual dashboards
  - **NEW**: "HABIT MASTERY" fitness-style header with complete wellness analytics
  - **NEW**: Live visual data layout including habit health radar chart and category performance circles
  - **NEW**: Interactive "Today's Progress" grid showing all habits with one-tap completion
  - **NEW**: Category performance circles (Mind/Body/Soul) with real-time completion percentages
  - **IMPROVED**: Navigation reordered - You. page now in center position as requested
  - **IMPROVED**: Combined all habit data into single engaging overview with multiple visualization types
  - Overview includes radar chart, category circles, live progress grid, and comprehensive metrics
- July 3, 2025: Fixed Foundations Tab - Long-term Consistency Tracking (Not 67-day Formation)
  - **MAJOR**: Foundations now track long-term consistency like tasks on You page, not 67-day cycles
  - **FIXED**: Removed all flashing/pulsing animations - only simple color transitions
  - **NEW**: Category-based organization with "tiles within tiles" - category tiles containing habit tiles
  - **NEW**: "FOUNDATION CONSISTENCY" dashboard with fitness-style black header
  - **NEW**: Year progress tracking (streak/365 * 100%) instead of formation cycles  
  - **NEW**: Long-term milestones: Yearly Master (365+), Century Club (100+), Monthly Champion (30+)
  - **IMPROVED**: Simple completion circles with no complex animations
  - **IMPROVED**: Individual habit tiles within category tiles (Mind, Body, Soul) 
  - Foundations emphasize building long-term personal investment consistency over habit formation
- July 3, 2025: Transformed Habits Section into Health & Fitness App Interface
  - **MAJOR**: Complete redesign inspired by Whoop fitness tracker interface
  - **NEW**: "TODAY'S RECOVERY" dashboard with dark gradient header and fitness metrics
  - **NEW**: Heart rate zone performance graphs (MAX/HIGH/MOD/LOW/REST zones)
  - **NEW**: "DISCIPLINE METRICS" section with willpower scoring and behavioral optimization
  - **NEW**: 7-day strain/discipline charts with colored performance zones
  - **DESIGN**: Black backgrounds, fitness terminology (AVG STRAIN, PEAK DAYS, ELITE zones)
  - **IMPROVED**: Foundation tiles with large progress circles and live 7-day bar graphs
  - **IMPROVED**: Simple tap-to-complete with haptic feedback, toned down animations
  - Rules section now displays as fitness-style performance tracking dashboard
  - All habit tabs (New Habits, Foundations, Rules) feature comprehensive visual analytics
- July 2, 2025: Enhanced Rules System + Improved Foundation Tiles
  - **NEW**: Rules tab now uses positive completion language with "Promise kept today" instead of violation tracking
  - **NEW**: Rules feature slide-to-break bars for intentional promise breaking with haptic feedback
  - **IMPROVED**: Foundation tiles now use simple checkboxes instead of slide-to-complete
  - **IMPROVED**: Whole foundation tile changes color when completed for better visual feedback
  - **NEW**: Created comprehensive habit radar chart showing 6 performance metrics (Consistency, Momentum, Balance, Engagement, Foundation, Growth)
  - Radar chart displays overall performance grade (A+ to F) with color-coded scoring
  - Rules system emphasizes building integrity through commitment over perfection
  - Removed complex slide interactions from foundation tiles for cleaner UX
- July 2, 2025: Major Social Features Integration - Home Timeline + Follower Feed
  - **NEW**: Home page now serves as social timeline feed (Instagram Stories + habit-tracking community)
  - **RESTRUCTURED**: You page moved to `/you` route and remains as personal "You. Dashboard" 
  - Added comprehensive social schema: followers, post reactions, comments, privacy settings
  - Created profile circles with story-style design showing users you follow
  - Timeline feed displays posts from followed users with reaction system (heart, fire, pray, celebrate)
  - Post types include habit completions, goal achievements, micro-goals, reading reflections, milestones
  - Implemented social storage layer with following/followers functionality
  - Added social API routes for timeline, following, reactions, and comments
  - Navigation restructured: Home (timeline) → You (personal dashboard) → Goals → Habits → Read
  - Updated branding from "You. First." to ".uoY" throughout interface
- July 1, 2025: Completed "You. Dashboard" - The Premium Personal Excellence Platform
  - **FINALIZED**: You page (dashboard) is complete and should not be adjusted further
  - Restructured task system with goals tied to cumulative task completion counters (234, 456+ tasks)
  - Added "Commitment Score" showing persistence with days working and average tasks per day
  - Changed critical tasks to positive "Today's Tasks" with blue theming (removed gold/negative themes)
  - Implemented slide-up completion for habit tiles with dark grab bars and haptic feedback
  - Created separate Morning Priming and Evening Routines sections with distinct theming
  - Added Whoop-style foundations dashboard with central completion tracking graph
  - Compact habit tiles in responsive grid layout with slide-to-complete functionality
  - Removed duplicate sections and streamlined navigation flow
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