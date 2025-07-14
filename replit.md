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

- July 14, 2025: Enhanced You. Dashboard with Clean Professional Weekly Overview Tiles
  - **REDESIGNED**: Weekly Overview evolved to clean, professional standalone tiles with cross-platform branding
  - **REMOVED**: All emojis and decorative icons for professional aesthetic alignment
  - **COMPRESSED**: Reduced padding (p-4), smaller shadows (shadow-sm), tighter spacing (space-y-3)
  - **STREAMLINED**: Each metric displays with compact typography and minimal visual elements
  - **PROFESSIONAL**: Clean white tiles with subtle gray borders and reduced visual noise
  - **TYPOGRAPHY**: Compact hierarchy with uppercase labels, condensed metrics (12.5h format)
  - **DAILY AVERAGES**: Added daily breakdowns (1.8h daily, 27m daily, etc.) for better context
  - **EFFICIENT LAYOUT**: Horizontal data flow with baseline-aligned metrics for scanning
  - **BRAND ALIGNED**: Minimal color usage, consistent gray typography, professional spacing
  - Dashboard now emphasizes clean data presentation with cross-platform professional design language
- July 11, 2025: Task-Goal Integration System with Dashboard Gamification Complete
  - **REDESIGNED**: Time metrics tiles (Reading, Meditation, Screen Time, Workouts) now gamified without icons
  - **NEW**: "Personal Investment Tracker" with gradient color tiles and metrics as centerpiece
  - **ENHANCED**: Each metric tile shows large numbers (12.5h format), progress bars, and percentage changes
  - **ADDED**: Month and all-time stats within each tile with visual progress indicators
  - **MOVED**: Active Goals section relocated to Goals page with nameplate configuration
  - **NEW**: Task creation modal requiring goal selection (or "personal" option)
  - **INTEGRATED**: Task completion now increments linked goal progress bars
  - **GAMIFIED**: Long-term task completion counter (147 total tasks) shown in Today's Tasks
  - **STREAMLINED**: Dashboard now shows Investment Tracker → Today's Tasks for focused layout
  - **ENHANCED**: Goals page uses compact nameplate design with progress bars and metrics
  - Complete task-goal integration system with gamified progress tracking and visual feedback
- July 11, 2025: Challenge Page Refined - New Challenge Button Below Title with Clean Design
  - **MOVED**: "New Challenge" button now positioned below the title tile as a prominent centered button
  - **ENHANCED**: Challenge cards with progress bars and optimized progress calendar showing all days at once
  - **IMPROVED**: Progress calendar with color-coded states: green (completed), purple (today), white (missed), gray (future)
  - **REMOVED**: Any log progress options - all tracking done through simple checkbox interactions
  - **REDESIGNED**: Create challenge form with cleaner layout matching platform aesthetic
  - **FIXED**: Added missing /api/rules endpoint to resolve discipline page errors
  - **STREAMLINED**: Challenge tracking focuses on visual progress with percentage bars and calendar grids
  - Challenge page now provides intuitive checkbox-only tracking with prominent visual progress indicators
- July 11, 2025: Rituals Tab Restructured - Removed Mind/Body/Soul Categories for Morning/Evening Routines Only
  - **REMOVED**: Mind, Body, Soul category cards from Rituals tab
  - **SIMPLIFIED**: Rituals tab now contains only Morning and Evening routines with active data display
  - **NEW**: Ritual Mastery Dashboard with comprehensive long-term completion and adherence tracking
  - **ENHANCED**: Active data display featuring Daily Completion, Average Streak, Consistency Score, and Total Active Rituals
  - **ADDED**: Weekly Adherence Pattern chart showing completion rates across all seven days
  - **ADDED**: Monthly Progress Trend section with improvement indicators and comparative metrics
  - **STREAMLINED**: Focus on core morning/evening routines with discipline metrics bars for each section
  - **IMPROVED**: Visual data presentation with gradient backgrounds, progress charts, and statistical insights
  - Rituals tab now emphasizes structured daily routines with powerful analytics for long-term habit adherence
