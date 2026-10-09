/**
  Subclase concreta del Template Method.
  
  Genera una notificación de convocatoria a sesión de Junta Directiva.
 */
import { NotificationTemplate } from './notification-template';

export class SessionInvitationNotification extends NotificationTemplate {
    constructor(
        private recipientEmail: string,
        private sessionName: string,
        private sessionDate: Date
    ) {
        super();
    }

    getRecipient(): string {
        return this.recipientEmail;
    }

    getSubject(): string {
        return 'Convocatoria a Sesión de Junta Directiva';
    }

    getContent(): string {
        return `Se le convoca a la sesión "${this.sessionName}" programada para el día ${this.sessionDate.toLocaleDateString()}. Revise la plataforma para más detalles.`;
    }
}
