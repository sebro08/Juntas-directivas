import { Request, Response } from 'express';
import { AppDataSource } from '../database/data-source';
import { ExternalGuest } from '../model/ExternalGuest';
import { Session } from '../model/Session';

export class ExternalGuestController {
  private static instance: ExternalGuestController;

  private constructor() {}

  public static getInstance(): ExternalGuestController {
    if (!ExternalGuestController.instance) {
      ExternalGuestController.instance = new ExternalGuestController();
    }
    return ExternalGuestController.instance;
  }

  async createGuest(req: Request, res: Response) {
    const { name, email, sessionId } = req.body;
    try {
      const session = await AppDataSource.getRepository(Session).findOneBy({ id: sessionId });
      if (!session) return res.status(400).json({ message: 'Sesión no válida' });

      const guest = AppDataSource.getRepository(ExternalGuest).create({ name, email, session });
      await AppDataSource.getRepository(ExternalGuest).save(guest);
      res.status(201).json(guest);
    } catch (error) {
      res.status(500).json({ message: 'Error creando invitado', error });
    }
  }

  async getGuestsBySession(req: Request, res: Response) {
    const sessionId = Number(req.params.sessionId);
    try {
      const guests = await AppDataSource.getRepository(ExternalGuest).find({
        where: { session: { id: sessionId } },
        relations: ['session']
      });
      res.json(guests);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener invitados', error });
    }
  }
}
