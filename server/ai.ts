import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!, // Add exclamation mark if using TypeScript
});

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

  const chat = await openai.chat.completions.create({
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
You are an elite strength and conditioning coach creating personalized 4-week periodized workout programs.

CRITICAL: Generate a complete 4-week program following this EXACT phase structure:
- Week 1-2: LOAD PHASE - Building volume and work capacity
- Week 3: PEAK PHASE - Maximum intensity, reduced volume
- Week 4: DELOAD PHASE - Active recovery and adaptation

Training Phases Details:
LOAD PHASE (Week 1-2):
- Higher volume: 4-5 sets on main movements
- Moderate intensity: 70-85% 1RM
- Focus on accumulating training volume
- Progressive overload from week 1 to week 2

PEAK PHASE (Week 3):
- Lower volume: 3-4 sets on main movements
- High intensity: 85-95% 1RM
- Focus on heavy singles, doubles, or triples
- Maximum effort week

DELOAD PHASE (Week 4):
- Reduced volume: 2-3 sets
- Reduced intensity: 60-70% 1RM
- Focus on movement quality and recovery
- Light technical work

Program Structure for EVERY workout:
1. WARM-UP BLOCK: Dynamic movements, mobility, activation (2-3 exercises)
2. MAIN BLOCK A: Primary compound movement (1-2 exercises) - heaviest/most challenging
3. MAIN BLOCK B: Secondary compound movement (1-2 exercises) - moderate intensity
4. BLOCK C (FINISHER): Higher rep accessory work, metabolic finisher (2-3 exercises) - lighter weight, more volume

Return a 4-week program in this exact JSON format:

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

  const chat = await openai.chat.completions.create({
    model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    temperature: 0.7,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]
  });

  const result = chat.choices[0].message.content!;
  return JSON.parse(result);
}
