// src/controller/ConsultationController.ts
import { Request, Response } from 'express';
import { ConsultationService } from '../service/consultation-service'; // ← corrige el path

export class ConsultationController {
  private static instance: ConsultationController;
  private service = new ConsultationService();

  static getInstance(): ConsultationController {
    if (!ConsultationController.instance) {
      ConsultationController.instance = new ConsultationController();
    }
    return ConsultationController.instance;
  }

  /* ---------- ADMIN ---------- */
  getInProgressSessions  = async (_: Request, res: Response) => res.json(await this.service.getInProgressSessions());
  getEditableAgendas     = async (_: Request, res: Response) => res.json(await this.service.getEditableAgendas());
  getUpcomingSessions    = async (_: Request, res: Response) => res.json(await this.service.getUpcomingSessions());

  /* ---------- MIEMBRO JD ---------- */
  getActasByPresenter    = async (req: Request, res: Response) => res.json(await this.service.getActasByPresenter(+req.params.id));
  getActasByResponsible  = async (req: Request, res: Response) => res.json(await this.service.getActasByResponsible(+req.params.id));
  getAbsentSessions      = async (req: Request, res: Response) => res.json(await this.service.getAbsentSessions(+req.params.id));

  /* ---------- AMBOS ---------- */
  getSessionsByRange     = async (req: Request, res: Response) => {
    const { start, end } = req.query as { start: string; end: string };
    res.json(await this.service.getSessionsAndActasByRange(start, end));
  };

  getActaById            = async (req: Request, res: Response) => res.json(await this.service.getActaById(+req.params.id));
}
