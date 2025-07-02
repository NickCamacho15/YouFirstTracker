import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, desc, and, sql } from "drizzle-orm";
import bcrypt from "bcrypt";
import { 
  users, goals, microGoals, habits, habitLogs, readingSessions, posts, visionBoard, tasks,
  followers, postReactions, postComments,
  type User, type InsertUser, type Goal, type InsertGoal, type MicroGoal, type InsertMicroGoal,
  type Habit, type InsertHabit, type HabitLog, type InsertHabitLog,
  type ReadingSession, type InsertReadingSession, type Post, type InsertPost,
  type VisionBoardItem, type InsertVisionBoardItem, type Task, type InsertTask,
  type Follower, type InsertFollower, type PostReaction, type InsertPostReaction,
  type PostComment, type InsertPostComment
} from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const sql_client = neon(process.env.DATABASE_URL);
const db = drizzle(sql_client);

export interface IStorage {
  // Users
  getUserById(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser & { password: string }): Promise<User>;
  validatePassword(email: string, password: string): Promise<User | null>;

  // Goals
  getGoalsByUserId(userId: number): Promise<Goal[]>;
  getGoalById(id: number): Promise<Goal | undefined>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: number, updates: Partial<Goal>): Promise<Goal | undefined>;
  deleteGoal(id: number): Promise<boolean>;

  // Micro Goals
  getMicroGoalsByGoalId(goalId: number): Promise<MicroGoal[]>;
  createMicroGoal(microGoal: InsertMicroGoal): Promise<MicroGoal>;
  updateMicroGoal(id: number, updates: Partial<MicroGoal>): Promise<MicroGoal | undefined>;
  deleteMicroGoal(id: number): Promise<boolean>;

  // Habits
  getHabitsByUserId(userId: number): Promise<Habit[]>;
  getHabitById(id: number): Promise<Habit | undefined>;
  createHabit(habit: InsertHabit): Promise<Habit>;
  updateHabit(id: number, updates: Partial<Habit>): Promise<Habit | undefined>;
  deleteHabit(id: number): Promise<boolean>;

  // Habit Logs
  getHabitLogsByHabitId(habitId: number): Promise<HabitLog[]>;
  getHabitLogByDate(habitId: number, date: Date): Promise<HabitLog | undefined>;
  createHabitLog(log: InsertHabitLog): Promise<HabitLog>;
  updateHabitLog(id: number, updates: Partial<HabitLog>): Promise<HabitLog | undefined>;

  // Reading Sessions
  getReadingSessionsByUserId(userId: number): Promise<ReadingSession[]>;
  createReadingSession(session: InsertReadingSession): Promise<ReadingSession>;

  // Posts
  getRecentPosts(limit?: number): Promise<(Post & { user: Pick<User, 'displayName'> })[]>;
  createPost(post: InsertPost): Promise<Post>;

  // Vision Board
  getVisionBoardByUserId(userId: number): Promise<VisionBoardItem[]>;
  createVisionBoardItem(item: InsertVisionBoardItem): Promise<VisionBoardItem>;
  deleteVisionBoardItem(id: number): Promise<boolean>;

  // Tasks
  getTasksByUserId(userId: number): Promise<Task[]>;
  getTaskById(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, updates: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;

  // Social Features
  followUser(followerId: number, followingId: number): Promise<Follower>;
  unfollowUser(followerId: number, followingId: number): Promise<boolean>;
  getFollowers(userId: number): Promise<(Follower & { follower: Pick<User, 'id' | 'displayName'> })[]>;
  getFollowing(userId: number): Promise<(Follower & { following: Pick<User, 'id' | 'displayName'> })[]>;
  getTimelinePosts(userId: number, limit?: number): Promise<(Post & { user: Pick<User, 'displayName'> })[]>;
  
  // Post Reactions
  addPostReaction(reaction: InsertPostReaction): Promise<PostReaction>;
  removePostReaction(postId: number, userId: number): Promise<boolean>;
  getPostReactions(postId: number): Promise<(PostReaction & { user: Pick<User, 'displayName'> })[]>;
  
  // Post Comments
  addPostComment(comment: InsertPostComment): Promise<PostComment>;
  getPostComments(postId: number): Promise<(PostComment & { user: Pick<User, 'displayName'> })[]>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUserById(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(userData: InsertUser & { password: string }): Promise<User> {
    const { password, ...userInsert } = userData;
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await db.insert(users).values({
      ...userInsert,
      passwordHash,
    }).returning();
    return result[0];
  }

  async validatePassword(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.passwordHash);
    return isValid ? user : null;
  }

  // Goals
  async getGoalsByUserId(userId: number): Promise<Goal[]> {
    return await db.select().from(goals).where(eq(goals.userId, userId)).orderBy(desc(goals.createdAt));
  }

  async getGoalById(id: number): Promise<Goal | undefined> {
    const result = await db.select().from(goals).where(eq(goals.id, id)).limit(1);
    return result[0];
  }

  async createGoal(goal: InsertGoal): Promise<Goal> {
    const result = await db.insert(goals).values(goal).returning();
    return result[0];
  }

  async updateGoal(id: number, updates: Partial<Goal>): Promise<Goal | undefined> {
    const result = await db.update(goals).set(updates).where(eq(goals.id, id)).returning();
    return result[0];
  }

  async deleteGoal(id: number): Promise<boolean> {
    const result = await db.delete(goals).where(eq(goals.id, id));
    return result.rowCount > 0;
  }

  // Micro Goals
  async getMicroGoalsByGoalId(goalId: number): Promise<MicroGoal[]> {
    return await db.select().from(microGoals).where(eq(microGoals.goalId, goalId)).orderBy(microGoals.createdAt);
  }

  async createMicroGoal(microGoal: InsertMicroGoal): Promise<MicroGoal> {
    const result = await db.insert(microGoals).values(microGoal).returning();
    return result[0];
  }

  async updateMicroGoal(id: number, updates: Partial<MicroGoal>): Promise<MicroGoal | undefined> {
    const result = await db.update(microGoals).set(updates).where(eq(microGoals.id, id)).returning();
    return result[0];
  }

  async deleteMicroGoal(id: number): Promise<boolean> {
    const result = await db.delete(microGoals).where(eq(microGoals.id, id));
    return result.rowCount > 0;
  }

  // Habits
  async getHabitsByUserId(userId: number): Promise<Habit[]> {
    return await db.select().from(habits).where(eq(habits.userId, userId)).orderBy(desc(habits.createdAt));
  }

  async getHabitById(id: number): Promise<Habit | undefined> {
    const result = await db.select().from(habits).where(eq(habits.id, id)).limit(1);
    return result[0];
  }

  async createHabit(habit: InsertHabit): Promise<Habit> {
    const result = await db.insert(habits).values(habit).returning();
    return result[0];
  }

  async updateHabit(id: number, updates: Partial<Habit>): Promise<Habit | undefined> {
    const result = await db.update(habits).set(updates).where(eq(habits.id, id)).returning();
    return result[0];
  }

  async deleteHabit(id: number): Promise<boolean> {
    const result = await db.delete(habits).where(eq(habits.id, id));
    return result.rowCount > 0;
  }

  // Habit Logs
  async getHabitLogsByHabitId(habitId: number): Promise<HabitLog[]> {
    return await db.select().from(habitLogs).where(eq(habitLogs.habitId, habitId)).orderBy(desc(habitLogs.date));
  }

  async getHabitLogByDate(habitId: number, date: Date): Promise<HabitLog | undefined> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await db.select().from(habitLogs)
      .where(and(
        eq(habitLogs.habitId, habitId),
        sql`${habitLogs.date} >= ${startOfDay} AND ${habitLogs.date} <= ${endOfDay}`
      ))
      .limit(1);
    return result[0];
  }

  async createHabitLog(log: InsertHabitLog): Promise<HabitLog> {
    const result = await db.insert(habitLogs).values(log).returning();
    return result[0];
  }

  async updateHabitLog(id: number, updates: Partial<HabitLog>): Promise<HabitLog | undefined> {
    const result = await db.update(habitLogs).set(updates).where(eq(habitLogs.id, id)).returning();
    return result[0];
  }

  // Reading Sessions
  async getReadingSessionsByUserId(userId: number): Promise<ReadingSession[]> {
    return await db.select().from(readingSessions).where(eq(readingSessions.userId, userId)).orderBy(desc(readingSessions.createdAt));
  }

  async createReadingSession(session: InsertReadingSession): Promise<ReadingSession> {
    const result = await db.insert(readingSessions).values(session).returning();
    return result[0];
  }

  // Posts
  async getRecentPosts(limit: number = 20): Promise<(Post & { user: Pick<User, 'displayName'> })[]> {
    return await db.select({
      id: posts.id,
      userId: posts.userId,
      type: posts.type,
      message: posts.message,
      relatedId: posts.relatedId,
      createdAt: posts.createdAt,
      user: {
        displayName: users.displayName,
      },
    })
    .from(posts)
    .innerJoin(users, eq(posts.userId, users.id))
    .orderBy(desc(posts.createdAt))
    .limit(limit);
  }

  async createPost(post: InsertPost): Promise<Post> {
    const result = await db.insert(posts).values(post).returning();
    return result[0];
  }

  // Vision Board
  async getVisionBoardByUserId(userId: number): Promise<VisionBoardItem[]> {
    return await db.select().from(visionBoard).where(eq(visionBoard.userId, userId)).orderBy(visionBoard.position);
  }

  async createVisionBoardItem(item: InsertVisionBoardItem): Promise<VisionBoardItem> {
    const result = await db.insert(visionBoard).values(item).returning();
    return result[0];
  }

  async deleteVisionBoardItem(id: number): Promise<boolean> {
    const result = await db.delete(visionBoard).where(eq(visionBoard.id, id));
    return result.rowCount > 0;
  }

  // Tasks
  async getTasksByUserId(userId: number): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.userId, userId)).orderBy(desc(tasks.createdAt));
  }

  async getTaskById(id: number): Promise<Task | undefined> {
    const result = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
    return result[0];
  }

  async createTask(task: InsertTask): Promise<Task> {
    const result = await db.insert(tasks).values(task).returning();
    return result[0];
  }

  async updateTask(id: number, updates: Partial<Task>): Promise<Task | undefined> {
    const result = await db.update(tasks).set(updates).where(eq(tasks.id, id)).returning();
    return result[0];
  }

  async deleteTask(id: number): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, id));
    return result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();
