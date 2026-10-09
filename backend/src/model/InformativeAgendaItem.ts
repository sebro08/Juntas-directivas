// InformativeAgendaItem.ts
import { ChildEntity } from 'typeorm';
import { AgendaItem } from './AgendaItem';

@ChildEntity()
export class InformativeAgendaItem extends AgendaItem {
  override handle(): void {
    console.log("Handling informative agenda item");
  }
}
