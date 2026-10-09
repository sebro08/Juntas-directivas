import { Request, Response } from 'express';
import { AppDataSource } from '../database/data-source';
import { Decision } from '../model/Decision';
import { AgendaItem } from '../model/AgendaItem';
import { User } from '../model/User';

export class DecisionController {
  private static instance: DecisionController;

  private constructor() {}

  public static getInstance(): DecisionController {
    if (!DecisionController.instance) {
      DecisionController.instance = new DecisionController();
    }
    return DecisionController.instance;
  }

  async createDecision(req: Request, res: Response): Promise<void> {
    const { summary, result, agendaItemId, createdById, assignedToId } = req.body;

    try {
      const agendaItem = await AppDataSource.getRepository(AgendaItem).findOneBy({ id: agendaItemId });
      const createdBy = await AppDataSource.getRepository(User).findOneBy({ id: createdById });

      if (!agendaItem || !createdBy) {
        res.status(400).json({ message: 'Datos inválidos' });
        return;
      }

      const decision = AppDataSource.getRepository(Decision).create({
        summary,
        result: summary,
        agendaItem,
        createdBy,
      });

      await AppDataSource.getRepository(Decision).save(decision);
      res.status(201).json(decision);
    } catch (error) {
      res.status(500).json({ message: 'Error creando decisión', error });
    }
  }

  async getDecisionsByPoint(req: Request, res: Response): Promise<void> {
    const pointId = Number(req.params.pointId);
    try {
      const decisions = await AppDataSource.getRepository(Decision).find({
        where: { agendaItem: { id: pointId } },
        relations: ['agendaItem', 'createdBy', 'assignedTo']
      });
      res.json(decisions);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener decisiones', error });
    }
  }

  async deleteDecision(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);

    try {
      const repo = AppDataSource.getRepository(Decision);
      const decision = await repo.findOneBy({ id });

      if (!decision) {
        res.status(404).json({ message: 'Decisión no encontrada' });
        return;
      }

      await repo.remove(decision);
      res.status(200).json({ message: 'Decisión eliminada' });
    } catch (error) {
      res.status(500).json({ message: 'Error eliminando decisión', error });
    }
  }
}
