// src/model/AgendaItem.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  TableInheritance
} from 'typeorm';
import { User } from './User';
import { Session } from './Session';
import { Annotation } from './Annotation';
import { Decision } from './Decision';
import { ExternalGuest } from './ExternalGuest';
import { Task } from './Task';

@Entity('agenda_items')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export abstract class AgendaItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  duration: number;

  @Column({ nullable: true })
  filePath: string;

  @ManyToOne(() => User, { nullable: true })
  presenter: User;

  @ManyToOne(() => ExternalGuest, { nullable: true })
  externalPresenter: ExternalGuest;

  @ManyToOne(() => Session, session => session.agendaItems, { onDelete: 'CASCADE' })
  session: Session;

  @OneToMany(() => Annotation, annotation => annotation.agendaItem, { cascade: true })
  annotations: Annotation[];

  @OneToMany(() => Decision, decision => decision.agendaItem, { cascade: true })
  decisions: Decision[];

  @OneToMany(() => Task, task => task.agendaItem, { cascade: true })
  tasks: Task[];

  @Column({ default: false })
  requiresVote: boolean;

  @Column({ type: 'tinyint', default: 0 }) // 0 = indefinido, 1 = aprobado, 2 = rechazado
  voteResult: number;

  getId(): number {
    return this.id;
  }

  getTitle(): string {
    return this.title;
  }

  getDuration(): number {
    return this.duration;
  }

  getPresenter(): User {
    return this.presenter;
  }

  getSession(): Session {
    return this.session;
  }

  abstract handle(): void;
}
