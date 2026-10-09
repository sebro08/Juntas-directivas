export interface Task {
  id?: number;
  pointId: number;
  title: string;
  description: string;
  assignedToUserId: number;
  sessionId: number;
}
