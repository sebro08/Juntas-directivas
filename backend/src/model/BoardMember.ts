import { ChildEntity, Column } from 'typeorm';
import { User } from './User';

@ChildEntity()
export class BoardMember extends User {
  @Column({ nullable: true })
  position?: string;

  @Column({ nullable: true })
  startDate?: Date;

  @Column({ nullable: true })
  endDate?: Date;
}
