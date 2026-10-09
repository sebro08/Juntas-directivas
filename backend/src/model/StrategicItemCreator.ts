// StrategicItemCreator.ts
import { StrategicAgendaItem } from './StrategicAgendaItem';
import { AgendaItem } from './AgendaItem';
import { Session } from './Session';
import { User } from './User';
import { AgendaItemCreator } from './AgendaItemCreator';

export class StrategicItemCreator extends AgendaItemCreator {
  createAgendaItem(id: number, title: string, duration: number, presenter: User, session: Session): AgendaItem {
    const item = new StrategicAgendaItem();
    item.id = id;
    item.title = title;
    item.duration = duration;
    item.presenter = presenter;
    item.session = session;
    return item;
  }
}