- July 11, 2025: Navigation Refined - Disciplines Page with Improved Grid Layout and Challenge Tracking
  - **RENAMED**: "Habits" navigation renamed to "Disciplines" for stronger personal development messaging
  - **RESTRUCTURED**: Disciplines page now has 3 tabs: "Rituals", "Rules", and "Challenge"
  - **NEW**: Challenge tab features 75-100 day commitment challenges with daily check-off functionality
  - **ENHANCED**: Challenge tracking includes progress grids showing completed/current/future days
  - **IMPROVED**: Navigation icons updated - Brain icon for Mind, Dumbbell icon for Body sections
  - **FIXED**: Navigation bar now uses grid-cols-5 layout for proper spacing and centering
  - **MOVED**: Morning and Evening Routine cards relocated from Dashboard to Rituals tab for better organization
  - **RELOCATED**: To-do list moved to top of Dashboard for immediate task focus
  - **SIMPLIFIED**: Dashboard now contains only To-do list, Time Metrics (2x2 grid), and Active Goals
  - **ENHANCED**: 2x2 grid layout for time metrics with larger, more readable tiles
  - Disciplines page emphasizes daily rituals, personal rules, and extended challenges for comprehensive life structure
- July 11, 2025: Dashboard Progress Circles Redesigned with Weekly Time Metrics
  - **TRANSFORMED**: Progress circles replaced with weekly time tracking tiles for personal investments/distractions
  - **NEW**: Reading time tracking (12.5h weekly, with month/total aggregates)
  - **NEW**: Meditation time tracking (3.2h weekly, with month/total aggregates)  
  - **NEW**: Screen time tracking (28h weekly, distraction monitoring)
  - **NEW**: Workout time tracking (6.8h weekly, fitness investment)
  - **REDESIGNED**: Active Goals section with reduced padding and individual tiles matching Body page style
  - **IMPROVED**: Goal tiles now use compact spacing (p-3/p-4) and smaller text for mobile optimization
  - **FOCUSED**: Clear distinction between personal investments (reading, meditation, workouts) and distractions (screen time)
  - Dashboard emphasizes weekly time allocation with comprehensive month/total context for meaningful progress tracking
- July 11, 2025: Body Profile Page Enhanced with Editable Personal Records and Percentage Calculator
  - **NEW**: Edit button on profile tab allowing modification of personal records and body metrics
  - **NEW**: 1 Rep Max percentage calculator showing 60% to 90% in 5% increments for easy workout planning
  - **NEW**: ProfileEditor component with tabbed interface for Personal Records and Body Metrics editing
  - **INTERACTIVE**: Click calculator icon on each exercise to view training percentages instantly
  - **DYNAMIC**: Body metrics display actual values from state (weight, body fat, muscle mass)
  - **ENHANCED**: Toggle between view and edit modes with save/cancel functionality
  - **FIXED**: Database table structure - added missing 'date' column to workout_entries table
  - **IMPROVED**: Personal records now show actual weight values with percentage calculations
  - **ADDED**: Add/Remove workout functionality in profile editor with Plus button and trash icon
  - **SIMPLIFIED**: Body composition now only tracks weight and body fat (removed muscle mass)
  - **REMOVED**: Old progress analytics (Progress Summary, Weekly Volume, Training Focus donut chart)
  - **RESTORED**: New ProgressAnalytics component with time-based toggles and exercise tracking lines
  - **REORGANIZED**: 4-week elite training program moved to very top of workout section above progress analytics
  - Profile editing provides quick access to percentage-based workout planning for technical maximum capacity
