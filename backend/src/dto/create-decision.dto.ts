export class CreateDecisionDto {
  summary: string;
  result: string;
  createdById: number;
  assignedToId?: number;
  agendaItemId: number;
}
