import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, desc, and, sql } from "drizzle-orm";
import bcrypt from "bcrypt";
import { 
  users, goals, microGoals, habits, habitLogs, readingSessions, posts, visionBoard, tasks, rules,
  followers, postReactions, postComments, workouts, exercises, workoutExercises, bodyWeightLogs,
  type User, type InsertUser, type Goal, type InsertGoal, type MicroGoal, type InsertMicroGoal,
  type Habit, type InsertHabit, type HabitLog, type InsertHabitLog,
  type ReadingSession, type InsertReadingSession, type Post, type InsertPost,
  type VisionBoardItem, type InsertVisionBoardItem, type Task, type InsertTask, type Rule, type InsertRule,
  type Follower, type InsertFollower, type PostReaction, type InsertPostReaction,
  type PostComment, type InsertPostComment, type Workout, type InsertWorkout,
  type Exercise, type InsertExercise, type WorkoutExercise, type InsertWorkoutExercise,
  type BodyWeightLog, type InsertBodyWeightLog
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
  updateUser(id: number, updates: Partial<Omit<User, 'id' | 'createdAt' | 'passwordHash'>>): Promise<User | undefined>;
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

  // Rules
  getRulesByUserId(userId: number): Promise<Rule[]>;
  getRuleById(id: number): Promise<Rule | undefined>;
  createRule(rule: InsertRule): Promise<Rule>;
  updateRule(id: number, updates: Partial<Rule>): Promise<Rule | undefined>;
  deleteRule(id: number): Promise<boolean>;
  toggleRuleCompletion(ruleId: number, userId: number): Promise<{ success: boolean; reason?: string; rule?: Rule }>;
  markRuleViolation(ruleId: number, userId: number): Promise<{ success: boolean; reason?: string; rule?: Rule }>;

  // Workouts
  getWorkoutsByUserId(userId: number): Promise<Workout[]>;
  getWorkoutById(id: number): Promise<Workout | undefined>;
  createWorkout(workout: InsertWorkout): Promise<Workout>;
  updateWorkout(id: number, updates: Partial<Workout>): Promise<Workout | undefined>;
  deleteWorkout(id: number): Promise<boolean>;

  // Exercises
  getExercises(): Promise<Exercise[]>;
  getExerciseById(id: number): Promise<Exercise | undefined>;
  getExerciseByName(name: string): Promise<Exercise | undefined>;
  createExercise(exercise: InsertExercise): Promise<Exercise>;
  updateExercise(id: number, updates: Partial<Exercise>): Promise<Exercise | undefined>;

  // Workout Exercises
  getWorkoutExercisesByWorkoutId(workoutId: number): Promise<(WorkoutExercise & { exercise: Exercise })[]>;
  createWorkoutExercise(workoutExercise: InsertWorkoutExercise): Promise<WorkoutExercise>;
  updateWorkoutExercise(id: number, updates: Partial<WorkoutExercise>): Promise<WorkoutExercise | undefined>;
  deleteWorkoutExercise(id: number): Promise<boolean>;

  // Body Weight Logs
  getBodyWeightLogsByUserId(userId: number): Promise<BodyWeightLog[]>;
  createBodyWeightLog(log: InsertBodyWeightLog): Promise<BodyWeightLog>;
  getLatestBodyWeightLog(userId: number): Promise<BodyWeightLog | undefined>;
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

  async updateUser(id: number, updates: Partial<Omit<User, 'id' | 'createdAt' | 'passwordHash'>>): Promise<User | undefined> {
    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
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
      isPrivate: posts.isPrivate,
      metadata: posts.metadata,
      createdAt: posts.createdAt,
      user: {
        displayName: users.displayName,
      },
    })
    .from(posts)
    .innerJoin(users, eq(posts.userId, users.id))
    .where(eq(posts.isPrivate, false)) // Only show public posts
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

  // Social Features
  async followUser(followerId: number, followingId: number): Promise<Follower> {
    const result = await db.insert(followers).values({
      followerId,
      followingId
    }).returning();
    return result[0];
  }

  async unfollowUser(followerId: number, followingId: number): Promise<boolean> {
    const result = await db.delete(followers)
      .where(and(eq(followers.followerId, followerId), eq(followers.followingId, followingId)));
    return result.rowCount > 0;
  }

  async getFollowers(userId: number): Promise<(Follower & { follower: Pick<User, 'id' | 'displayName'> })[]> {
    return await db.select({
      id: followers.id,
      followerId: followers.followerId,
      followingId: followers.followingId,
      createdAt: followers.createdAt,
      follower: {
        id: users.id,
        displayName: users.displayName,
      },
    })
    .from(followers)
    .innerJoin(users, eq(followers.followerId, users.id))
    .where(eq(followers.followingId, userId))
    .orderBy(desc(followers.createdAt));
  }

  async getFollowing(userId: number): Promise<(Follower & { following: Pick<User, 'id' | 'displayName'> })[]> {
    return await db.select({
      id: followers.id,
      followerId: followers.followerId,
      followingId: followers.followingId,
      createdAt: followers.createdAt,
      following: {
        id: users.id,
        displayName: users.displayName,
      },
    })
    .from(followers)
    .innerJoin(users, eq(followers.followingId, users.id))
    .where(eq(followers.followerId, userId))
    .orderBy(desc(followers.createdAt));
  }

  async getTimelinePosts(userId: number, limit: number = 20): Promise<(Post & { user: Pick<User, 'displayName'> })[]> {
    // Get posts from users that the current user follows
    const followingSubquery = db.select({ followingId: followers.followingId })
      .from(followers)
      .where(eq(followers.followerId, userId));

    return await db.select({
      id: posts.id,
      userId: posts.userId,
      type: posts.type,
      message: posts.message,
      relatedId: posts.relatedId,
      isPrivate: posts.isPrivate,
      metadata: posts.metadata,
      createdAt: posts.createdAt,
      user: {
        displayName: users.displayName,
      },
    })
    .from(posts)
    .innerJoin(users, eq(posts.userId, users.id))
    .where(and(
      eq(posts.isPrivate, false),
      sql`${posts.userId} IN ${followingSubquery}`
    ))
    .orderBy(desc(posts.createdAt))
    .limit(limit);
  }

  // Post Reactions
  async addPostReaction(reaction: InsertPostReaction): Promise<PostReaction> {
    const result = await db.insert(postReactions).values(reaction).returning();
    return result[0];
  }

  async removePostReaction(postId: number, userId: number): Promise<boolean> {
    const result = await db.delete(postReactions)
      .where(and(eq(postReactions.postId, postId), eq(postReactions.userId, userId)));
    return result.rowCount > 0;
  }

  async getPostReactions(postId: number): Promise<(PostReaction & { user: Pick<User, 'displayName'> })[]> {
    return await db.select({
      id: postReactions.id,
      postId: postReactions.postId,
      userId: postReactions.userId,
      type: postReactions.type,
      createdAt: postReactions.createdAt,
      user: {
        displayName: users.displayName,
      },
    })
    .from(postReactions)
    .innerJoin(users, eq(postReactions.userId, users.id))
    .where(eq(postReactions.postId, postId))
    .orderBy(desc(postReactions.createdAt));
  }

  // Post Comments
  async addPostComment(comment: InsertPostComment): Promise<PostComment> {
    const result = await db.insert(postComments).values(comment).returning();
    return result[0];
  }

  async getPostComments(postId: number): Promise<(PostComment & { user: Pick<User, 'displayName'> })[]> {
    return await db.select({
      id: postComments.id,
      postId: postComments.postId,
      userId: postComments.userId,
      message: postComments.message,
      createdAt: postComments.createdAt,
      user: {
        displayName: users.displayName,
      },
    })
    .from(postComments)
    .innerJoin(users, eq(postComments.userId, users.id))
    .where(eq(postComments.postId, postId))
    .orderBy(postComments.createdAt);
  }

  // Workouts
  async getWorkoutsByUserId(userId: number): Promise<Workout[]> {
    const workoutResults = await db.select().from(workouts).where(eq(workouts.userId, userId)).orderBy(desc(workouts.date));
    
    // Fetch workout exercises for each workout
    const workoutsWithExercises = await Promise.all(
      workoutResults.map(async (workout) => {
        const workoutExerciseList = await db
          .select({
            id: workoutExercises.id,
            workoutId: workoutExercises.workoutId,
            exerciseId: workoutExercises.exerciseId,
            weight: workoutExercises.weight,
            reps: workoutExercises.reps,
            sets: workoutExercises.sets,
            duration: workoutExercises.duration,
            distance: workoutExercises.distance,
            restTime: workoutExercises.restTime,
            orderIndex: workoutExercises.orderIndex,
            notes: workoutExercises.notes,
            exercise: exercises
          })
          .from(workoutExercises)
          .leftJoin(exercises, eq(workoutExercises.exerciseId, exercises.id))
          .where(eq(workoutExercises.workoutId, workout.id));
        
        return {
          ...workout,
          workoutExercises: workoutExerciseList
        };
      })
    );
    
    return workoutsWithExercises;
  }

  async getWorkoutById(id: number): Promise<Workout | undefined> {
    const result = await db.select().from(workouts).where(eq(workouts.id, id)).limit(1);
    return result[0];
  }

  async createWorkout(workout: InsertWorkout): Promise<Workout> {
    const result = await db.insert(workouts).values(workout).returning();
    return result[0];
  }

  async updateWorkout(id: number, updates: Partial<Workout>): Promise<Workout | undefined> {
    const result = await db.update(workouts).set(updates).where(eq(workouts.id, id)).returning();
    return result[0];
  }

  async deleteWorkout(id: number): Promise<boolean> {
    try {
      // First delete all workout exercises associated with this workout
      await db.delete(workoutExercises).where(eq(workoutExercises.workoutId, id));
      
      // Then delete the workout itself
      const result = await db.delete(workouts).where(eq(workouts.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting workout:', error);
      return false;
    }
  }

  // Exercises
  async getExercises(): Promise<Exercise[]> {
    return await db.select().from(exercises).orderBy(exercises.name);
  }

  async getExerciseById(id: number): Promise<Exercise | undefined> {
    const result = await db.select().from(exercises).where(eq(exercises.id, id)).limit(1);
    return result[0];
  }

  async getExerciseByName(name: string): Promise<Exercise | undefined> {
    const result = await db.select().from(exercises).where(eq(exercises.name, name)).limit(1);
    return result[0];
  }

  async createExercise(exercise: InsertExercise): Promise<Exercise> {
    const result = await db.insert(exercises).values(exercise).returning();
    return result[0];
  }

  async updateExercise(id: number, updates: Partial<Exercise>): Promise<Exercise | undefined> {
    const result = await db.update(exercises).set(updates).where(eq(exercises.id, id)).returning();
    return result[0];
  }

  // Workout Exercises
  async getWorkoutExercisesByWorkoutId(workoutId: number): Promise<(WorkoutExercise & { exercise: Exercise })[]> {
    return await db.select({
      id: workoutExercises.id,
      workoutId: workoutExercises.workoutId,
      exerciseId: workoutExercises.exerciseId,
      sets: workoutExercises.sets,
      reps: workoutExercises.reps,
      weight: workoutExercises.weight,
      duration: workoutExercises.duration,
      distance: workoutExercises.distance,
      restTime: workoutExercises.restTime,
      notes: workoutExercises.notes,
      orderIndex: workoutExercises.orderIndex,
      createdAt: workoutExercises.createdAt,
      exercise: exercises,
    })
    .from(workoutExercises)
    .innerJoin(exercises, eq(workoutExercises.exerciseId, exercises.id))
    .where(eq(workoutExercises.workoutId, workoutId))
    .orderBy(workoutExercises.orderIndex);
  }

  async createWorkoutExercise(workoutExercise: InsertWorkoutExercise): Promise<WorkoutExercise> {
    const result = await db.insert(workoutExercises).values(workoutExercise).returning();
    return result[0];
  }

  async updateWorkoutExercise(id: number, updates: Partial<WorkoutExercise>): Promise<WorkoutExercise | undefined> {
    const result = await db.update(workoutExercises).set(updates).where(eq(workoutExercises.id, id)).returning();
    return result[0];
  }

  async deleteWorkoutExercise(id: number): Promise<boolean> {
    const result = await db.delete(workoutExercises).where(eq(workoutExercises.id, id));
    return result.rowCount > 0;
  }

  // Body Weight Logs
  async getBodyWeightLogsByUserId(userId: number): Promise<BodyWeightLog[]> {
    return await db.select().from(bodyWeightLogs).where(eq(bodyWeightLogs.userId, userId)).orderBy(desc(bodyWeightLogs.date));
  }

  async createBodyWeightLog(log: InsertBodyWeightLog): Promise<BodyWeightLog> {
    const result = await db.insert(bodyWeightLogs).values(log).returning();
    return result[0];
  }

  async getLatestBodyWeightLog(userId: number): Promise<BodyWeightLog | undefined> {
    const result = await db.select().from(bodyWeightLogs)
      .where(eq(bodyWeightLogs.userId, userId))
      .orderBy(desc(bodyWeightLogs.date))
      .limit(1);
    return result[0];
  }

  // Rules implementation
  async getRulesByUserId(userId: number): Promise<Rule[]> {
    return await db.select().from(rules).where(eq(rules.userId, userId)).orderBy(rules.createdAt);
  }

  async getRuleById(id: number): Promise<Rule | undefined> {
    const result = await db.select().from(rules).where(eq(rules.id, id)).limit(1);
    return result[0];
  }

  async createRule(rule: InsertRule): Promise<Rule> {
    const result = await db.insert(rules).values(rule).returning();
    return result[0];
  }

  async updateRule(id: number, updates: Partial<Rule>): Promise<Rule | undefined> {
    const result = await db.update(rules).set(updates).where(eq(rules.id, id)).returning();
    return result[0];
  }

  async deleteRule(id: number): Promise<boolean> {
    const result = await db.delete(rules).where(eq(rules.id, id));
    return result.rowCount > 0;
  }

  async toggleRuleCompletion(ruleId: number, userId: number): Promise<{ success: boolean; reason?: string; rule?: Rule }> {
    const rule = await this.getRuleById(ruleId);
    if (!rule || rule.userId !== userId) {
      return { success: false, reason: "Rule not found or access denied" };
    }

    const now = new Date();
    const updatedRule = await db.update(rules)
      .set({ lastCompletionTime: now })
      .where(eq(rules.id, ruleId))
      .returning();

    return { success: true, rule: updatedRule[0] };
  }

  async markRuleViolation(ruleId: number, userId: number): Promise<{ success: boolean; reason?: string; rule?: Rule }> {
    const rule = await this.getRuleById(ruleId);
    if (!rule || rule.userId !== userId) {
      return { success: false, reason: "Rule not found or access denied" };
    }

    const now = new Date();
    const lastViolation = rule.lastViolationTime;
    
    // Check 24-hour cooldown
    if (lastViolation) {
      const timeDiff = now.getTime() - lastViolation.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      if (hoursDiff < 24) {
        const hoursLeft = Math.ceil(24 - hoursDiff);
        return { 
          success: false, 
          reason: `Rule violation cooldown active. Try again in ${hoursLeft} hour${hoursLeft > 1 ? 's' : ''}.` 
        };
      }
    }

    const updatedRule = await db.update(rules)
      .set({ lastViolationTime: now })
      .where(eq(rules.id, ruleId))
      .returning();

    return { success: true, rule: updatedRule[0] };
  }
}

export const storage = new DatabaseStorage();
