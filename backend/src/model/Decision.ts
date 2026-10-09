import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne
} from 'typeorm';
import { User } from './User';
import { AgendaItem } from './AgendaItem';

@Entity()
export class Decision {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  summary: string;

  @Column()
  result: string;

  @ManyToOne(() => User, user => user.decisions, { nullable: false })
  createdBy: User;

  @ManyToOne(() => AgendaItem, item => item.decisions)
  agendaItem: AgendaItem;

  // Métodos auxiliares
  create(): Decision {
    return this;
  }

  edit(): void {
    // Lógica para edición
  }

  finalize(): void {
    // Lógica para finalización
  }
}
