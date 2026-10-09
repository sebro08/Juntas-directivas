import { Request, Response } from 'express';
import { AppDataSource } from '../database/data-source';
import { Task } from '../model/Task';
import { User } from '../model/User';
import { TaskStatus } from '../model/taskStatus';
import { Session } from '../model/Session';

export class TaskController {
  private static instance: TaskController;

  private constructor() {}

  static getInstance(): TaskController {
    if (!TaskController.instance) {
      TaskController.instance = new TaskController();
    }
    return TaskController.instance;
  }

  async createTask(req: Request, res: Response): Promise<void> {
    const { description, dueDate, assignedToId, sessionId, statusId } = req.body;
    try {
      const taskRepo = AppDataSource.getRepository(Task);
      const assignedTo = await AppDataSource.getRepository(User).findOneBy({ id: assignedToId });
      const session = await AppDataSource.getRepository(Session).findOneBy({ id: sessionId });

      if (!assignedTo || !session) {
        res.status(400).json({ message: 'Datos inválidos' });
        return;
      }

      const task = taskRepo.create({
        description,
        dueDate,
        assignedTo,
        session,
        status: { id: statusId ?? 1 }
      });

      await taskRepo.save(task);
      res.status(201).json(task);
    } catch (error) {
      res.status(500).json({ message: 'Error creando tarea', error });
    }
  }

  async updateTask(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const { description, dueDate, assignedToId, statusId } = req.body;

    try {
      const repo = AppDataSource.getRepository(Task);
      const task = await repo.findOne({ where: { id }, relations: ['assignedTo', 'status'] });
      if (!task) {
        res.status(404).json({ message: 'Tarea no encontrada' });
        return;
      }

      task.description = description ?? task.description;
      task.dueDate = dueDate ?? task.dueDate;

      if (assignedToId) {
        const user = await AppDataSource.getRepository(User).findOneBy({ id: assignedToId });
        if (user) task.assignedTo = user;
      }

      if (statusId) {
        const status = await AppDataSource.getRepository(TaskStatus).findOneBy({ id: statusId });
        if (status) task.status = status;
      }

      await repo.save(task);
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: 'Error actualizando tarea', error });
    }
  }

  async deleteTask(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);

    try {
      const repo = AppDataSource.getRepository(Task);
      const task = await repo.findOneBy({ id });

      if (!task) {
        res.status(404).json({ message: 'No encontrada' });
        return;
      }

      await repo.remove(task);
      res.status(200).json({ message: 'Tarea eliminada' });
    } catch (error) {
      res.status(500).json({ message: 'Error eliminando tarea', error });
    }
  }

  async getTasksByPoint(req: Request, res: Response): Promise<void> {
    const pointId = Number(req.params.pointId);

    try {
      const repo = AppDataSource.getRepository(Task);
      const tasks = await repo.find({
        where: { session: { id: pointId } },
        relations: ['assignedTo', 'status', 'session']
      });
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener tareas', error });
    }
  }
}
