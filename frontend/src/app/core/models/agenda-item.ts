// viene siendo los puntos de las sesiones

export interface AgendaItem {
  id: number;
  sessionId: number;
  title: string;
  endTime: Date;
  resolution: string; 
}
