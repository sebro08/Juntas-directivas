export class CreateTaskDto {
  description: string;
  dueDate: Date;
  assignedToId: number;
  sessionId: number;
  statusId: number;
}
