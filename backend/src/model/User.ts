import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  TableInheritance, BeforeInsert, BeforeUpdate
} from 'typeorm';
import { Role } from './role';
import { Task } from './Task';
import { SessionParticipant } from './SessionParticipant';
import { Annotation } from './Annotation';
import { Decision } from './Decision';
import * as bcrypt from 'bcrypt';

@Entity('users')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: true })
  loginAvailable: boolean;

  @ManyToOne(() => Role, role => role.users)
  role: Role;

  @OneToMany(() => Task, task => task.assignedTo)
  tasks: Task[];

  @OneToMany(() => SessionParticipant, sp => sp.user)
  sessionParticipations: SessionParticipant[];

  @OneToMany(() => Annotation, annotation => annotation.author)
  annotations: Annotation[];


  @OneToMany(() => Decision, decision => decision.createdBy)
  decisions: Decision[];


  // Métodos públicos

  getId(): number {
    return this.id;
  }

  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  isLoginAvailable(): boolean {
    return this.loginAvailable;
  }

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  async checkPassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
