import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { Session } from './Session';
// src/model/Acta.ts
import { Visitable } from '../visitor/visitable';
import { Visitor } from '../visitor/visitor';

@Entity()
export class Acta implements Visitable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  pdfPath: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  lastUpdatedAt: Date;

  @ManyToOne(() => Session, session => session.actas)
  session: Session;

  accept(visitor: Visitor): void {
    visitor.visitActa(this);
  }
}
