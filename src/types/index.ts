export interface SetRecord {
  id: string;
  weight: number;
  reps: number;
  isCompleted: boolean;
}

export interface Exercise {
  id:string;
  name: string;
  sets: SetRecord[];
}

// ▼▼▼ 新しく「セクション」という概念を追加 ▼▼▼
export interface WorkoutSection {
  title: string; // 例：「ウォームアップ」「胸」「クールダウン」
  exercises: Exercise[];
}

// ▼▼▼ Workoutの型を大幅に拡張 ▼▼▼
export interface Workout {
  id: string;
  date: string;
  theme: string; // その日のテーマ
  reason: string; // なぜそのテーマなのか
  sections: WorkoutSection[]; // 複数のセクションを持つように変更
  // 'menu' は 'sections' に統合されたので削除
}