// StrategicAgendaItem.ts
import { ChildEntity } from 'typeorm';
import { AgendaItem } from './AgendaItem';

@ChildEntity()
export class StrategicAgendaItem extends AgendaItem {
  override handle(): void {
    console.log("Handling strategic agenda item");
  }
}
