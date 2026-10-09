import { Request, Response } from 'express';
import { AppDataSource } from '../database/data-source';
import { Annotation } from '../model/Annotation';
import { AgendaItem } from '../model/AgendaItem';
import { User } from '../model/User';

export class AnnotationController {
  private static instance: AnnotationController;

  private constructor() {}

  static getInstance(): AnnotationController {
    if (!AnnotationController.instance) {
      AnnotationController.instance = new AnnotationController();
    }
    return AnnotationController.instance;
  }

  async createAnnotation(req: Request, res: Response): Promise<void> {
    const { content, pointId, authorId } = req.body;

    try {
      const repo = AppDataSource.getRepository(Annotation);
      const agendaItem = await AppDataSource.getRepository(AgendaItem).findOneBy({ id: pointId });
      const author = await AppDataSource.getRepository(User).findOneBy({ id: authorId });

      if (!agendaItem || !author) {
        res.status(400).json({ message: 'Datos inválidos' });
        return;
      }

      const annotation = repo.create({ content, agendaItem, author });
      await repo.save(annotation);
      res.status(201).json(annotation);
    } catch (error) {
      res.status(500).json({ message: 'Error creando anotación', error });
    }
  }

  async updateAnnotation(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const { content } = req.body;

    try {
      const repo = AppDataSource.getRepository(Annotation);
      const annotation = await repo.findOneBy({ id });

      if (!annotation) {
        res.status(404).json({ message: 'No encontrada' });
        return;
      }

      annotation.content = content;
      await repo.save(annotation);
      res.json(annotation);
    } catch (error) {
      res.status(500).json({ message: 'Error actualizando anotación', error });
    }
  }

  async deleteAnnotation(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);

    try {
      const repo = AppDataSource.getRepository(Annotation);
      const annotation = await repo.findOneBy({ id });

      if (!annotation) {
        res.status(404).json({ message: 'No encontrada' });
        return;
      }

      await repo.remove(annotation);
      res.status(200).json({ message: 'Anotación eliminada' });
    } catch (error) {
      res.status(500).json({ message: 'Error eliminando anotación', error });
    }
  }

  async getNotesByPoint(req: Request, res: Response): Promise<void> {
    const pointId = Number(req.params.pointId);

    try {
      const notes = await AppDataSource.getRepository(Annotation).find({
        where: { agendaItem: { id: pointId } },
        relations: ['author', 'agendaItem']
      });
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener anotaciones', error });
    }
  }
}