- July 11, 2025: Distraction Section Complete Redesign with Day Tabs and Opportunity Cost Tracking
  - **NEW**: Top stats cards showing Total Time, Daily Average, and Top App usage
  - **REDESIGNED**: Day-based tabs (Sunday through Saturday) matching body/todo page style
  - **ENHANCED**: Direct hour/minute input fields on each platform tile for easy time entry
  - **OPTIONAL**: X button on each platform tile to hide unused apps (e.g., remove TikTok)
  - **PERSISTENT**: Hidden platforms saved to localStorage and can be restored with "Show all" link
  - **AUTO-SAVE**: Time entries save automatically when input fields lose focus (onBlur)
  - **CALENDAR**: Monthly view with color-coded daily totals (green <1hr, yellow 1-2hrs, orange 2-3hrs, red 3hrs+)
  - **OPPORTUNITY COST**: Comprehensive conversion table showing:
    - Work weeks and days lost (based on 40-hour weeks)
    - Income opportunity lost at $20, $50, and $100/hour rates
    - Quality time lost (conversations, family dinners, workouts, sleep)
  - **COMPACT**: Smaller input fields (w-14) and labels to ensure all text fits within tiles
  - **VISUAL**: Red-themed opportunity cost section emphasizes the true cost of digital distraction
  - Distraction tracking now provides powerful visualization of time wasted and its real-world impact
- July 11, 2025: Body Analytics Redesigned with Clean Line Graphs and Training Focus Donut Chart
  - **WEEKLY VOLUME**: Clean line graph without dots showing week-by-week weight progression
  - **TRAINING FOCUS**: Donut chart visualization showing workout type distribution (Strength 60%, Cardio 25%, Functional 15%)
  - **PROGRESS SUMMARY**: New section with Phase (Peak), Total Progress (24% with bar), and Weekly Consistency (5/7 days)
  - **REMOVED**: Eliminated dot markers from line graphs for cleaner visualization
  - **REPLACED**: Strength progress and performance trends replaced with training focus wheel chart
  - **ANIMATIONS**: All charts animate on load with staggered delays for visual appeal
  - **ENHANCED AUDIO**: Improved meditation gong sound - louder (0.7 volume) with authentic frequency decay (150Hz to 80Hz)
  - Analytics provide clear visual representation of training patterns and progress metrics
- July 11, 2025: Meditation Page Built with Slider-Based Timer System
  - **NEW**: Meditation tab within Mind page featuring adjustable time sliders
  - **SLIDERS**: Three horizontal sliders for setting preparation (blue), interval (green), and meditation (orange) times
  - **STATS**: Compressed horizontal layout showing Sessions, Streak, and Total Time metrics
  - **AUDIO**: Web Audio API gong sounds at session start, interval transitions, and completion
  - **TRACKING**: Session logging with duration tracking and database persistence
  - **MILESTONES**: 8 achievement tiles tracking progress (First Session, Week Warrior, Mindful Month, Sacred 40, etc.)
  - **MOBILE**: Touch-enabled sliders for both desktop and mobile interaction
  - **BRAND**: Clean white tile design matching platform aesthetic with shadow-md styling
  - Meditation system provides intuitive time adjustment through draggable circles on linear tracks
- July 11, 2025: Mind Page Restructured with Three-Tab System for Reading Content
  - **NEW**: Three-tab structure below reading session timer: List, History, and Insights
  - **LIST TAB**: Shows current reading list with book management features
  - **HISTORY TAB**: Displays past reading sessions with duration and reflections
  - **INSIGHTS TAB**: Stores reflections from reading sessions with ability to manually add insights
  - **INTEGRATION**: Reflections from "End & Reflect" automatically saved as insights
  - **ENHANCED**: Each insight shows with yellow lightbulb icon and timestamps
  - **IMPROVED**: Consistent API endpoint usage (/api/insights) across components
  - Mind page now provides comprehensive tracking of books, sessions, and reading insights
