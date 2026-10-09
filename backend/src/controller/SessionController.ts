import { Request, Response } from 'express';
import { AppDataSource } from '../database/data-source';
import { sendMail } from '../utils/mailer';
import { Modality } from '../model/Modality';
import { Session } from "../model/Session";
import { User } from "../model/User";
import { SessionStatus } from "../model/SessionStatus";
import { AgendaItem } from "../model/AgendaItem";
import { ExternalGuest } from "../model/ExternalGuest";
import { SessionParticipant } from "../model/SessionParticipant";
import { Between, In } from "typeorm";
import { AgendaItemFactory } from '../utils/AgendaItemFactory';
import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';


export class SessionController {
    private static instance: SessionController;

    private constructor() {}

    public static getInstance(): SessionController {
        if (!SessionController.instance) {
            SessionController.instance = new SessionController();
        }
        return SessionController.instance;
    }

    async getModalities(req: Request, res: Response) {
        const modalityRepo = AppDataSource.getRepository(Modality);

        try {
            const modalities = await modalityRepo.find();
            res.json(modalities);
        } catch (error) {
            console.error('Error fetching modalities:', error);
            res.status(500).json({ message: 'Error fetching modalities' });
        }
    }

    async createSession(req: Request, res: Response) {
        const {
            title,
            date,
            startTime,
            endTime,
            modalityId,
            participantIds,
            agenda
        } = req.body;

        try {
            const sessionRepo = AppDataSource.getRepository(Session);
            const userRepo = AppDataSource.getRepository(User);
            const modalityRepo = AppDataSource.getRepository(Modality);
            const statusRepo = AppDataSource.getRepository(SessionStatus);
            const agendaRepo = AppDataSource.getRepository(AgendaItem);
            const guestRepo = AppDataSource.getRepository(ExternalGuest);
            const participantRepo = AppDataSource.getRepository(SessionParticipant);

            const modality = await modalityRepo.findOneByOrFail({ id: modalityId });
            const status = await statusRepo.findOneByOrFail({ id: 1 });
            const createdBy = await userRepo.findOneByOrFail({ id: 1 });
            const [year, month, day] = date.split('T')[0].split('-').map(Number);
            const dateOnly = new Date(year, month - 1, day);

            const session = sessionRepo.create({
                title,
                date: dateOnly,
                timeStart: startTime,
                timeEnd: endTime,
                filePath: '',
                modality,
                status,
                createdBy,
                lastUpdatedBy: createdBy
            });

            await sessionRepo.save(session);

            // Agregar participantes internos
            for (const userId of participantIds) {
                const user = await userRepo.findOneByOrFail({ id: userId });
                const sp = participantRepo.create({ session, user });
                await participantRepo.save(sp);
            }

            for (const item of agenda) {
                let agendaItem = agendaRepo.create({
                    title: item.title,
                    duration: item.duration,
                    requiresVote: item.requiresVote ?? false,
                    voteResult: item.voteResult ?? 0,
                    filePath: item.filePath ?? '',
                    session
                });

                if (item.speakerId === 9999) {
                    const guest = guestRepo.create({
                        name: item.externalName,
                        email: item.externalEmail,
                        session
                    });
                    await guestRepo.save(guest);
                    await participantRepo.save(participantRepo.create({ session, externalGuest: guest }));
                    agendaItem.externalPresenter = guest;
                } else {
                    agendaItem.presenter = await userRepo.findOneByOrFail({ id: item.speakerId });
                }

                await agendaRepo.save(agendaItem);
            }

            return res.status(201).json({ message: 'Session created', sessionId: session.id });
        } catch (error: any) {
            console.error('Error creating session:', error);
            return res.status(500).json({ message: 'Error creating session', error: error.message });
        }
    }

    async getSessions(req: Request, res: Response) {
        try {
            const sessions = await AppDataSource.getRepository(Session).find({
                relations: ['status'],
                select: {
                    id: true,
                    title: true,
                    date: true,
                    timeStart: true,
                    status: {
                        id: true,
                        name: true
                    }
                },
                order: { id: 'DESC' }
            });

            res.json(sessions);
        } catch (error) {
            console.error('Error fetching sessions:', error);
            res.status(500).json({ message: 'Error fetching sessions' });
        }
    }

