export class TaskResponseDto {
  id: number;
  description: string;
  dueDate: Date;
  assignedTo: {
    id: number;
    name: string;
  };
  status: {
    id: number;
    name: string;
  };
  sessionId: number;
}
