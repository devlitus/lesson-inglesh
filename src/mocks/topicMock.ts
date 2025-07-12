import type { Topic } from "../domain/entities/Topic";

export const mockTopic: Topic = {
  id: "topic-1",
  title: "Grammar",
  description: "Grammar topics",
  icon: "grammar-icon",
  color_scheme: "green",
};

export const mockTopics: Topic[] = [
  {
    id: "topic-1",
    title: "Grammar",
    description: "Grammar topics",
    icon: "grammar-icon",
    color_scheme: "green",
  },
  {
    id: "topic-2",
    title: "Reading",
    description: "Reading topics",
    icon: "reading-icon",
    color_scheme: "blue",
  }
];