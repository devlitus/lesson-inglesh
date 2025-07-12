import type { Topic } from "../domain/entities/Topic";

export const mockTopic: Topic = {
  id: "1",
  title: "Family & Relationships",
  description: "Learn vocabulary about family members and relationships",
  icon: "👨‍👩‍👧‍👦",
  color_scheme: "#10B981",
};

export const mockTopics: Topic[] = [
  {
    id: "1",
    title: "Family & Relationships",
    description: "Learn vocabulary about family members and relationships",
    icon: "👨‍👩‍👧‍👦",
    color_scheme: "#10B981",
  },
  {
    id: "2",
    title: "Food & Cooking",
    description: "Discover culinary vocabulary and cooking terms",
    icon: "🍳",
    color_scheme: "#F59E0B",
  },
  {
    id: "3",
    title: "Travel & Transportation",
    description: "Essential vocabulary for traveling and getting around",
    icon: "✈️",
    color_scheme: "#3B82F6",
  },
];