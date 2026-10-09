import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    sender: string;

    @Column()
    recipient: string;

    @Column()
    subject: string;

    @Column()
    content: string;

    @Column()
    timestamp: Date;

    @Column({ default: false })
    isRead: boolean;
}
