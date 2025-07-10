export interface Topic {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  color_scheme?: string;
}

export interface TopicWithSelection extends Topic {
  isSelected?: boolean;
  selectionId?: string;
}