- July 11, 2025: Body Page Analytics Redesigned with Brand-Consistent White/Blue Theme & Animations
  - **BRAND UPDATE**: Changed analytics from dark theme to white backgrounds with blue accents
  - **ANIMATIONS**: Added gradual appearance animations for all charts and graphs on page load
  - **VOLUME GRAPH**: White-themed line graph with blue gradient line and animated data points
  - **STRENGTH BARS**: Progressive blue shading (light to dark) showing strength gains over 12 weeks
  - **MINI CHARTS**: Animated sparklines for Intensity (blue), Recovery (green), and Consistency (purple)
  - **STAGGERED LOADING**: Charts appear sequentially with delays (200ms → 800ms) for smooth visual flow
  - **CSS ANIMATIONS**: Added fadeIn, growUp, drawLine, slideInLeft/Right animations to index.css
  - Analytics now matches app's clean white/blue aesthetic with engaging load animations
- July 11, 2025: Complete Body Page Redesign - Compact Interface with Dropdown Workout Blocks
  - **RENAMED**: "Health" section renamed to "Body" in bottom navigation
  - **COMPACT**: Dramatically reduced all section sizes - header reduced to h-10, smaller text, tighter spacing
  - **DROPDOWNS**: Week-based workout program with expandable dropdown interface
  - **BLOCK FORMAT**: Each workout block displays as "Block A: Exercise Name" with dropdown to workout entry
  - **DATES**: Real date calculations showing actual week ranges and daily dates for workout scheduling
  - **BLUE THEME**: Applied consistent blue coloring to tabs, dropdowns, and section headers per app branding
  - **SHADOWS**: Added drop shadows (shadow-md) to all sections, cards, and buttons for visual depth
  - **NAVIGATION**: Fixed mobile navigation issues by making interface elements much smaller and more accessible
  - **WORKOUT ENTRY**: "Enter Workout" buttons in each block dropdown lead directly to workout logging interface
  - **MOBILE OPTIMIZED**: All elements sized for smooth mobile navigation without off-screen content
  - Body page now provides intuitive, compact workout program management with clear date-based organization
- July 11, 2025: Reverted Health Page to Original Simple Layout with Compact Header
  - **REVERTED**: Returned to original simple layout with training program creator at top and analytics below
  - **COMPACT HEADER**: Reduced header height (h-14) and smaller icons/text for better mobile viewing
  - **SIMPLIFIED**: Removed tab navigation to maintain clean, focused interface
  - **MAINTAINED**: Full-width training program creator with analytics section below
  - **STREAMLINED**: Focused on core functionality without complex navigation layers
  - Health page now maintains simplicity with training program creation as primary focus
- July 11, 2025: Renamed Read to Mind - Added Three-Tab Tracking System
  - **RENAMED**: "Read" navigation renamed to "Mind" for comprehensive mental wellness tracking
  - **NEW**: Three-tab interface for Mind page: Reading, Meditation, and Distraction (Social Media)
  - **MAINTAINED**: Original reading timer and session tracking moved to Reading tab
  - **PREPARED**: Placeholder tabs for Meditation and Distraction tracking (coming soon)
  - **HEADER**: Updated with Brain icon and "Mind Training" title emphasizing mental optimization
  - **DESCRIPTION**: New tagline "Optimize your mental well-being through reading, meditation, and mindful technology use"
  - Mind page now encompasses three key areas of mental wellness and focus management
- July 10, 2025: Redesigned Foundations Sub-page with Calendar-Based Habit Tracking
  - **REDESIGNED**: Foundations page now features month navigation at top (similar to day navigation on You. page)
  - **NEW**: Top-level aggregated calendar showing all habits combined with color-coded completion percentages
  - **NEW**: Individual expandable arrows on each habit that reveal personal 30-day calendar view
  - **IMPROVED**: Habit tiles now in clean list format matching morning/evening routine style
  - **ENHANCED**: Calendar legend with completion rate colors (green=100%, yellow=50%+, red=<50%, gray=none)
  - **REMOVED**: Previous line graph and dropdown category system replaced with expandable individual habit calendars
  - **ORGANIZED**: Clean category sections (Mind, Body, Soul) with proper color theming and spacing
  - Foundation consistency tracking now emphasizes visual calendar patterns over analytics metrics
