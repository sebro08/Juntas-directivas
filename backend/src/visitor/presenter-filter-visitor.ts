import { Visitor } from './visitor';
import { Acta } from '../model/Acta';
import { Session } from '../model/Session';
import { AppDataSource } from '../database/data-source';

/**
 * Filtra actas donde el usuario es expositor de al menos un AgendaItem.
 */
export class PresenterFilterVisitor extends Visitor {
  private filtered: Acta[] = [];

  constructor(private readonly presenterId: number) {
    super();
  }

  /** Añade actas que cumplan la condición */
  visitActa(acta: Acta): void {
    const matches = acta.session?.agendaItems?.some(item => item.presenter?.id === this.presenterId);

    if (matches) {
      this.filtered.push(acta);
    }
  }

  /** No se necesita la lógica para sesiones (en este Visitor en concreto) */
  visitSession(session: Session): void {
    /* vacío intencionalmente */
  }

  /** Devuelve las actas filtradas tras el recorrido */
  getResult(): Acta[] {
    return this.filtered;
  }

  // ConsultationService.ts
  async getActasByPresenter(userId: number): Promise<Acta[]> {
    const repo = AppDataSource.getRepository(Acta);
    const actas = await repo.find({
      relations: [
        'session',
        'session.agendaItems',
        'session.agendaItems.presenter'
      ]
    });
    const v = new PresenterFilterVisitor(userId);
    actas.forEach(a => a.accept(v));
    return v.getResult(); // solo puntos donde es expositor
  }

}