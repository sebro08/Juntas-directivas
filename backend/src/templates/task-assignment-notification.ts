/**
  Subclase concreta del Template Method.
 
  Genera una notificación para la asignación de un punto estratégico
  a un miembro de la Junta Directiva.
 */
import { NotificationTemplate } from './notification-template';

export class TaskAssignmentNotification extends NotificationTemplate {
    constructor(
        private recipientEmail: string,
        private sessionName: string,
        private agendaPoint: string
    ) {
        super();
    }

    getRecipient(): string {
        return this.recipientEmail;
    }

    getSubject(): string {
        return 'Asignación de Punto Estratégico';
    }

    getContent(): string {
        return `En la sesión "${this.sessionName}" se le ha asignado la responsabilidad del punto: "${this.agendaPoint}". Consulte la plataforma para más detalles.`;
    }
}
