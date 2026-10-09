// model/ExternalGuest.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany
} from 'typeorm';
import { Session } from './Session';
import { SessionParticipant } from './SessionParticipant';

@Entity('external_guest')
export class ExternalGuest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @ManyToOne(() => Session, session => session.externalGuests, {
    nullable: false,
    onDelete: 'CASCADE'
  })
  session: Session;
  @OneToMany(() => SessionParticipant, sp => sp.externalGuest)
  sessionParticipations: SessionParticipant[];
}
