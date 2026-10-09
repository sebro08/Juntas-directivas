// src/dto/create-agenda-item.dto.ts
export class CreateAgendaItemDto {
  title!: string;
  duration!: number;
  presenterId!: number;
  sessionId!: number;
  hasAnnotations!: boolean;
  hasDecisions!: boolean;
  hasTasks!: boolean;
  isApproval?: boolean;
}
