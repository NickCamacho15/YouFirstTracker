import { OpenAI } from "openai";

let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

export async function generatePlan(goal: string) {
  const systemPrompt = `
You are a high-performance strategist and personal excellence coach inside the YOU. FIRST platform.

Your job is to take a user’s raw goal input and reverse-engineer it into a clear, inspiring, and actionable personal plan.
1. Rewrite the user’s goal as an aspirational SMART goal.
2. Suggest 3–5 habits (Trigger → Action → Reward, with explanation and benefits).
3. Suggest morning and evening routine steps.
4. Suggest 2–4 weekly tasks to move the goal forward.

Return it in this exact JSON format:
{
  "smart_goal": "string",
  "habits": [
    {
      "name": "string",
      "trigger": "string",
      "action": "string",
      "reward": "string",
      "explanation": "string",
      "benefits": ["string", "string"]
    }
  ],
  "routine": {
    "morning": ["string", "string", "string"],
    "evening": ["string", "string", "string"]
  },
  "weekly_tasks": ["string", "string", "string"]
}
  `;

  const chat = await getOpenAIClient().chat.completions.create({
    model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    temperature: 0.7,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `My goal: ${goal}` }
    ]
  });

  const result = chat.choices[0].message.content!;
  return JSON.parse(result); // turns the text into real usable JSON
}

export async function generateWorkoutProgram(fitnessProfile: any) {
  const systemPrompt = `
You are an elite strength coach. Create a 4-week program with these phases:
Week 1-2: LOAD (4-5 sets, 70-85% 1RM)
Week 3: PEAK (3-4 sets, 85-95% 1RM)
Week 4: DELOAD (2-3 sets, 60-70% 1RM)

Each workout has 4 blocks:
1. WARM-UP: 2-3 exercises
2. MAIN A: Primary compound
3. MAIN B: Secondary compound
4. FINISHER: 2-3 accessories

Return ONLY valid JSON in this format:

{
  "program": {
    "name": "string",
    "description": "4-Week Periodized Training Program",
    "duration": 4,
    "weeklySchedule": ["day1_name", "day2_name", "day3_name", "day4_name", "day5_name", "rest", "rest"]
  },
  "weeks": [
    {
      "weekNumber": 1,
      "phase": "Load",
      "phaseDescription": "Week 1 - Load Phase: Building volume and work capacity",
      "days": [
        {
          "dayNumber": 1,
          "name": "string",
          "description": "string",
          "blocks": [
            {
              "blockType": "warmup",
              "name": "Dynamic Warm-Up",
              "exercises": [
                {
                  "exerciseName": "string",
                  "sets": 2,
                  "reps": "10-12",
                  "weight": "bodyweight",
                  "restPeriod": "30s",
                  "notes": "Focus on movement quality",
                  "actualWeight": "",
                  "actualReps": "",
                  "completed": false
                }
              ]
            },
            {
              "blockType": "main_a",
              "name": "Main Block A - Primary Movement",
              "exercises": [
                {
                  "exerciseName": "string",
                  "sets": 4,
                  "reps": "6-8",
                  "weight": "75-80% 1RM",
                  "restPeriod": "3-4min",
                  "notes": "Main compound movement",
                  "actualWeight": "",
                  "actualReps": "",
                  "completed": false
                }
              ]
            },
            {
              "blockType": "main_b",
              "name": "Main Block B - Secondary Movement",
              "exercises": [
                {
                  "exerciseName": "string",
                  "sets": 3,
                  "reps": "8-10",
                  "weight": "70-75% 1RM",
                  "restPeriod": "2-3min",
                  "notes": "Supporting compound movement",
                  "actualWeight": "",
                  "actualReps": "",
                  "completed": false
                }
              ]
            },
            {
              "blockType": "finisher",
              "name": "Block C - Finisher/Volume Work",
              "exercises": [
                {
                  "exerciseName": "string",
                  "sets": 3,
                  "reps": "12-15",
                  "weight": "60-65% 1RM",
                  "restPeriod": "60-90s",
                  "notes": "Higher volume, metabolic focus",
                  "actualWeight": "",
                  "actualReps": "",
                  "completed": false
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}

IMPORTANT: 
- Generate ALL 4 weeks with ${fitnessProfile.workoutDaysPerWeek} workouts per week
- Week 1-2 must be labeled "Load Phase"
- Week 3 must be labeled "Peak Phase"
- Week 4 must be labeled "Deload Phase"
- Include appropriate volume and intensity changes for each phase
- Accommodate any injuries mentioned
- Match the training goal with appropriate exercise selection
  `;

  const userPrompt = `
Fitness Profile:
- Age: ${fitnessProfile.age}
- Gender: ${fitnessProfile.gender}
- Fitness Level: ${fitnessProfile.fitnessLevel}
- Primary Goal: ${fitnessProfile.fitnessGoal}
- Training Goal: ${fitnessProfile.trainingGoal}
- Injuries/Pains: ${fitnessProfile.injuriesPains?.join(', ') || 'None'}
- Workout Days: ${fitnessProfile.workoutDaysPerWeek} days/week
- Session Duration: ${fitnessProfile.workoutDuration} minutes
- Equipment: ${fitnessProfile.equipment?.join(', ') || 'Full gym'}

Create a complete 4-week periodized program with proper phase progression. Each week should have ${fitnessProfile.workoutDaysPerWeek} unique workouts.
  `;

  const chat = await getOpenAIClient().chat.completions.create({
    model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    temperature: 0.7,
    max_tokens: 4000, // Increased to ensure complete generation
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]
  });

  const result = chat.choices[0].message.content!;
  return JSON.parse(result);
}
