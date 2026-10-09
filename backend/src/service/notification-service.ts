/**
  Servicio responsable de gestionar las operaciones de notificaciones.
 
  Permite enviar notificaciones utilizando el Template Method, obtener notificaciones
  de un usuario, marcarlas como leídas o eliminarlas.
 */
import { AppDataSource } from '../database/data-source';
import { Notification } from '../model/Notification';
import { NotificationTemplate } from '../templates/notification-template';

export class NotificationService {
    private notificationRepo = AppDataSource.getRepository(Notification);

    /**
      Envía (genera y guarda) una notificación usando un Template.
      @param template Template concreto (session invitation, task assignment, etc.)
     */
    async sendNotification(template: NotificationTemplate) {
        const notification = template.generate();
        await this.notificationRepo.save(notification);
        console.log('Notification saved:', notification);
    }

    /**
      Obtiene todas las notificaciones de un usuario ordenadas por fecha descendente.
      @param email Email del usuario.
     */
    async getNotificationsForUser(email: string) {
        return this.notificationRepo.find({
            where: { recipient: email },
            order: { timestamp: 'DESC' },
        });
    }

    /**
      Marca una notificación como leída.
      @param notificationId ID de la notificación.
     */
    async markAsRead(notificationId: number) {
        const notification = await this.notificationRepo.findOneBy({ id: notificationId });
        if (notification) {
            notification.isRead = true;
            await this.notificationRepo.save(notification);
        }
    }

    /**
      Elimina una notificación.
      @param notificationId ID de la notificación.
     */
    async deleteNotification(notificationId: number) {
        await this.notificationRepo.delete(notificationId);
    }
}
