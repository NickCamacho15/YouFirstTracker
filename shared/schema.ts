import { pgTable, text, serial, integer, boolean, timestamp, date, uuid, varchar, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  passwordHash: text("password_hash").notNull(),
  bio: text("bio"),
  profileImageUrl: text("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type", { enum: ["physical", "financial", "career", "personal", "health"] }).default("personal").notNull(),
  benefits: text("benefits").array().notNull(), // At least 3 benefits
  consequences: text("consequences").array().notNull(), // What happens if you don't follow through
  peopleHelped: text("people_helped").array(), // People who will benefit from this goal
  dueDate: timestamp("due_date"),
  completed: boolean("completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const microGoals = pgTable("micro_goals", {
  id: serial("id").primaryKey(),
  goalId: integer("goal_id").references(() => goals.id).notNull(),
  title: text("title").notNull(),
  completed: boolean("completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  frequency: text("frequency").default("daily").notNull(),
  streak: integer("streak").default(0).notNull(),
  reasons: text("reasons").array(),
  category: text("category", { enum: ["mind", "body", "soul"] }).default("mind").notNull(),
  timeOfDay: text("time_of_day", { enum: ["morning", "afternoon", "evening", "anytime"] }).default("anytime").notNull(),
  reminder: text("reminder").notNull(),
  routine: text("routine").notNull(),
  reward: text("reward").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const habitLogs = pgTable("habit_logs", {
  id: serial("id").primaryKey(),
  habitId: integer("habit_id").references(() => habits.id).notNull(),
  date: timestamp("date").defaultNow().notNull(),
  completed: boolean("completed").notNull(),
});

export const readingSessions = pgTable("reading_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  bookTitle: text("book_title").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  reflection: text("reflection"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const readingList = pgTable("reading_list", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  author: text("author"),
  isCompleted: boolean("is_completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const meditationSessions = pgTable("meditation_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  duration: integer("duration").notNull(), // in minutes
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Social features
export const followers = pgTable("followers", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").references(() => users.id).notNull(),
  followingId: integer("following_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // goal, micro-goal, habit, reflection, milestone
  message: text("message").notNull(),
  relatedId: integer("related_id"), // ID of related goal/habit/session
  isPrivate: boolean("is_private").default(false).notNull(),
  metadata: text("metadata"), // JSON string for additional data like streaks, milestones
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const postReactions = pgTable("post_reactions", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type", { enum: ["heart", "fire", "pray", "celebrate"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const postComments = pgTable("post_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const rules = pgTable("rules", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category", { enum: ["digital", "nutrition", "sleep", "mental", "fitness", "personal"] }).default("personal").notNull(),
  streak: integer("streak").default(0).notNull(),
  completedToday: boolean("completed_today").default(false).notNull(),
  lastCompletionTime: timestamp("last_completion_time"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ruleLogs = pgTable("rule_logs", {
  id: serial("id").primaryKey(),
  ruleId: integer("rule_id").references(() => rules.id).notNull(),
  date: timestamp("date").defaultNow().notNull(),
  kept: boolean("kept").notNull(),
});

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  duration: integer("duration", { enum: [40, 70, 100] }).notNull(),
  startDate: timestamp("start_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const challengeLogs = pgTable("challenge_logs", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id").references(() => challenges.id).notNull(),
  day: integer("day").notNull(),
  completed: boolean("completed").notNull(),
  date: timestamp("date").defaultNow().notNull(),
});

export const visionBoard = pgTable("vision_board", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  imageUrl: text("image_url").notNull(),
  caption: text("caption"),
  position: integer("position").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  goalId: integer("goal_id").references(() => goals.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority").notNull().default("medium"), // low, medium, high, critical
  completed: boolean("completed").notNull().default(false),
  dueDate: timestamp("due_date"),
  timeframe: text("timeframe").notNull().default("today"), // today, week, month
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});



export const userStats = pgTable("user_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  totalTasksCompleted: integer("total_tasks_completed").notNull().default(0),
  totalGoalsCompleted: integer("total_goals_completed").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastActiveDate: date("last_active_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insights tracking table
export const insights = pgTable("insights", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category"), // reflection, breakthrough, lesson, etc.
  tags: text("tags").array(),
  isPrivate: boolean("is_private").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User profile extensions for social features
export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
  bio: text("bio"),
  location: text("location"),
  website: text("website"),
  joinedAt: timestamp("joined_at").defaultNow(),
  totalReadingMinutes: integer("total_reading_minutes").default(0),
  booksCompleted: integer("books_completed").default(0),
  favoriteGenres: text("favorite_genres").array(),
  currentlyReading: text("currently_reading"),
  profileVisibility: text("profile_visibility").default("public"), // public, private, friends
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Workout tracking tables
export const workouts = pgTable("workouts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  date: date("date").notNull(),
  notes: text("notes"),
  duration: integer("duration"), // in minutes
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  category: text("category", { enum: ["strength", "cardio", "functional"] }).default("strength").notNull(),
  muscleGroups: text("muscle_groups").array(), // e.g., ["chest", "triceps", "shoulders"]
  equipment: text("equipment"), // e.g., "barbell", "dumbbells", "bodyweight"
  instructions: text("instructions"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Screen time tracking for distraction monitoring
export const screenTimeEntries = pgTable("screen_time_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  platform: text("platform").notNull(), // Instagram, TikTok, Snapchat, X
  timeMinutes: integer("time_minutes").notNull(),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Workout entries for tracking individual exercises
export const workoutEntries = pgTable("workout_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  weekNumber: integer("week_number").notNull(),
  dayNumber: integer("day_number").notNull(),
  blockLetter: text("block_letter").notNull(), // "A", "B", "C"
  category: text("category", { enum: ["strength", "cardio", "functional"] }).notNull(),
  exerciseName: text("exercise_name").notNull(),
  // Strength fields
  weight: integer("weight"), // in lbs
  reps: integer("reps"),
  // Cardio fields
  time: integer("time"), // in seconds
  calories: integer("calories"),
  effort: integer("effort"), // 1-10 scale
  // Functional fields
  duration: integer("duration"), // in seconds
  // Common fields
  notes: text("notes"),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Fitness Profile for workout program generation
export const fitnessProfiles = pgTable("fitness_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
  age: integer("age").notNull(),
  gender: text("gender", { enum: ["male", "female", "other"] }).notNull(),
  fitnessLevel: text("fitness_level", { enum: ["beginner", "intermediate", "advanced", "elite"] }).notNull(),
  fitnessGoal: text("fitness_goal", { enum: ["strength", "muscle_mass", "endurance", "fat_loss", "general_fitness", "athletic_performance"] }).notNull(),
  trainingGoal: text("training_goal", { enum: ["explosiveness", "strength", "hybrid", "weight_loss"] }).notNull(),
  injuriesPains: text("injuries_pains").array(), // e.g., ["knee", "shoulder", "back"]
  workoutDaysPerWeek: integer("workout_days_per_week").default(3).notNull(),
  workoutDuration: integer("workout_duration").default(60).notNull(), // in minutes
  equipment: text("equipment").array(), // available equipment
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Generated workout programs
export const workoutPrograms = pgTable("workout_programs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  duration: integer("duration").default(4).notNull(), // weeks
  weeklySchedule: text("weekly_schedule").array(), // e.g., ["legs", "push", "pull", "rest"]
  fitnessLevel: text("fitness_level", { enum: ["beginner", "intermediate", "advanced", "elite"] }).notNull(),
  fitnessGoal: text("fitness_goal", { enum: ["strength", "muscle_mass", "endurance", "fat_loss", "general_fitness", "athletic_performance"] }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Weekly workout templates within programs
export const programWeeks = pgTable("program_weeks", {
  id: serial("id").primaryKey(),
  programId: integer("program_id").references(() => workoutPrograms.id, { onDelete: "cascade" }).notNull(),
  weekNumber: integer("week_number").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Daily workout templates within weeks
export const programDays = pgTable("program_days", {
  id: serial("id").primaryKey(),
  programWeekId: integer("program_week_id").references(() => programWeeks.id, { onDelete: "cascade" }).notNull(),
  dayNumber: integer("day_number").notNull(), // 1-7 for days of week
  name: text("name").notNull(), // e.g., "Legs", "Push", "Pull", "Rest"
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Workout blocks within daily workouts (warmup, main_a, main_b, finisher)
export const programBlocks = pgTable("program_blocks", {
  id: serial("id").primaryKey(),
  programDayId: integer("program_day_id").references(() => programDays.id, { onDelete: "cascade" }).notNull(),
  blockType: text("block_type", { enum: ["warmup", "main_a", "main_b", "finisher"] }).notNull(),
  name: text("name").notNull(), // e.g., "Warm-up", "Main Block A", "Finisher"
  description: text("description"),
  orderIndex: integer("order_index").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Exercises within blocks
export const programExercises = pgTable("program_exercises", {
  id: serial("id").primaryKey(),
  programBlockId: integer("program_block_id").references(() => programBlocks.id, { onDelete: "cascade" }).notNull(),
  exerciseName: text("exercise_name").notNull(), // Store name directly for flexibility
  sets: integer("sets").notNull(),
  reps: text("reps").notNull(), // Can be "8-12", "10", "AMRAP", etc.
  weight: text("weight"), // Can be "135 lbs", "bodyweight", "challenging", etc.
  restPeriod: text("rest_period"), // e.g., "60s", "2-3min"
  orderIndex: integer("order_index").default(0).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User progress tracking for program exercises
export const programProgress = pgTable("program_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  programExerciseId: integer("program_exercise_id").references(() => programExercises.id, { onDelete: "cascade" }).notNull(),
  date: date("date").notNull(),
  actualSets: integer("actual_sets"),
  actualReps: integer("actual_reps"),
  actualWeight: integer("actual_weight"),
  completed: boolean("completed").default(false).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workoutExercises = pgTable("workout_exercises", {
  id: serial("id").primaryKey(),
  workoutId: integer("workout_id").references(() => workouts.id, { onDelete: "cascade" }).notNull(),
  exerciseId: integer("exercise_id").references(() => exercises.id).notNull(),
  sets: integer("sets").notNull(),
  reps: integer("reps"),
  weight: integer("weight"), // in lbs
  duration: integer("duration"), // in seconds for time-based exercises
  distance: integer("distance"), // in meters for distance-based exercises
  restTime: integer("rest_time"), // in seconds
  notes: text("notes"),
  orderIndex: integer("order_index").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bodyWeightLogs = pgTable("body_weight_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  weight: integer("weight").notNull(), // in lbs * 10 (e.g., 1735 = 173.5 lbs)
  date: date("date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const trainingTemplates = pgTable("training_templates", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  templateData: text("template_data").notNull(), // JSON stringified template structure
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const exerciseHistory = pgTable("exercise_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  exerciseName: text("exercise_name").notNull(),
  category: text("category"), // warmup, block_a, block_b, block_c
  usageCount: integer("usage_count").default(1),
  lastUsed: timestamp("last_used").defaultNow(),
});

// Nutrition Plan
export const nutritionPlans = pgTable("nutrition_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  dailyCalories: integer("daily_calories").notNull(),
  proteinGrams: integer("protein_grams").notNull(),
  carbsGrams: integer("carbs_grams").notNull(),
  fatGrams: integer("fat_grams").notNull(),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Meals
export const meals = pgTable("meals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  nutritionPlanId: integer("nutrition_plan_id").references(() => nutritionPlans.id),
  name: varchar("name", { length: 255 }).notNull(),
  mealType: varchar("meal_type", { length: 50 }).notNull(), // breakfast, lunch, dinner, snack
  calories: integer("calories").notNull(),
  proteinGrams: decimal("protein_grams", { precision: 6, scale: 2 }).notNull(),
  carbsGrams: decimal("carbs_grams", { precision: 6, scale: 2 }).notNull(),
  fatGrams: decimal("fat_grams", { precision: 6, scale: 2 }).notNull(),
  ingredients: text("ingredients").array(),
  instructions: text("instructions"),
  date: date("date").notNull(),
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
  createdAt: true,
  completed: true,
}).extend({
  dueDate: z.string().optional().transform((val) => val && val !== "" ? new Date(val) : undefined),
  benefits: z.array(z.string().min(1)).min(3, "At least 3 benefits are required"),
  consequences: z.array(z.string().min(1)).min(1, "At least 1 consequence is required"),
});

export const insertMicroGoalSchema = createInsertSchema(microGoals).omit({
  id: true,
  createdAt: true,
  completed: true,
});

export const insertHabitSchema = createInsertSchema(habits).omit({
  id: true,
  createdAt: true,
  streak: true,
}).extend({
  reasons: z.array(z.string().min(1, "Reason cannot be empty")).min(3, "Please provide exactly 3 reasons").max(3, "Please provide exactly 3 reasons"),
  reminder: z.string().min(1, "Reminder is required"),
  routine: z.string().min(1, "Routine is required"),
  reward: z.string().min(1, "Reward is required"),
});

export const insertHabitLogSchema = createInsertSchema(habitLogs).omit({
  id: true,
});

export const insertReadingSessionSchema = createInsertSchema(readingSessions).omit({
  id: true,
  createdAt: true,
}).extend({
  startTime: z.string().transform((val) => new Date(val)),
  endTime: z.string().transform((val) => new Date(val)),
});

export const insertReadingListSchema = createInsertSchema(readingList).omit({
  id: true,
  createdAt: true,
  isCompleted: true,
  completedAt: true,
});

export const insertMeditationSessionSchema = createInsertSchema(meditationSessions).omit({
  id: true,
  createdAt: true,
});

export const insertFollowerSchema = createInsertSchema(followers).omit({
  id: true,
  createdAt: true,
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
});

export const insertPostReactionSchema = createInsertSchema(postReactions).omit({
  id: true,
  createdAt: true,
});

export const insertPostCommentSchema = createInsertSchema(postComments).omit({
  id: true,
  createdAt: true,
});

export const insertVisionBoardSchema = createInsertSchema(visionBoard).omit({
  id: true,
  createdAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  completedAt: true,
}).extend({
  dueDate: z.string().optional().transform((val) => val && val !== "" ? new Date(val) : undefined),
});

export const insertRuleSchema = createInsertSchema(rules).omit({
  id: true,
  createdAt: true,
  lastCompletionTime: true,
  lastViolationTime: true,
});

export const insertUserStatsSchema = createInsertSchema(userStats).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInsightSchema = createInsertSchema(insights).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWorkoutSchema = createInsertSchema(workouts).omit({
  id: true,
  createdAt: true,
}).extend({
  date: z.string().transform((val) => val),
});

export const insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true,
  createdAt: true,
});

export const insertWorkoutExerciseSchema = createInsertSchema(workoutExercises).omit({
  id: true,
  createdAt: true,
});

export const insertBodyWeightLogSchema = createInsertSchema(bodyWeightLogs).omit({
  id: true,
  createdAt: true,
}).extend({
  date: z.string().transform((val) => val),
});

export const insertNutritionPlanSchema = createInsertSchema(nutritionPlans).omit({
  id: true,
  createdAt: true,
});

export const insertMealSchema = createInsertSchema(meals).omit({
  id: true,
  createdAt: true,
}).extend({
  date: z.string().transform((val) => val),
});

export const insertFitnessProfileSchema = createInsertSchema(fitnessProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWorkoutProgramSchema = createInsertSchema(workoutPrograms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProgramWeekSchema = createInsertSchema(programWeeks).omit({
  id: true,
  createdAt: true,
});

export const insertProgramDaySchema = createInsertSchema(programDays).omit({
  id: true,
  createdAt: true,
});

export const insertProgramExerciseSchema = createInsertSchema(programExercises).omit({
  id: true,
  createdAt: true,
});

export const insertProgramProgressSchema = createInsertSchema(programProgress).omit({
  id: true,
  createdAt: true,
}).extend({
  date: z.string().transform((val) => val),
});

export const insertTrainingTemplateSchema = createInsertSchema(trainingTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertExerciseHistorySchema = createInsertSchema(exerciseHistory).omit({
  id: true,
  lastUsed: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Goal = typeof goals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type MicroGoal = typeof microGoals.$inferSelect;
export type InsertMicroGoal = z.infer<typeof insertMicroGoalSchema>;
export type Habit = typeof habits.$inferSelect;
export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type HabitLog = typeof habitLogs.$inferSelect;
export type InsertHabitLog = z.infer<typeof insertHabitLogSchema>;
export type ReadingSession = typeof readingSessions.$inferSelect;
export type InsertReadingSession = z.infer<typeof insertReadingSessionSchema>;
export type ReadingListItem = typeof readingList.$inferSelect;
export type InsertReadingListItem = z.infer<typeof insertReadingListSchema>;
export type MeditationSession = typeof meditationSessions.$inferSelect;
export type InsertMeditationSession = z.infer<typeof insertMeditationSessionSchema>;
export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type VisionBoardItem = typeof visionBoard.$inferSelect;
export type InsertVisionBoardItem = z.infer<typeof insertVisionBoardSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Rule = typeof rules.$inferSelect;
export type InsertRule = z.infer<typeof insertRuleSchema>;
export type UserStats = typeof userStats.$inferSelect;
export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;
export type Follower = typeof followers.$inferSelect;
export type InsertFollower = z.infer<typeof insertFollowerSchema>;
export type PostReaction = typeof postReactions.$inferSelect;
export type InsertPostReaction = z.infer<typeof insertPostReactionSchema>;
export type PostComment = typeof postComments.$inferSelect;
export type InsertPostComment = z.infer<typeof insertPostCommentSchema>;
export type Insight = typeof insights.$inferSelect;
export type InsertInsight = z.infer<typeof insertInsightSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type Workout = typeof workouts.$inferSelect;
export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;
export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type WorkoutExercise = typeof workoutExercises.$inferSelect;
export type InsertWorkoutExercise = z.infer<typeof insertWorkoutExerciseSchema>;
export type BodyWeightLog = typeof bodyWeightLogs.$inferSelect;
export type InsertBodyWeightLog = z.infer<typeof insertBodyWeightLogSchema>;
export type NutritionPlan = typeof nutritionPlans.$inferSelect;
export type InsertNutritionPlan = z.infer<typeof insertNutritionPlanSchema>;
export type Meal = typeof meals.$inferSelect;
export type InsertMeal = z.infer<typeof insertMealSchema>;
export type FitnessProfile = typeof fitnessProfiles.$inferSelect;
export type InsertFitnessProfile = z.infer<typeof insertFitnessProfileSchema>;
export type WorkoutProgram = typeof workoutPrograms.$inferSelect;
export type InsertWorkoutProgram = z.infer<typeof insertWorkoutProgramSchema>;
export type ProgramWeek = typeof programWeeks.$inferSelect;
export type InsertProgramWeek = z.infer<typeof insertProgramWeekSchema>;
export type ProgramDay = typeof programDays.$inferSelect;
export type InsertProgramDay = z.infer<typeof insertProgramDaySchema>;
export type ProgramExercise = typeof programExercises.$inferSelect;
export type InsertProgramExercise = z.infer<typeof insertProgramExerciseSchema>;
export type ProgramProgress = typeof programProgress.$inferSelect;
export type InsertProgramProgress = z.infer<typeof insertProgramProgressSchema>;
export type TrainingTemplate = typeof trainingTemplates.$inferSelect;
export type InsertTrainingTemplate = z.infer<typeof insertTrainingTemplateSchema>;
export type ExerciseHistoryItem = typeof exerciseHistory.$inferSelect;
export type InsertExerciseHistory = z.infer<typeof insertExerciseHistorySchema>;

// Screen time schemas
export const insertScreenTimeEntrySchema = createInsertSchema(screenTimeEntries);
export type ScreenTimeEntry = typeof screenTimeEntries.$inferSelect;
export type InsertScreenTimeEntry = z.infer<typeof insertScreenTimeEntrySchema>;

// Workout entry schemas
export const insertWorkoutEntrySchema = createInsertSchema(workoutEntries).omit({
  id: true,
  createdAt: true,
}).extend({
  date: z.string().transform((val) => val),
});
export type WorkoutEntry = typeof workoutEntries.$inferSelect;
export type InsertWorkoutEntry = z.infer<typeof insertWorkoutEntrySchema>;

// Rules schemas
export type Rule = typeof rules.$inferSelect;
export type InsertRule = z.infer<typeof insertRuleSchema>;

export const insertRuleLogSchema = createInsertSchema(ruleLogs).omit({
  id: true,
});
export type RuleLog = typeof ruleLogs.$inferSelect;
export type InsertRuleLog = z.infer<typeof insertRuleLogSchema>;

// Challenge schemas
export const insertChallengeSchema = createInsertSchema(challenges).omit({
  id: true,
  createdAt: true,
}).extend({
  startDate: z.string().transform((val) => new Date(val)),
});
export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;

export const insertChallengeLogSchema = createInsertSchema(challengeLogs).omit({
  id: true,
  date: true,
});
export type ChallengeLog = typeof challengeLogs.$inferSelect;
export type InsertChallengeLog = z.infer<typeof insertChallengeLogSchema>;
