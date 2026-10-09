export interface Notification {
    id: number;
    sender: string;
    recipient: string;
    subject: string;
    content: string;
    timestamp: Date;
    isRead: boolean;
}
