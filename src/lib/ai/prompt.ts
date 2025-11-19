import type { Workout } from "@/types";

export const createWorkoutPrompt = (
  trainingTime: number,
  history: Workout[],
  goal: string,
  level: string,
  userRequest?: string,
  personalInfo?: string // ▼ 追加: パーソナル情報
): string => {
  const today = new Date().toISOString().split('T')[0];

  const historyText =
    history.length > 0
      ? history.map((workout) => `- ${workout.date}: ${workout.theme}`).join("\n")
      : "なし";

  const requestText = userRequest ? userRequest : "特になし";
  const personalInfoText = personalInfo ? personalInfo : "特になし";

  const prompt = `
# あなたは、利用者の安全と成長を第一に考える、世界クラスのAIパーソナルトレーナーです。
# 以下の情報に基づき、今日の最適なトレーニングメニューを提案してください。

## ユーザー情報
- 目標: ${goal}
- レベル: ${level}
- **パーソナル情報・特記事項（最優先）:**
  「${personalInfoText}」
  **※このパーソナル情報は、常に考慮すべき前提条件です。怪我や持病に関する記述がある場合は、安全を最優先してください。**

- 直近のトレーニング履歴:
${historyText}

## 本日の制約
- トレーニング可能時間: ${trainingTime}分
- 今回の日付: ${today}

## 本日のユーザー要望
「${requestText}」

## 判断基準
1.  **パーソナル情報の遵守:** ユーザーの持病や怪我、長期的な目標（パーソナル情報）を必ず考慮してください。
2.  **要望の評価:** 本日の要望が、パーソナル情報や医学的常識と矛盾しない範囲で採用してください。
3.  **出力:** 
    -   **theme:** キャッチコピー。
    -   **reason:** なぜそのメニューにしたのか。特にパーソナル情報を考慮した場合は、「腰への負担を避けるため〜」のように説明に含めてください。

## 出力形式のルール
- 必ず、以下のJSONスキーマに準拠したJSONオブジェクトのみを出力してください。

\`\`\`json
{
  "id": "一意のID文字列",
  "date": "${today}",
  "theme": "文字列",
  "reason": "文字列",
  "sections": [
    {
      "title": "セクション名",
      "exercises": [
        {
          "id": "一意のID文字列",
          "name": "種目名",
          "sets": [
            { "id": "一意のID文字列", "weight": 0, "reps": 0, "isCompleted": false }
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