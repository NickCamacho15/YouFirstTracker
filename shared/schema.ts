import { pgTable, text, serial, integer, boolean, timestamp, date, uuid } from "drizzle-orm/pg-core";
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

export const rules = pgTable("rules", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  text: text("text").notNull(),
  category: text("category").notNull().default("Personal"), // Digital Wellness, Nutrition, Sleep Hygiene, Mental Health, Fitness, Personal
  streak: integer("streak").default(0).notNull(),
  failures: integer("failures").default(0).notNull(),
  completedToday: boolean("completed_today").default(false).notNull(),
  violated: boolean("violated").default(false).notNull(),
  lastCompletionTime: timestamp("last_completion_time"),
  lastViolationTime: timestamp("last_violation_time"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
});

export const insertHabitLogSchema = createInsertSchema(habitLogs).omit({
  id: true,
});

export const insertReadingSessionSchema = createInsertSchema(readingSessions).omit({
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
