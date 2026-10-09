// model/SessionStatus.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Session } from './Session';

@Entity('session_statuses')
export class SessionStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Session, session => session.status)
  sessions: Session[];
}