- July 9, 2025: Enhanced Foundations Sub-page with Multi-Habit Line Graph and Detailed Tracking
  - **REMOVED**: Black foundation consistency analytics dashboard for cleaner layout
  - **NEW**: Multi-habit line graph where each foundation habit has its own colored line showing 30-day consistency trends
  - **ENHANCED**: Individual habit tiles now show streak count and completed/total days (e.g., "15 day streak" and "15/16 days")
  - **NEW**: Numbers tracked above dot graph showing Avg, Peak, and Today metrics in header
  - **IMPROVED**: Color-coded legend below graph for up to 8 habits with truncated names for space efficiency
  - **STREAMLINED**: Removed excessive vertical scrolling by compressing analytics into single graph component
  - **VISUAL**: Live data visualization with active dots and smooth lines for each habit's consistency pattern
  - **GAMIFIED**: Focus on long-term consistency percentages rather than daily completion metrics
  - Foundations page now emphasizes individual habit tracking with comprehensive visual analytics
- July 9, 2025: Redesigned Navigation Bar with Prominent Center Button
  - **REDESIGNED**: Bottom navigation bar now follows 1st Phorm app design with prominent black circle for You. button in center
  - **BRANDING**: Center button features .uoY logo with black circular background and subtle scaling animations
  - **LAYOUT**: Four-item layout - Habits/Goals on left, Read/Health on right, centered You. button elevated above bar
  - **VISUAL**: Clean white background with increased height (h-20) and better spacing for elevated center button
  - **IMPROVED**: Larger touch targets (w-6 h-6) and better visual hierarchy with blue active states
  - **MOBILE**: Added bottom padding (pb-24) to all pages (dashboard, habits, goals, read, health, vision) for new taller navigation bar
  - **ENHANCED**: Center button now smaller (w-14 h-14) with deeper gradient (from-gray-900 to-black) for more prominent appearance
  - **FIXED**: Updated to use correct .uoY logo asset and proper scaling for mobile optimization
  - Navigation creates focal point on dashboard access while maintaining clean aesthetic
- July 9, 2025: Mobile-Optimized Dashboard with Enhanced Routine Tracking
  - **MOBILE**: Added mobile day selector with arrow navigation for easy day switching on small screens
  - **ENHANCED**: Discipline metrics bars added to Morning/Evening routines with colorful progress tracking and streak data
  - **NEW**: Floating plus buttons on all routine and task tiles for quick item addition
  - **IMPROVED**: Four progress circles now include real-time routine completion tracking (Habits, Tasks, Routines, Goals)
  - **RESPONSIVE**: All text, buttons, and spacing optimized for mobile with responsive font sizes and compact layouts
  - **STREAKS**: Added streak tracking with color-coded badges showing routine consistency (green = on track, orange = needs attention)
  - **VISUAL**: Light-themed discipline metrics with gradient progress bars instead of dark fitness-style layout
  - **OPTIMIZED**: Goal cards, routine tiles, and all sections now properly scale and truncate text for mobile devices
  - Three-column layout collapses to single column on mobile with improved touch targets and spacing
- July 7, 2025: Restructured Navigation - You. Dashboard is Now Home Page
  - **MAJOR**: You. dashboard page is now the main landing page (/) instead of home timeline
  - **REMOVED**: Home page with social timeline removed from routing
  - **UPDATED**: Bottom navigation now shows "You" as home instead of separate "Home" and "You" tabs
  - **IMPROVED**: Progress circles layout changed to four across (grid-cols-4) instead of responsive 2/4 layout
  - **ENHANCED**: Progress circles made more compact (w-16 h-16 instead of w-20 h-20) for better mobile display
  - **STREAMLINED**: Text labels shortened for mobile-friendly display (Daily, Today, Weekly instead of full descriptions)
  - Navigation now focuses on core productivity sections: You (dashboard), Habits, Goals, Read, Health, Vision
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
  - **ENHANCED**: Category trends chart now aggregates total performance (e1RM) per category instead of exercise count
  - **IMPROVED**: Combined all exercises within each category into single trend line showing cumulative performance progression
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