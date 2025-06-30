import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { insertGoalSchema, insertMicroGoalSchema, insertHabitSchema, insertReadingSessionSchema, insertPostSchema } from "@shared/schema";
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

      // If completed, create social post
      if (updates.completed) {
        await storage.createPost({
          userId: req.session.userId,
          type: "micro-goal",
          message: `completed micro-goal: "${microGoal.title}"`,
          relatedId: microGoal.id,
        });
      }

      res.json(microGoal);
    } catch (error) {
      console.error("Update micro-goal error:", error);
      res.status(400).json({ message: "Failed to update micro-goal" });
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
      
      // Create social post if reflection exists
      if (session.reflection) {
        await storage.createPost({
          userId: req.session.userId,
          type: "reflection",
          message: `shared a reading reflection: "${session.reflection.substring(0, 50)}${session.reflection.length > 50 ? '...' : ''}"`,
          relatedId: session.id,
        });
      }
      
      res.json(session);
    } catch (error) {
      console.error("Create reading session error:", error);
      res.status(400).json({ message: "Failed to create reading session" });
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

  const httpServer = createServer(app);
  return httpServer;
}
