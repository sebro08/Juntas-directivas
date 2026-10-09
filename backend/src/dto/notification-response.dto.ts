/**
  DTO utilizado para enviar las notificaciones al frontend.
  
  Define la estructura de una notificación en las respuestas.
 */
export interface NotificationResponseDto {
    id: number;
    sender: string;
    recipient: string;
    subject: string;
    content: string;
    timestamp: Date;
    isRead: boolean;
}
