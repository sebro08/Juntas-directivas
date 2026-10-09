import { AppDataSource } from '../database/data-source';
import { Between } from 'typeorm';
import { Acta }     from '../model/Acta';
import { Session }  from '../model/Session';

export class ConsultationService {

  /* ────────────────── ADMIN ────────────────── */

  /* Sesiones con estado “En Progreso” */
  async getInProgressSessions(): Promise<Session[]> {
    return AppDataSource
      .getRepository(Session)
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.status', 'st')
      .leftJoinAndSelect('s.agendaItems', 'ai')
      .where('st.name = :name', { name: 'En Progreso' })
      .orderBy('s.date', 'ASC')
      .getMany();
  }

  /* Agendas editables: estado “Agendada” y convocatoria NO enviada */
  async getEditableAgendas(): Promise<Session[]> {
    const repo = AppDataSource.getRepository(Session);
    return repo.find({
      where: { status: { name: 'Agendada' } },
      relations: ['agendaItems', 'status'],
      order: { date: 'ASC' }
    });
  }

  /* Próximas (sin acta): estado Agendada y sin actas registradas */
  async getUpcomingSessions(): Promise<Session[]> {
    return AppDataSource
      .getRepository(Session)
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.status', 'st')
      .leftJoinAndSelect('s.agendaItems', 'ai')
      .leftJoin('s.actas', 'a')
      .where('st.name = :name', { name: 'Agendada' })
      .andWhere('a.id IS NULL')
      .orderBy('s.date', 'ASC')
      .getMany();
  }

  /* ────────────────── MIEMBRO JD ────────────────── */

  /* Actas donde el usuario ES expositor */
  async getActasByPresenter(userId: number): Promise<Acta[]> {
    return AppDataSource
      .getRepository(Acta)
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.session', 's')
      .leftJoinAndSelect('s.agendaItems', 'ai')
      .leftJoinAndSelect('ai.presenter', 'p')
      .where('p.id = :id', { id: userId })
      .getMany();
  }

  /* Actas donde el usuario ES responsable (tarea) */
  async getActasByResponsible(userId: number): Promise<Acta[]> {
    return AppDataSource
      .getRepository(Acta)
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.session', 's')
      .leftJoinAndSelect('s.agendaItems', 'ai')
      .leftJoinAndSelect('ai.tasks', 't')
      .leftJoinAndSelect('t.assignedTo', 'u')
      .where('u.id = :id', { id: userId })
      .getMany();
  }

/* Sesiones donde el usuario fue invitado, NO asistió y la sesión ya finalizó */
  async getAbsentSessions(userId: number): Promise<Session[]> {
    return AppDataSource
      .getRepository(Session)
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.status',        'st')      // ← estado
      .leftJoinAndSelect('s.participants',  'sp')
      .leftJoinAndSelect('sp.user',         'u')
      .where('u.id = :uid',       { uid: userId })
      .andWhere('sp.attended = false')                // no asistió
      .andWhere('st.name = :fin', { fin: 'Finalizada' }) // sesión cerrada
      .orderBy('s.date', 'DESC')
      .getMany();
  }


  /* ────────────────── COMÚN ────────────────── */

  async getSessionsAndActasByRange(start: string, end: string): Promise<Session[]> {
    return AppDataSource
      .getRepository(Session)
      .find({
        where: { date: Between(new Date(start), new Date(end)) },
        relations: ['actas', 'status']
      });
  }

  async getActaById(id: number): Promise<Acta | null> {
    return AppDataSource
      .getRepository(Acta)
      .findOne({
        where: { id },
        relations: ['session', 'session.agendaItems', 'session.agendaItems.presenter', 'session.agendaItems.tasks']
      });
  }

}
