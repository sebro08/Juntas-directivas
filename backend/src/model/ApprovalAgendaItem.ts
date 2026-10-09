// ApprovalAgendaItem.ts
import { ChildEntity } from 'typeorm';
import { AgendaItem } from './AgendaItem';

@ChildEntity()
export class ApprovalAgendaItem extends AgendaItem {
  override handle(): void {
    console.log("Handling approval agenda item");
  }
}
