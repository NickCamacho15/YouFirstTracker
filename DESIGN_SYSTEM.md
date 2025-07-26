# YouFirst Tracker - UI Design System Documentation

## 🎨 Core Design Principles

The YouFirst Tracker application follows a modern, clean design system with a focus on card-based components, consistent spacing, and a unified color palette. This document outlines the design patterns implemented in the Body page that should be replicated across all other pages for consistency.

### Card-Based UI Architecture

The application follows a card-based design system where each functional section is contained within a clean card component. This creates visual separation between different functional areas while maintaining a cohesive overall aesthetic.

## 📐 Component Guidelines

### 1. Card Components

**Standard Card Structure:**
```tsx
<Card className="border-0 shadow-lg mb-6">
  <CardHeader className="pb-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <IconComponent className="w-4 h-4 text-blue-600" />
        <CardTitle className="text-base sm:text-lg">Section Title</CardTitle>
      </div>
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
        <ActionIcon className="w-4 h-4" />
      </Button>
    </div>
  </CardHeader>
  <CardContent>
    {/* Card content here */}
  </CardContent>
</Card>
```

**Card Styling Options:**
- **Standard Card**: `border-0 shadow-lg mb-6`
- **Subtle Card**: `border border-gray-200 shadow-sm mb-6`
- **Accent Card**: `border-0 shadow-md mb-6 bg-gradient-to-r from-blue-50 to-indigo-50`

### 2. Data Presentation Patterns

**Metric Display Pattern:**
```tsx
<div className="flex items-center justify-between">
  <div>
    <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Metric Label</h4>
    <div className="flex items-baseline gap-2 mt-0.5">
      <p className="text-base font-bold text-gray-900">225 lbs</p>
      <p className="text-xs font-bold text-blue-600">Secondary Info</p>
    </div>
  </div>
  <div className="text-right">
    <p className="text-xl font-bold text-blue-600">83%</p>
    <p className="text-[10px] text-gray-500">context text</p>
  </div>
</div>
```

**Large Metric Pattern:**
```tsx
<div className="flex justify-between items-center">
  <span className="text-gray-600">Total Workouts</span>
  <span className="text-2xl font-bold text-gray-900">247</span>
</div>
```

**Progress Bar Pattern:**
```tsx
<div className="mt-2">
  <div className="flex items-center justify-between mb-1">
    <span className="text-xs text-gray-600">Label</span>
    <span className="text-xs font-semibold text-blue-600">75%</span>
  </div>
  <div className="h-1.5 bg-gray-200 rounded-full">
    <div 
      className="h-1.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
      style={{ width: `75%` }}
    ></div>
  </div>
</div>
```

### 3. Common UI Patterns

**Section Headers:**
- Use icon + title pattern consistently
- Header icon should use accent color
- Maintain consistent spacing (gap-2)

**Checkboxes & Toggle Items:**
```tsx
<div className="flex items-center space-x-3">
  <div 
    className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer ${
      completed ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
    }`}
    onClick={handleToggle}
  >
    {completed && <CheckCircle2 className="w-3 h-3 text-white" />}
  </div>
  <span className={`text-sm font-medium ${completed ? 'text-gray-500' : 'text-gray-800'}`}>
    Label Text
  </span>
</div>
```

**Stat Cards:**
```tsx
<div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 text-center">
  <div className="text-2xl font-bold text-blue-600">247</div>
  <p className="text-sm text-gray-600 mt-1">Stat Label</p>
  <div className="flex items-center justify-center gap-1 mt-2">
    <IconComponent className="w-4 h-4 text-blue-500" />
    <span className="text-xs text-gray-600">context</span>
  </div>
</div>
```

## 🎭 Color System

### Primary Colors
- **Blue**: `#3b82f6` (text-blue-600) - Primary actions, highlights
- **Purple**: `#8b5cf6` (text-purple-600) - Secondary actions, alternatives
- **Green**: `#10b981` (text-green-600) - Success states, positive metrics

### Background Gradients
- **Blue Gradient**: `bg-gradient-to-r from-blue-50 to-indigo-50` - Primary sections
- **Purple Gradient**: `bg-gradient-to-r from-purple-50 to-indigo-50` - Secondary sections
- **Green Gradient**: `bg-gradient-to-br from-green-50 to-emerald-50` - Success metrics

### Text Colors
- **Primary Text**: `text-gray-900` - Main headings and important text
- **Secondary Text**: `text-gray-600` - Labels and secondary content
- **Tertiary Text**: `text-gray-500` - Subtle text and hints

## 📱 Responsive Design

### Mobile-First Approach
- Use `sm:` prefix for tablet and larger screens
- Default styling should be optimized for mobile
- Example: `className="text-base sm:text-lg"`

### Standard Spacing
- **Card Margins**: `mb-6` (consistent vertical rhythm)
- **Content Padding**: `p-4` or `p-6` (consistent internal spacing)
- **Element Spacing**: `gap-2` for small elements, `gap-4` for larger sections

## Example Implementation

Here's how to implement this design system in your components:

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Dumbbell, Activity } from "lucide-react";

export function SampleComponent() {
  return (
    <div className="min-h-screen bg-white">
      <main className="p-4 pb-24">
        {/* Card Component */}
        <Card className="border-0 shadow-lg mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                <CardTitle className="text-base sm:text-lg">Training Stats</CardTitle>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
              >
                <Activity className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Workouts</span>
                <span className="text-2xl font-bold text-gray-900">247</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Avg. Workout Duration</span>
                <span className="text-2xl font-bold text-gray-900">52 mins</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Grid of Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">247</div>
            <p className="text-sm text-gray-600 mt-1">Total Workouts</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">12</div>
            <p className="text-sm text-gray-600 mt-1">Day Streak</p>
          </div>
        </div>
      </main>
    </div>
  );
}
```

By following this design system, all pages will maintain a consistent look and feel while providing a premium user experience. 