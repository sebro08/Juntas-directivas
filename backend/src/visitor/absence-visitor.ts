import { Visitor } from './visitor';
import { Session } from '../model/Session';
import { Acta } from '../model/Acta';
import { AppDataSource } from '../database/data-source';

/**
 * Identifica sesiones en las que el usuario estuvo ausente.
 */
export class AbsenceVisitor extends Visitor {
  private absentSessions: Session[] = [];

  constructor(private readonly participantId: number) {
    super();
  }

  visitSession(session: Session): void {
    const wasPresent = session.participants?.some(p => p.user?.id === this.participantId);

    if (!wasPresent) {
      this.absentSessions.push(session);
    }
  }

  // No se opera sobre actas en este Visitor
  visitActa(acta: Acta): void {/* vacío */}

  getResult(): Session[] {
    return this.absentSessions;
  }
  
  async getAbsentSessions(userId: number): Promise<Session[]> {
    const repo = AppDataSource.getRepository(Session);
    const sessions = await repo.find({ relations: ['participants', 'participants.user'] });
    const v = new AbsenceVisitor(userId);
    sessions.forEach(s => s.accept(v));
    return v.getResult(); // solo sesiones donde fue invitado y no asistió
  }

}