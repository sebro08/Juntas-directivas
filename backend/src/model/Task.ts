// model/Task.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne
} from 'typeorm';
import { TaskStatus } from './taskStatus';
import { User } from './User';
import { Session } from './Session';
import { AgendaItem } from './AgendaItem';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @Column({ type: 'datetime', default: null })
  dueDate: Date;

  @ManyToOne(() => TaskStatus, status => status.tasks, { eager: true })
  status: TaskStatus;

  @ManyToOne(() => User, user => user.tasks)
  assignedTo: User;

  @ManyToOne(() => Session, session => session.tasks, { onDelete: 'CASCADE' }) // Composición fuerte
  session: Session;

    @ManyToOne(() => AgendaItem, item => item.tasks)
    agendaItem: AgendaItem;
}
