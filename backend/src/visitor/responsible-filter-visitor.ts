import { Visitor } from './visitor';
import { Acta } from '../model/Acta';
import { Session } from '../model/Session';
import { AppDataSource } from '../database/data-source';

/**
 * Filtra actas donde el usuario aparece como responsable de un punto de fondo.
 */
export class ResponsibleFilterVisitor extends Visitor {
  private filtered: Acta[] = [];

  constructor(private readonly userId: number) {
    super();
  }

  visitActa(acta: Acta): void {
    const matches = acta.session?.agendaItems?.some(item => item.tasks?.some(t => t.assignedTo?.id === this.userId));

    if (matches) {
      this.filtered.push(acta);
    }
  }

  visitSession(session: Session): void {/* No se usa ya que se asigna como punto
    las tareas pertenecen a los puntos y no a la sesion */}

  getResult(): Acta[] {
    return this.filtered;
  }

  async getActasByResponsible(userId: number): Promise<Acta[]> {
    const repo = AppDataSource.getRepository(Acta);
    const actas = await repo.find({
      relations: [
        'session',
        'session.agendaItems',
        'session.agendaItems.tasks',
        'session.agendaItems.tasks.assignedTo'
      ]
    });
    const v = new ResponsibleFilterVisitor(userId);
    actas.forEach(a => a.accept(v));
    return v.getResult(); // solo puntos con tareas asignadas a ese usuario
  }

}