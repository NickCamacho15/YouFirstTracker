import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Using your secret!
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
You are an elite strength and conditioning coach creating personalized 4-week workout programs for advanced athletes.

Based on the user's fitness profile, generate a comprehensive 4-week training program with structured workout blocks.

Training Goals:
- Explosiveness: Focus on power, speed, and reactive strength
- Strength: Focus on maximal strength and progressive overload
- Hybrid: Balance of strength, power, and conditioning
- Weight Loss: Higher volume, shorter rest, metabolic focus

Program Structure:
- Each day has 4 blocks: Warm-up, Main Block A, Main Block B, and Finisher
- Warm-up: 5-8 minutes of mobility and activation
- Main Block A: Primary compound movements (most challenging)
- Main Block B: Secondary compound/isolation work
- Finisher: High-rep accessory work for arms/legs (lighter intensity)

Injury Accommodations:
- Knee issues: Avoid deep squats, use leg press, focus on hip hinge patterns
- Shoulder issues: Avoid overhead pressing, use neutral grip, focus on horizontal pulling
- Back issues: Avoid spinal loading, use supported variations, focus on core stability

Return a 4-week program in this exact JSON format:

{
  "program": {
    "name": "string",
    "description": "string",
    "duration": 4,
    "weeklySchedule": ["day1_name", "day2_name", "day3_name", "day4_name", "day5_name", "rest", "rest"]
  },
  "weeks": [
    {
      "weekNumber": 1,
      "days": [
        {
          "dayNumber": 1,
          "name": "string",
          "description": "string",
          "blocks": [
            {
              "blockType": "warmup",
              "name": "Warm-up",
              "exercises": [
                {
                  "exerciseName": "string",
                  "sets": 1,
                  "reps": "10-15",
                  "weight": "bodyweight",
                  "restPeriod": "30s",
                  "notes": "string"
                }
              ]
            },
            {
              "blockType": "main_a",
              "name": "Main Block A",
              "exercises": [
                {
                  "exerciseName": "string",
                  "sets": 4,
                  "reps": "3-5",
                  "weight": "225 lbs",
                  "restPeriod": "3-4min",
                  "notes": "string"
                }
              ]
            },
            {
              "blockType": "main_b",
              "name": "Main Block B",
              "exercises": [
                {
                  "exerciseName": "string",
                  "sets": 3,
                  "reps": "6-8",
                  "weight": "185 lbs",
                  "restPeriod": "2-3min",
                  "notes": "string"
                }
              ]
            },
            {
              "blockType": "finisher",
              "name": "Finisher",
              "exercises": [
                {
                  "exerciseName": "string",
                  "sets": 2,
                  "reps": "12-15",
                  "weight": "challenging",
                  "restPeriod": "60s",
                  "notes": "string"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}

Important: Generate all 4 weeks with progressive overload. Accommodate any injuries mentioned. Match the training goal with appropriate rep ranges and intensities.
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

Create a program that accommodates any injuries and matches the training goal intensity.
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