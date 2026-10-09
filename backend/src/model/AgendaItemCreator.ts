// AgendaItemCreator.ts
import { AgendaItem } from './AgendaItem';
import { Session } from './Session';
import { User } from './User';

export abstract class AgendaItemCreator {
  abstract createAgendaItem(
    id: number,
    title: string,
    duration: number,
    presenter: User,
    session: Session
  ): AgendaItem;

  processItem(
    id: number,
    title: string,
    duration: number,
    presenter: User,
    session: Session
  ): void {
    const item = this.createAgendaItem(id, title, duration, presenter, session);
    item.handle();
  }
}
