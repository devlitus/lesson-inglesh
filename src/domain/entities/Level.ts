export interface Level {
  id: string;
  title: string;
  sub_title: string;
  description: string;
  feature: string;
  icon: string;
  color_scheme: string;
}

export interface LevelWithProgress extends Level {
  progress?: number;
  isCompleted?: boolean;
  unlockedAt?: string;
}

export interface LevelSelection {
  id: string;
  id_user: string;
  id_level: string;
  id_topic: string;
}