    async getTodaySessions(req: Request, res: Response) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);

            const sessions = await AppDataSource.getRepository(Session).find({
                where: {
                    status: { id: In([1, 2]) },
                    date: Between(today, tomorrow)
                },
                relations: ['status'],
                select: {
                    id: true,
                    title: true,
                    date: true,
                    timeStart: true,
                    status: {
                        id: true,
                        name: true
                    }
                },
                order: { timeStart: 'ASC' }
            });

            res.json(sessions);
        } catch (error) {
            console.error('Error fetching today’s sessions:', error);
            res.status(500).json({ message: 'Error fetching today’s sessions' });
        }
    }

    async getSessionDetails(req: Request, res: Response) {
        const sessionId = parseInt(req.params.id);
        if (isNaN(sessionId)) {
            return res.status(400).json({ message: 'Invalid session ID' });
        }

        try {
            const session = await AppDataSource.getRepository(Session).findOne({
                where: { id: sessionId },
                relations: [
                    'modality',
                    'status',
                    'createdBy',
                    'lastUpdatedBy',
                    'participants.user',
                    'participants.externalGuest',
                    'agendaItems.presenter',
                    'agendaItems.externalPresenter',
                    'agendaItems.annotations',
                    'agendaItems.decisions',
                    'tasks',
                    'tasks.assignedTo'
                ]
            });

            if (!session) {
                return res.status(404).json({ message: 'Session not found' });
            }

            return res.json(session);
        } catch (error) {
            console.error('Error fetching session:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    async updateParticipantAttendance(req: Request, res: Response) {
        const participantId = parseInt(req.params.id);
        const { attended } = req.body;

        if (isNaN(participantId)) {
            return res.status(400).json({ message: 'Invalid participant ID' });
        }

        try {
            const repo = AppDataSource.getRepository(SessionParticipant);
            const participant = await repo.findOneOrFail({
                where: { id: participantId },
                relations: ['user', 'externalGuest']
            });

            participant.attended = attended;
            await repo.save(participant);

            return res.status(200).json({ message: 'Attendance updated successfully' });
        } catch (error) {
            console.error('Error updating attendance:', error);
            return res.status(500).json({ message: 'Failed to update attendance' });
        }
    }

    async sendInvitation(req: Request, res: Response) {
        const sessionId = parseInt(req.params.id);

        try {
            const sessionRepo = AppDataSource.getRepository(Session);
            const agendaRepo = AppDataSource.getRepository(AgendaItem);
            const participantRepo = AppDataSource.getRepository(SessionParticipant);

            const session = await sessionRepo.findOne({
                where: { id: sessionId },
                relations: ['modality', 'status']
            });

            if (!session) return res.status(404).json({ message: 'Sesión no encontrada' });

            const sessionDate = new Date(session.date);
            const fechaFormateada = sessionDate.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            const agenda = await agendaRepo.find({
                where: { session: { id: sessionId } },
                relations: ['presenter', 'externalPresenter']
            });

            const participants = await participantRepo.find({
                where: { session: { id: sessionId } },
                relations: ['user', 'externalGuest']
            });

            for (const participant of participants) {
                const toEmail = participant.user?.email || participant.externalGuest?.email;
                if (!toEmail) continue;

                if (participant.user) {
                    const agendaHtml = agenda.map(item => {
                        const expositor = item.presenter
                            ? `${item.presenter.firstName} ${item.presenter.lastName}`
                            : item.externalPresenter?.name || 'N/A';
                        const archivoNombre = item.filePath ? ` <em>(Archivo: ${item.filePath.split('/').pop()})</em>` : '';
                        return `<li><strong>${item.title}</strong> – ${item.duration} min – por ${expositor}${archivoNombre}</li>`;
                    }).join('');

                    const htmlInternal = `
                        <p>Estimado/a participante,</p>
                        <p>Está cordialmente invitado/a a la sesión <strong>${session.title}</strong>.</p>
                        <p><strong>Fecha:</strong> ${fechaFormateada}<br>
                        <strong>Hora:</strong> ${session.timeStart}<br>
                        <strong>Modalidad:</strong> ${session.modality.name}</p>
                        <p><strong>Agenda:</strong></p>
                        <ul>${agendaHtml}</ul>
                    `;

                    await sendMail({
                        to: toEmail,
                        subject: `Invitación a la sesión: ${session.title}`,
                        html: htmlInternal,
                        attachments: agenda
                        .filter(item => item.filePath)
                        .map(item => {
                            const filename = item.filePath.split('/').pop() || 'archivo-adjunto.pdf';

                            const absolutePath = path.resolve(__dirname, '../../uploads/agenda', filename);

                            if (!fs.existsSync(absolutePath)) {
                            console.warn(`Archivo no encontrado para adjuntar: ${absolutePath}`);
                            }

                            return {
                            filename,
                            path: absolutePath
                            };
                        })
                        });
                } else if (participant.externalGuest) {
                    const htmlExternal = `
                        <p>Estimado/a invitado/a,</p>
                        <p>Está cordialmente invitado/a a la sesión <strong>${session.title}</strong>.</p>
                        <p><strong>Fecha:</strong> ${fechaFormateada}<br>
                        <strong>Hora:</strong> ${session.timeStart}</p>
                        <p>Por favor, asista puntualmente a la hora indicada.</p>
                    `;

                    await sendMail({
                        to: toEmail,
                        subject: `Invitación a la sesión: ${session.title}`,
                        html: htmlExternal
                    });
                }
            }

            return res.status(200).json({ message: 'Convocatorias enviadas exitosamente' });
        } catch (error) {
            console.error('Error al enviar convocatoria:', error);
            return res.status(500).json({ message: 'Error al enviar convocatoria', error });
        }
    }

    async updateSessionStatus(req: Request, res: Response) {
        const sessionId = parseInt(req.params.id);
        const { statusId } = req.body;

        if (isNaN(sessionId) || isNaN(statusId)) {
            return res.status(400).json({ message: 'Invalid session ID or status ID' });
        }

        try {
            const sessionRepo = AppDataSource.getRepository(Session);
            const statusRepo = AppDataSource.getRepository(SessionStatus);

            const session = await sessionRepo.findOneBy({ id: sessionId });
            if (!session) return res.status(404).json({ message: 'Session not found' });

            const newStatus = await statusRepo.findOneBy({ id: statusId });
            if (!newStatus) return res.status(404).json({ message: 'Status not found' });

            session.status = newStatus;
            await sessionRepo.save(session);

            return res.status(200).json({ message: 'Session status updated successfully', status: newStatus });
        } catch (error) {
            console.error('Error updating session status:', error);
            return res.status(500).json({ message: 'Failed to update session status' });
        }
    }

    async updateVoteResult(req: Request, res: Response) {
        const agendaItemId = parseInt(req.params.id);
        const { voteResult } = req.body;

        if (![0, 1, 2].includes(voteResult)) {
            return res.status(400).json({ message: 'Invalid vote result value. Must be 0, 1, or 2.' });
        }

        try {
            const agendaRepo = AppDataSource.getRepository(AgendaItem);
            const agendaItem = await agendaRepo.findOneBy({ id: agendaItemId });

            if (!agendaItem) {
                return res.status(404).json({ message: 'Agenda item not found' });
            }

            agendaItem.voteResult = voteResult;
            await agendaRepo.save(agendaItem);

            return res.status(200).json({ message: 'Vote result updated successfully', agendaItem });
        } catch (error) {
            console.error('Error updating vote result:', error);
            return res.status(500).json({ message: 'Error updating vote result', error });
        }
    }

async updateSession(req: Request, res: Response) {
  const sessionId = parseInt(req.params.id);
  const updatedData = req.body;

  try {
    const sessionRepo = AppDataSource.getRepository(Session);
    const session = await sessionRepo.findOne({
      where: { id: sessionId },
      relations: ['agendaItems', 'participants', 'modality'],
    });

    if (!session) {
      return res.status(404).json({ message: 'Sesión no encontrada' });
    }

    // Actualiza propiedades
    session.title = updatedData.title;
    session.date = updatedData.date;
    session.timeStart = updatedData.startTime;
    session.timeEnd = updatedData.endTime;

    // Si modalityId viene por separado
    if (updatedData.modalityId) {
      const modality = await AppDataSource.getRepository(Modality).findOneBy({ id: updatedData.modalityId });
      session.modality = modality!;
    }

    // Reasignar participantes
    if (updatedData.participantIds) {
      const userRepo = AppDataSource.getRepository(User);
      const participants = await userRepo.findByIds(updatedData.participantIds);
      session.participants = participants.map(user => {
        const sp = new SessionParticipant();
        sp.user = user;
        return sp;
      });
    }

    // Agenda (simplificada: podrías borrar y reinsertar si es necesario)
    if (updatedData.agenda) {
      session.agendaItems = updatedData.agenda.map((item: any) => ({
        title: item.title,
        duration: item.duration,
        requiresVote: item.requiresVote || false,
        externalPresenter: item.speakerId === -1 ? {
          name: item.externalName,
          email: item.externalEmail
        } : null,
        presenter: item.speakerId !== -1 ? { id: item.speakerId } : null,
        filePath: item.filePath || '',
      }));
    }

    await sessionRepo.save(session);

    return res.json({ message: 'Sesión actualizada correctamente' });
  } catch (err) {
    console.error('[UpdateSession Error]', err);
    return res.status(500).json({ message: 'Error al actualizar la sesión' });
  }
}


async exportSessionPdf(req: Request, res: Response) {
  const sessionId = parseInt(req.params.id);
  if (isNaN(sessionId)) return res.status(400).json({ message: 'ID inválido' });

  try {
    const sessionRepo = AppDataSource.getRepository(Session);
    const agendaRepo = AppDataSource.getRepository(AgendaItem);

    const session = await sessionRepo.findOne({
      where: { id: sessionId },
      relations: ['modality', 'status']
    });

    if (!session) {
      return res.status(404).json({ message: 'Sesión no encontrada' });
    }

    const agenda = await agendaRepo.find({
      where: { session: { id: sessionId } },
      relations: ['presenter', 'externalPresenter', 'annotations', 'decisions', 'tasks']
    });

    const sessionDate = session.date ? new Date(session.date) : null;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="session_${session.id}.pdf"`);

    const doc = new PDFDocument();

    doc.on('error', (err) => {
      console.error('Error en PDF stream:', err);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error generando PDF' });
      }
    });

    doc.pipe(res);

    // Encabezado general
    doc.fontSize(20).text(`Sesión: ${session.title}`, { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(`Fecha: ${sessionDate ? sessionDate.toLocaleDateString() : 'N/A'}`);
    doc.text(`Hora de inicio: ${session.timeStart}`);
    doc.text(`Modalidad: ${session.modality.name}`);
    doc.moveDown();

    // Agenda
    doc.fontSize(16).text('Agenda:', { underline: true });
    doc.moveDown();

    for (const item of agenda) {
      // Título del punto
      doc
        .fontSize(14)
        .fillColor('black')
        .text(`• ${item.title} (${item.duration} minutos)`, { underline: true });

      // Expositor
      const expositor = item.presenter
        ? `${item.presenter.firstName} ${item.presenter.lastName}`
        : item.externalPresenter?.name || 'N/A';
      doc.fontSize(12).fillColor('black').text(`Expositor: ${expositor}`);

      // Estilo por tipo de punto
      if (item.decisions?.length > 0) {
        doc.moveDown(0.5)
          .fillColor('#1E90FF') // Azul fuerte
          .font('Helvetica-Bold')
          .text('Punto con decisiones', { indent: 20 });
        
        // Lista de decisiones
        item.decisions.forEach((d, i) => {
        doc.fontSize(11).fillColor('black').font('Helvetica').text(`- Decisión ${i + 1}: ${d.summary}`);
        });

      } else if (item.tasks?.length > 0) {
        doc.moveDown(0.5)
          .fillColor('#228B22') // Verde
          .font('Helvetica-Bold')
          .text('Punto con tareas', { indent: 20 });

        // Lista de tareas
        item.tasks.forEach((t, i) => {
          doc.fontSize(11).fillColor('black').font('Helvetica').text(`     - Tarea ${i + 1}: ${t.description}`);
        });
      } else if (item.annotations?.length > 0) {
        doc.moveDown(0.5)
          .fillColor('#FF8C00') // Naranja oscuro
          .font('Helvetica-Bold')
          .text('Punto con anotaciones', { indent: 20 });

        // Lista de anotaciones
        item.annotations.forEach((a, i) => {
          doc.fontSize(11).fillColor('black').font('Helvetica').text(`     - Nota ${i + 1}: ${a.content}`);
        });
      } else {
        doc.moveDown(0.5)
          .fillColor('#808080') // Gris
          .font('Helvetica-Bold')
          .text('🔸 Punto informativo', { indent: 20 });
      }

      doc.moveDown(1); // Espaciado entre puntos
    }

    doc.end();

  } catch (error) {
    console.error('Error al exportar PDF:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error al generar el PDF' });
    }
  }
}
}
