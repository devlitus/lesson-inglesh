export interface SelectLevelTopic {
  id?: string;
  id_user: string;
  id_level: string;
  id_topic: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSelectLevelTopicInput {
  id_user: string;
  id_level: string;
  id_topic: string;
}