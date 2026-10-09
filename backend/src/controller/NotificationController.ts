/**
  Controlador REST para gestionar las notificaciones.
  
  Expone endpoints para:
  - Obtener las notificaciones de un usuario.
  - Crear una notificación manual.
  - Marcar como leída una notificación.
  - Eliminar una notificación.
  - Vaciar el buzón de notificaciones de un usuario.
 */

import { Request, Response } from 'express';
import { AppDataSource } from '../database/data-source';
import { Notification } from '../model/Notification';
import { NotificationResponseDto } from '../dto/notification-response.dto';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { NotificationService } from '../service/notification-service';
import { SessionInvitationNotification } from '../templates/session-invitation-notification';
import { TaskAssignmentNotification } from '../templates/task-assignment-notification';

export class NotificationController {
    private static instance: NotificationController;
    private notificationRepo = AppDataSource.getRepository(Notification);
    private notificationService = new NotificationService();

    private constructor() {}

    static getInstance(): NotificationController {
        if (!NotificationController.instance) {
            NotificationController.instance = new NotificationController();
        }
        return NotificationController.instance;
    }

    // Obtener todas las notificaciones de un usuario
    async getNotifications(req: Request, res: Response) {
        const { email } = req.params;

        try {
            const notifications = await this.notificationRepo.find({
                where: { recipient: email },
                order: { timestamp: 'DESC' },
            });

            const result: NotificationResponseDto[] = notifications.map(n => ({
                id: n.id,
                sender: n.sender,
                recipient: n.recipient,
                subject: n.subject,
                content: n.content,
                timestamp: n.timestamp,
                isRead: n.isRead,
            }));

            res.json(result);
        } catch (error) {
            console.error('Error getting notifications:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Crear notificación manual
    async createNotification(req: Request, res: Response) {
        const { recipient, subject, content }: CreateNotificationDto = req.body;

        try {
            const notification = this.notificationRepo.create({
                sender: 'Sistema',
                recipient,
                subject,
                content,
                timestamp: new Date(),
                isRead: false,
            });

            await this.notificationRepo.save(notification);

            const result: NotificationResponseDto = {
                id: notification.id,
                sender: notification.sender,
                recipient: notification.recipient,
                subject: notification.subject,
                content: notification.content,
                timestamp: notification.timestamp,
                isRead: notification.isRead,
            };

            res.status(201).json(result);
        } catch (error) {
            console.error('Error creating notification:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Marcar una notificación como leída
    async markAsRead(req: Request, res: Response) {
        const { id } = req.params;

        try {
            const notification = await this.notificationRepo.findOneBy({ id: parseInt(id) });

            if (!notification) {
                return res.status(404).json({ error: 'Notification not found' });
            }

            notification.isRead = true;
            await this.notificationRepo.save(notification);

            res.json({ message: 'Notification marked as read' });
        } catch (error) {
            console.error('Error marking notification as read:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Eliminar una notificación
    async deleteNotification(req: Request, res: Response) {
        const { id } = req.params;

        try {
            const result = await this.notificationRepo.delete(parseInt(id));

            if (result.affected === 0) {
                return res.status(404).json({ error: 'Notification not found' });
            }

            res.json({ message: 'Notification deleted successfully' });
        } catch (error) {
            console.error('Error deleting notification:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Vaciar buzón de un usuario
    async clearNotifications(req: Request, res: Response) {
        const { email } = req.params;

        try {
            const result = await this.notificationRepo.delete({ recipient: email });
            res.json({ message: `Deleted ${result.affected} notifications.` });
        } catch (error) {
            console.error('Error clearing notifications:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Enviar notificación usando un template (para pruebas o funcionalidades)
    async testTemplateNotification(req: Request, res: Response) {
        const { type, email, sessionName, sessionDate, agendaPoint } = req.body;

        try {
            let template;

            if (type === 'invitation') {
                if (!email || !sessionName || !sessionDate) {
                    return res.status(400).json({ error: 'Faltan datos para notificación de invitación' });
                }

                template = new SessionInvitationNotification(
                    email,
                    sessionName,
                    new Date(sessionDate)
                );
            } else if (type === 'task') {
                if (!email || !sessionName || !agendaPoint) {
                    return res.status(400).json({ error: 'Faltan datos para notificación de tarea' });
                }

                template = new TaskAssignmentNotification(
                    email,
                    sessionName,
                    agendaPoint
                );
            } else {
                return res.status(400).json({ error: 'Tipo de notificación no válido' });
            }

            await this.notificationService.sendNotification(template);

            res.status(201).json({ message: 'Notificación enviada correctamente con template.' });
        } catch (error) {
            console.error('Error al enviar notificación con template:', error);
            res.status(500).json({ error: 'Error interno al enviar notificación' });
        }
    }
}
