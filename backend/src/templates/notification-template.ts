/**
  Clase abstracta que define el Template Method para generar notificaciones.
  
  Contiene el flujo general de creación de una notificación, estableciendo
  estructura fija en algunos campos como el emisor y la fecha de generación,
  mientras permite que las subclases definan el destinatario, el asunto y el contenido.
 */
import { Notification } from '../model/Notification';
import { AppDataSource } from '../database/data-source';

export abstract class NotificationTemplate {
    /**
      Template Method que genera la notificación.
      Construye la notificación usando los métodos definidos en esta clase y sus subclases.
     */
    generate(): Notification {
        const notificationRepo = AppDataSource.getRepository(Notification);
        return notificationRepo.create({
            sender: this.getSender(),
            recipient: this.getRecipient(),
            subject: this.getSubject(),
            content: this.getContent(),
            timestamp: this.getTimestamp(),
            isRead: false,
        });
    }

    /**
      Obtiene el destinatario de la notificación.
      @returns Email del destinatario.
     */
    abstract getRecipient(): string;

    /**
      Obtiene el asunto del mensaje.
      @returns Texto del asunto.
     */
    abstract getSubject(): string;

    /**
      Obtiene el contenido del mensaje.
      @returns Texto del contenido.
     */
    abstract getContent(): string;

    /**
      Devuelve el emisor del mensaje.
      Por defecto es 'Sistema'.
     */
    getSender(): string {
        return 'Sistema';
    }

    /**
      Devuelve la fecha y hora actual para la notificación.
     */
    getTimestamp(): Date {
        return new Date();
    }
}
