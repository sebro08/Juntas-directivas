// src/controller/AgendaItemController.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../database/data-source';
import { CreateAgendaItemDto } from '../dto/create-agenda-item.dto';
import { AgendaItemFactory } from '../utils/AgendaItemFactory';
import { User } from '../model/User';
import { Session } from '../model/Session';
import { AgendaItem } from '../model/AgendaItem';

class AgendaItemController {
  async create(req: Request, res: Response) {
    try {
      const dto = req.body as CreateAgendaItemDto;
      const agendaRepo = AppDataSource.getRepository(AgendaItem);

      // Obtener presentador
      const presenter = await AppDataSource.getRepository(User).findOneByOrFail({ id: dto.presenterId });

      // Obtener sesión
      const session = await AppDataSource.getRepository(Session).findOneByOrFail({ id: dto.sessionId });

      // Crear vía Factory
      const item = AgendaItemFactory.create({
        hasAnnotations: dto.hasAnnotations,
        hasDecisions: dto.hasDecisions,
        hasTasks: dto.hasTasks,
        isApproval: dto.isApproval ?? false
      });

      // Asignar propiedades comunes
      Object.assign(item, {
        title: dto.title,
        duration: dto.duration,
        presenter,
        session
      });

      // Guardar y ejecutar lógica de negocio adicional
      await agendaRepo.save(item);
      item.handle();

      return res.status(201).json(item);
    } catch (err: any) {
      console.error('Error creando agendaItem:', err);
      return res.status(400).json({ error: err.message });
    }
  }
}

export default new AgendaItemController();
