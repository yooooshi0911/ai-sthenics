import type { Workout } from "@/types";

export const createWorkoutPrompt = (
  trainingTime: number,
  history: Workout[],
  goal: string,
  level: string,
  userRequest?: string,
  personalInfo?: string,
  language: string = 'ja' // 言語設定を受け取る
): string => {
  const today = new Date().toISOString().split('T')[0];

  const historyText =
    history.length > 0
      ? history.map((workout) => `- ${workout.date}: ${workout.theme}`).join("\n")
      : "なし";

  const requestText = userRequest ? userRequest : "特になし";
  const personalInfoText = personalInfo ? personalInfo : "特になし";

  // 言語コードをAIが理解しやすい言葉に変換
  const langMap: { [key: string]: string } = {
    ja: "Japanese",
    it: "Italian",
    en: "English",
  };
  const targetLang = langMap[language] || "Japanese";

  const prompt = `
# You are a world-class AI personal trainer.
# Generate the best workout menu based on the user information below.

## User Info
- Goal: ${goal}
- Level: ${level}
- **Personal Info / Special Requirements (Highest Priority):**
  "${personalInfoText}"
  **Consider this personal information as a prerequisite. Prioritize safety if there are any injuries or medical conditions.**

- History:
${historyText}

## Constraints
- Time: ${trainingTime} min
- Date: ${today}
- User Request: "${requestText}"

## IMPORTANT: Output Language
**You must output all text content (theme, reason, exercise names, section titles) in ${targetLang}.**
(Even if the user's input is in Japanese, translate the result into ${targetLang}.)

## Output Format (JSON)
- You must output only a valid JSON object based on the following schema.

\`\`\`json
{
  "id": "unique-id-string",
  "date": "${today}",
  "theme": "String",
  "reason": "String",
  "sections": [
    {
      "title": "Section Title (e.g. Warm-up)",
      "exercises": [
        {
          "id": "unique-id-string",
          "name": "Exercise Name",
          "sets": [
            { "id": "unique-id-string", "weight": 0, "reps": 0, "isCompleted": false }
          ]
        }
      ]
    }
  ]
}
\`\`\`
`;

  return prompt;
};