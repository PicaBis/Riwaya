export interface Comment {
  id: string;
  novelId: string;
  author: string;
  content: string;
  createdAt: number;
  likes: string[];
  replies?: { id: string; author: string; content: string; createdAt: number }[];
}
