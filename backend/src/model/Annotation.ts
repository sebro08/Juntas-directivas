import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn
} from 'typeorm';
import { User } from './User';
import { AgendaItem } from './AgendaItem';

@Entity()
export class Annotation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @CreateDateColumn()
  timestamp: Date;

  @ManyToOne(() => User, user => user.annotations)
  author: User;

  @ManyToOne(() => AgendaItem, item => item.annotations)
  agendaItem: AgendaItem;

  create(): Annotation {
    return this;
  }

  edit(): void {
    // lógica de edición
  }

  finalize(): void {
    // lógica de cierre/finalización
  }
}
