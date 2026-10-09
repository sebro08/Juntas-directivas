// model/SessionParticipant.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne
} from 'typeorm';
import { Session } from './Session';
import { User } from './User';
import { ExternalGuest } from './ExternalGuest';

@Entity('session_participants')
export class SessionParticipant {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Session, session => session.participants, { onDelete: 'CASCADE' })
  session: Session;

  @ManyToOne(() => User, user => user.sessionParticipations, { nullable: true })
  user: User;

  @ManyToOne(() => ExternalGuest, guest => guest.sessionParticipations, { nullable: true })
  externalGuest: ExternalGuest;

  @Column({ default: false })
  attended: boolean;

  // Métodos públicos

  addParticipant(): void {
    // lógica adicional si fuese necesaria
  }

  remove(): void {
    // lógica para eliminar o marcar eliminación
  }

  confirmAttendance(): void {
    this.attended = true;
  }
}
