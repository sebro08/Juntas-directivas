/**
  DTO utilizado para crear manualmente una notificación desde el frontend o pruebas.
 */
export interface CreateNotificationDto {
    recipient: string;
    subject: string;
    content: string;
}
