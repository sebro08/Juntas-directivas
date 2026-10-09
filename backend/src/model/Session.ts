// model/Session.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany
} from 'typeorm';
import { Modality } from './Modality';
import { SessionStatus } from './SessionStatus';
import { User } from './User';
import { Task } from './Task';
import { ExternalGuest } from './ExternalGuest';
import { SessionParticipant } from './SessionParticipant';
import { Acta } from './Acta';
import { AgendaItem } from './AgendaItem';
import { Visitable } from '../visitor/visitable';
import { Visitor } from '../visitor/visitor';

@Entity('sessions')
export class Session implements Visitable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'date' })
  date: Date;

  @Column()
  timeStart: string;

  @Column()
  timeEnd: string;

  @Column()
  filePath: string;

  // Relaciones con entidades básicas
  @ManyToOne(() => Modality, modality => modality.sessions)
  modality: Modality;

  @ManyToOne(() => SessionStatus, status => status.sessions)
  status: SessionStatus;

  // Relaciones con usuarios
  @ManyToOne(() => User)
  createdBy: User;

  @ManyToOne(() => User)
  lastUpdatedBy: User;

  // Relaciones hacia hijos
  @OneToMany(() => Task, task => task.session, { cascade: true })
  tasks: Task[];

  @OneToMany(() => SessionParticipant, sp => sp.session, { cascade: true })
  participants: SessionParticipant[];

  @OneToMany(() => Acta, acta => acta.session, { cascade: true })
  actas: Acta[];

  @OneToMany(() => AgendaItem, item => item.session, { cascade: true })
  agendaItems: AgendaItem[];

  @OneToMany(() => ExternalGuest, guest => guest.session)
  externalGuests: ExternalGuest[];

  // Método auxiliar
  getFormattedTitle(): string {
    return `${this.title} - ${this.date.toISOString().split('T')[0]}`;
  }

  /** Visitor Pattern */
  accept(visitor: Visitor): void {
    visitor.visitSession(this);
  }
  
}
