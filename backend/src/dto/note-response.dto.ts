export class NoteResponseDto {
  id: number;
  content: string;
  createdAt: Date;
  author: {
    id: number;
    fullName: string;
  };
  pointId: number;
}
