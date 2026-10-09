// InformativeItemCreator.ts
import { InformativeAgendaItem } from './InformativeAgendaItem';
import { AgendaItem } from './AgendaItem';
import { Session } from './Session';
import { User } from './User';
import { AgendaItemCreator } from './AgendaItemCreator';

export class InformativeItemCreator extends AgendaItemCreator {
  createAgendaItem(id: number, title: string, duration: number, presenter: User, session: Session): AgendaItem {
    const item = new InformativeAgendaItem();
    item.id = id;
    item.title = title;
    item.duration = duration;
    item.presenter = presenter;
    item.session = session;
    return item;
  }
}
