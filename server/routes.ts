import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { insertGoalSchema, insertMicroGoalSchema, insertHabitSchema, insertReadingSessionSchema, insertPostSchema, insertFollowerSchema, insertPostReactionSchema, insertPostCommentSchema } from "@shared/schema";
import { generateWorkoutProgram } from "./ai";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = z.object({
  email: z.string().email(),
  displayName: z.string().min(1),
  password: z.string().min(6),
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
  }));

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    // Set user object for compatibility with social routes
    req.user = { id: req.session.userId };
    next();
  };

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = registerSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const user = await storage.createUser(userData);
      req.session.userId = user.id;
      
      res.json({ user: { id: user.id, email: user.email, displayName: user.displayName } });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const user = await storage.validatePassword(email, password);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      res.json({ user: { id: user.id, email: user.email, displayName: user.displayName } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = await storage.getUserById(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ user: { id: user.id, email: user.email, displayName: user.displayName } });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Update user profile
  app.put("/api/auth/profile", requireAuth, async (req: any, res) => {
    try {
      const { displayName, bio, profileImageUrl } = req.body;
      const user = await storage.updateUser(req.user.id, {
        displayName,
        bio,
        profileImageUrl,
      });
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { passwordHash, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Goals routes
  app.get("/api/goals", requireAuth, async (req, res) => {
    try {
      const goals = await storage.getGoalsByUserId(req.session.userId);
      const goalsWithMicroGoals = await Promise.all(
        goals.map(async (goal) => {
          const microGoals = await storage.getMicroGoalsByGoalId(goal.id);
          return { ...goal, microGoals };
        })
      );
      res.json(goalsWithMicroGoals);
    } catch (error) {
      console.error("Get goals error:", error);
      res.status(500).json({ message: "Failed to get goals" });
    }
  });

  app.post("/api/goals", requireAuth, async (req, res) => {
    try {
      const goalData = insertGoalSchema.parse({ ...req.body, userId: req.session.userId });
      const goal = await storage.createGoal(goalData);
      
      // Create micro-goals if provided
      if (req.body.microGoals && Array.isArray(req.body.microGoals)) {
        const microGoals = await Promise.all(
          req.body.microGoals.map((title: string) =>
            storage.createMicroGoal({ goalId: goal.id, title })
          )
        );
        
        // Create social post
        await storage.createPost({
          userId: req.session.userId,
          type: "goal",
          message: `created a new goal: "${goal.title}"`,
          relatedId: goal.id,
        });

        res.json({ ...goal, microGoals });
      } else {
        res.json({ ...goal, microGoals: [] });
      }
    } catch (error) {
      console.error("Create goal error:", error);
      res.status(400).json({ message: "Failed to create goal" });
    }
  });

  app.patch("/api/micro-goals/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const microGoal = await storage.updateMicroGoal(id, updates);
      
      if (!microGoal) {
        return res.status(404).json({ message: "Micro-goal not found" });
      }

      // If completed, create earned social post with receipt details
      if (updates.completed) {
        // Get the parent goal for context
        const goal = await storage.getGoalById(microGoal.goalId);
        const completionDate = new Date().toISOString();
        
        await storage.createPost({
          userId: req.session.userId,
          type: "micro-goal",
          message: `completed micro-goal: "${microGoal.title}"`,
          relatedId: microGoal.id,
          isPrivate: false,
          metadata: JSON.stringify({
            microGoalTitle: microGoal.title,
            parentGoalTitle: goal?.title || "Unknown Goal",
            completionDate: completionDate,
            achievement: "micro_goal_completed"
          })
        });
      }

      res.json(microGoal);
    } catch (error) {
      console.error("Update micro-goal error:", error);
      res.status(400).json({ message: "Failed to update micro-goal" });
    }
  });

  // Goal completion route
  app.patch("/api/goals/:id/complete", requireAuth, async (req, res) => {
    try {
      const goalId = parseInt(req.params.id);
      const goal = await storage.updateGoal(goalId, { completed: true });
      
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }

      // Create earned social post for goal completion with receipt details
      const completionDate = new Date().toISOString();
      const microGoals = await storage.getMicroGoalsByGoalId(goalId);
      const completedMicroGoals = microGoals.filter(mg => mg.completed).length;
      
      await storage.createPost({
        userId: req.session.userId,
        type: "goal",
        message: `achieved goal: "${goal.title}"`,
        relatedId: goalId,
        isPrivate: false,
        metadata: JSON.stringify({
          goalTitle: goal.title,
          goalDescription: goal.description,
          completionDate: completionDate,
          microGoalsCompleted: completedMicroGoals,
          totalMicroGoals: microGoals.length,
          dueDate: goal.dueDate,
          achievement: "goal_completed"
        })
      });

      res.json(goal);
    } catch (error) {
      console.error("Complete goal error:", error);
      res.status(400).json({ message: "Failed to complete goal" });
    }
  });

  // Habits routes
  app.get("/api/habits", requireAuth, async (req, res) => {
    try {
      const habits = await storage.getHabitsByUserId(req.session.userId);
      const habitsWithLogs = await Promise.all(
        habits.map(async (habit) => {
          const logs = await storage.getHabitLogsByHabitId(habit.id);
          const todayLog = await storage.getHabitLogByDate(habit.id, new Date());
          return { ...habit, logs, completedToday: !!todayLog?.completed };
        })
      );
      res.json(habitsWithLogs);
    } catch (error) {
      console.error("Get habits error:", error);
      res.status(500).json({ message: "Failed to get habits" });
    }
  });

  app.post("/api/habits", requireAuth, async (req, res) => {
    try {
      const habitData = insertHabitSchema.parse({ ...req.body, userId: req.session.userId });
      const habit = await storage.createHabit(habitData);
      res.json({ ...habit, logs: [], completedToday: false });
    } catch (error) {
      console.error("Create habit error:", error);
      res.status(400).json({ message: "Failed to create habit" });
    }
  });

  app.post("/api/habits/:id/toggle", requireAuth, async (req, res) => {
    try {
      const habitId = parseInt(req.params.id);
      const today = new Date();
      
      const existingLog = await storage.getHabitLogByDate(habitId, today);
      
      if (existingLog) {
        const updatedLog = await storage.updateHabitLog(existingLog.id, { 
          completed: !existingLog.completed 
        });
        
        if (updatedLog?.completed) {
          // Update streak and create social post
          const habit = await storage.getHabitById(habitId);
          if (habit) {
            await storage.updateHabit(habitId, { streak: habit.streak + 1 });
            
            if (habit.streak + 1 >= 7) {
              await storage.createPost({
                userId: req.session.userId,
                type: "habit",
                message: `achieved ${habit.streak + 1}-day streak for "${habit.title}"`,
                relatedId: habitId,
              });
            }
          }
        }
        
        res.json(updatedLog);
      } else {
        const newLog = await storage.createHabitLog({
          habitId,
          date: today,
          completed: true,
        });
        
        // Update streak and create social post
        const habit = await storage.getHabitById(habitId);
        if (habit) {
          await storage.updateHabit(habitId, { streak: habit.streak + 1 });
          
          if (habit.streak + 1 >= 7) {
            await storage.createPost({
              userId: req.session.userId,
              type: "habit",
              message: `achieved ${habit.streak + 1}-day streak for "${habit.title}"`,
              relatedId: habitId,
            });
          }
        }
        
        res.json(newLog);
      }
    } catch (error) {
      console.error("Toggle habit error:", error);
      res.status(400).json({ message: "Failed to toggle habit" });
    }
  });

  app.get("/api/habits/:id/logs", requireAuth, async (req, res) => {
    try {
      const habitId = parseInt(req.params.id);
      const logs = await storage.getHabitLogsByHabitId(habitId);
      res.json(logs);
    } catch (error) {
      console.error("Get habit logs error:", error);
      res.status(500).json({ message: "Failed to get habit logs" });
    }
  });

  // Reading routes
  app.get("/api/reading-sessions", requireAuth, async (req, res) => {
    try {
      const sessions = await storage.getReadingSessionsByUserId(req.session.userId);
      res.json(sessions);
    } catch (error) {
      console.error("Get reading sessions error:", error);
      res.status(500).json({ message: "Failed to get reading sessions" });
    }
  });

  app.post("/api/reading-sessions", requireAuth, async (req, res) => {
    try {
      const sessionData = insertReadingSessionSchema.parse({ 
        ...req.body, 
        userId: req.session.userId 
      });
      const session = await storage.createReadingSession(sessionData);
      
      // Auto-create earned social post for completed reading session with receipt details
      if (session.reflection && session.endTime) {
        const readingDuration = session.startTime && session.endTime 
          ? Math.round((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / (1000 * 60))
          : null;
        
        const postMessage = `completed ${readingDuration}min reading session: "${session.bookTitle}"`;
        
        await storage.createPost({
          userId: req.session.userId,
          type: "reflection",
          message: postMessage,
          relatedId: session.id,
          isPrivate: false,
          metadata: JSON.stringify({
            bookTitle: session.bookTitle,
            readingDuration: readingDuration,
            reflection: session.reflection,
            sessionDate: session.endTime,
            achievement: "reading_session_completed"
          })
        });
      }
      
      res.json(session);
    } catch (error) {
      console.error("Create reading session error:", error);
      res.status(400).json({ message: "Failed to create reading session" });
    }
  });

  // Vision Board routes
  app.get("/api/vision-board", requireAuth, async (req, res) => {
    try {
      const visionItems = await storage.getVisionBoardByUserId(req.session.userId);
      res.json(visionItems);
    } catch (error) {
      console.error("Get vision board error:", error);
      res.status(500).json({ message: "Failed to get vision board items" });
    }
  });

  app.post("/api/vision-board", requireAuth, async (req, res) => {
    try {
      const { imageUrl, caption } = req.body;
      const visionItem = await storage.createVisionBoardItem({
        userId: req.session.userId,
        imageUrl,
        caption,
        position: 0, // You can implement position management later
      });
      res.json(visionItem);
    } catch (error) {
      console.error("Create vision board item error:", error);
      res.status(400).json({ message: "Failed to create vision board item" });
    }
  });

  app.delete("/api/vision-board/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteVisionBoardItem(id);
      if (success) {
        res.json({ message: "Vision board item deleted" });
      } else {
        res.status(404).json({ message: "Vision board item not found" });
      }
    } catch (error) {
      console.error("Delete vision board item error:", error);
      res.status(500).json({ message: "Failed to delete vision board item" });
    }
  });

  // Community routes
  app.get("/api/posts", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const posts = await storage.getRecentPosts(limit);
      res.json(posts);
    } catch (error) {
      console.error("Get posts error:", error);
      res.status(500).json({ message: "Failed to get posts" });
    }
  });

  // Social features routes
  app.get("/api/timeline", requireAuth, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const posts = await storage.getTimelinePosts(req.user.id, limit);
      res.json(posts);
    } catch (error) {
      console.error("Get timeline error:", error);
      res.status(500).json({ message: "Failed to get timeline" });
    }
  });

  app.get("/api/following", requireAuth, async (req: any, res) => {
    try {
      const following = await storage.getFollowing(req.user.id);
      res.json(following);
    } catch (error) {
      console.error("Get following error:", error);
      res.status(500).json({ message: "Failed to get following" });
    }
  });

  app.get("/api/followers", requireAuth, async (req: any, res) => {
    try {
      const followers = await storage.getFollowers(req.user.id);
      res.json(followers);
    } catch (error) {
      console.error("Get followers error:", error);
      res.status(500).json({ message: "Failed to get followers" });
    }
  });

  app.post("/api/follow", requireAuth, async (req: any, res) => {
    try {
      const { followingId } = insertFollowerSchema.parse({
        followerId: req.user.id,
        ...req.body
      });
      const follow = await storage.followUser(req.user.id, followingId);
      res.json(follow);
    } catch (error) {
      console.error("Follow user error:", error);
      res.status(500).json({ message: "Failed to follow user" });
    }
  });

  app.delete("/api/follow/:followingId", requireAuth, async (req: any, res) => {
    try {
      const followingId = parseInt(req.params.followingId);
      const success = await storage.unfollowUser(req.user.id, followingId);
      res.json({ success });
    } catch (error) {
      console.error("Unfollow user error:", error);
      res.status(500).json({ message: "Failed to unfollow user" });
    }
  });

  // Post reactions
  app.post("/api/posts/:postId/reactions", requireAuth, async (req: any, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const reaction = insertPostReactionSchema.parse({
        postId,
        userId: req.user.id,
        ...req.body
      });
      const result = await storage.addPostReaction(reaction);
      res.json(result);
    } catch (error) {
      console.error("Add reaction error:", error);
      res.status(500).json({ message: "Failed to add reaction" });
    }
  });

  app.delete("/api/posts/:postId/reactions", requireAuth, async (req: any, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const success = await storage.removePostReaction(postId, req.user.id);
      res.json({ success });
    } catch (error) {
      console.error("Remove reaction error:", error);
      res.status(500).json({ message: "Failed to remove reaction" });
    }
  });

  app.get("/api/posts/:postId/reactions", async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const reactions = await storage.getPostReactions(postId);
      res.json(reactions);
    } catch (error) {
      console.error("Get reactions error:", error);
      res.status(500).json({ message: "Failed to get reactions" });
    }
  });

  // Post comments
  app.post("/api/posts/:postId/comments", requireAuth, async (req: any, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const comment = insertPostCommentSchema.parse({
        postId,
        userId: req.user.id,
        ...req.body
      });
      const result = await storage.addPostComment(comment);
      res.json(result);
    } catch (error) {
      console.error("Add comment error:", error);
      res.status(500).json({ message: "Failed to add comment" });
    }
  });

  app.get("/api/posts/:postId/comments", async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const comments = await storage.getPostComments(postId);
      res.json(comments);
    } catch (error) {
      console.error("Get comments error:", error);
      res.status(500).json({ message: "Failed to get comments" });
    }
  });

  // Workout routes
  app.get("/api/workouts", requireAuth, async (req, res) => {
    try {
      const workouts = await storage.getWorkoutsByUserId(req.session.userId);
      res.json(workouts);
    } catch (error) {
      console.error("Get workouts error:", error);
      res.status(500).json({ message: "Failed to get workouts" });
    }
  });

  app.post("/api/workouts", requireAuth, async (req, res) => {
    try {
      const { exercises, ...workoutData } = req.body;
      
      // Create the main workout record
      const workout = await storage.createWorkout({
        ...workoutData,
        userId: req.session.userId
      });
      
      // Create each exercise record
      if (exercises && exercises.length > 0) {
        for (let i = 0; i < exercises.length; i++) {
          const exerciseData = exercises[i];
          
          // Create or get the exercise
          let exercise = await storage.getExerciseByName(exerciseData.name);
          if (!exercise) {
            exercise = await storage.createExercise({
              name: exerciseData.name,
              category: exerciseData.category || "strength"
            });
          }
          
          // Create the workout exercise record
          await storage.createWorkoutExercise({
            workoutId: workout.id,
            exerciseId: exercise.id,
            sets: exerciseData.sets || 1,
            reps: exerciseData.reps || null,
            weight: exerciseData.weight || null,
            duration: exerciseData.duration || null,
            distance: exerciseData.distance || null,
            restTime: exerciseData.restTime || null,
            notes: exerciseData.notes || null,
            orderIndex: i
          });
        }
      }
      
      res.json(workout);
    } catch (error) {
      console.error("Create workout error:", error);
      res.status(500).json({ message: "Failed to create workout" });
    }
  });

  app.delete("/api/workouts/:id", requireAuth, async (req, res) => {
    try {
      const workoutId = parseInt(req.params.id);
      const workout = await storage.getWorkoutById(workoutId);
      
      if (!workout) {
        return res.status(404).json({ message: "Workout not found" });
      }
      
      // Check if the workout belongs to the current user
      if (workout.userId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to delete this workout" });
      }
      
      await storage.deleteWorkout(workoutId);
      res.json({ message: "Workout deleted successfully" });
    } catch (error) {
      console.error("Delete workout error:", error);
      res.status(500).json({ message: "Failed to delete workout" });
    }
  });

  app.get("/api/exercises", async (req, res) => {
    try {
      const exercises = await storage.getExercises();
      res.json(exercises);
    } catch (error) {
      console.error("Get exercises error:", error);
      res.status(500).json({ message: "Failed to get exercises" });
    }
  });

  app.post("/api/exercises", async (req, res) => {
    try {
      const exercise = await storage.createExercise(req.body);
      res.json(exercise);
    } catch (error) {
      console.error("Create exercise error:", error);
      res.status(500).json({ message: "Failed to create exercise" });
    }
  });

  app.patch("/api/exercises/:id", async (req, res) => {
    try {
      const exerciseId = parseInt(req.params.id);
      const updates = req.body;
      const updatedExercise = await storage.updateExercise(exerciseId, updates);
      
      if (!updatedExercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }
      
      res.json(updatedExercise);
    } catch (error) {
      console.error("Update exercise error:", error);
      res.status(500).json({ message: "Failed to update exercise" });
    }
  });

  // Generate workout program using AI
  app.post("/api/workout-programs/generate", requireAuth, async (req, res) => {
    let timeoutHandle: NodeJS.Timeout | null = null;
    let hasResponded = false;
    
    try {
      const fitnessProfile = req.body;
      console.log("Generating workout program for profile:", fitnessProfile);
      
      // Set a longer timeout for this endpoint (90 seconds)
      timeoutHandle = setTimeout(() => {
        if (!hasResponded) {
          hasResponded = true;
          console.error("Workout generation timed out");
          res.status(504).json({ message: "Generation timed out. Please try again." });
        }
      }, 90000); // Increased to 90 seconds
      
      // Generate program using AI
      const program = await generateWorkoutProgram(fitnessProfile);
      
      // Clear timeout and send response if not already sent
      if (timeoutHandle) clearTimeout(timeoutHandle);
      
      if (!hasResponded) {
        hasResponded = true;
        console.log("Workout program generated successfully");
        res.json(program);
      }
    } catch (error: any) {
      // Clear timeout if it exists
      if (timeoutHandle) clearTimeout(timeoutHandle);
      
      if (!hasResponded) {
        hasResponded = true;
        console.error("Generate workout program error:", error);
        
        // Check for specific OpenAI errors
        if (error.code === 'insufficient_quota') {
          res.status(503).json({ 
            message: "OpenAI API quota exceeded. Please check your API key and billing." 
          });
        } else if (error.code === 'rate_limit_exceeded') {
          res.status(429).json({ 
            message: "Rate limit exceeded. Please wait a moment and try again." 
          });
        } else {
          res.status(500).json({ 
            message: error.message || "Failed to generate workout program. Please try again." 
          });
        }
      }
    }
  });

  // Body weight logs routes
  app.get("/api/body-weight-logs", requireAuth, async (req, res) => {
    try {
      const logs = await storage.getBodyWeightLogsByUserId(req.session.userId);
      res.json(logs);
    } catch (error) {
      console.error("Get body weight logs error:", error);
      res.status(500).json({ message: "Failed to get body weight logs" });
    }
  });

  app.post("/api/body-weight-logs", requireAuth, async (req, res) => {
    try {
      const logData = {
        ...req.body,
        userId: req.session.userId
      };
      const log = await storage.createBodyWeightLog(logData);
      res.json(log);
    } catch (error) {
      console.error("Create body weight log error:", error);
      res.status(500).json({ message: "Failed to create body weight log" });
    }
  });

  // Training template routes
  app.get("/api/training-templates", requireAuth, async (req, res) => {
    try {
      const templates = await storage.getTrainingTemplatesByUserId(req.session.userId);
      res.json(templates);
    } catch (error) {
      console.error("Get training templates error:", error);
      res.status(500).json({ message: "Failed to get training templates" });
    }
  });

  app.get("/api/training-templates/active", requireAuth, async (req, res) => {
    try {
      const template = await storage.getActiveTrainingTemplate(req.session.userId);
      res.json(template || null);
    } catch (error) {
      console.error("Get active training template error:", error);
      res.status(500).json({ message: "Failed to get active training template" });
    }
  });

  app.post("/api/training-templates", requireAuth, async (req, res) => {
    try {
      const templateData = {
        ...req.body,
        userId: req.session.userId
      };
      const template = await storage.createTrainingTemplate(templateData);
      res.json(template);
    } catch (error) {
      console.error("Create training template error:", error);
      res.status(500).json({ message: "Failed to create training template" });
    }
  });

  app.put("/api/training-templates/:id/activate", requireAuth, async (req, res) => {
    try {
      const templateId = parseInt(req.params.id);
      const template = await storage.setActiveTrainingTemplate(req.session.userId, templateId);
      if (!template) {
        return res.status(404).json({ message: "Training template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Activate training template error:", error);
      res.status(500).json({ message: "Failed to activate training template" });
    }
  });

  // Exercise history routes
  app.get("/api/exercise-history", requireAuth, async (req, res) => {
    try {
      const history = await storage.getExerciseHistoryByUserId(req.session.userId);
      res.json(history);
    } catch (error) {
      console.error("Get exercise history error:", error);
      res.status(500).json({ message: "Failed to get exercise history" });
    }
  });

  app.get("/api/exercise-history/search", requireAuth, async (req, res) => {
    try {
      const searchTerm = req.query.q as string;
      if (!searchTerm) {
        return res.json([]);
      }
      const results = await storage.searchExerciseHistory(req.session.userId, searchTerm);
      res.json(results);
    } catch (error) {
      console.error("Search exercise history error:", error);
      res.status(500).json({ message: "Failed to search exercise history" });
    }
  });

  app.post("/api/exercise-history", requireAuth, async (req, res) => {
    try {
      const exerciseData = {
        ...req.body,
        userId: req.session.userId
      };
      const exercise = await storage.addExerciseToHistory(exerciseData);
      res.json(exercise);
    } catch (error) {
      console.error("Add exercise to history error:", error);
      res.status(500).json({ message: "Failed to add exercise to history" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
