import express from 'express';
import { authenticateJWT } from '../middleware/authMiddleware';

import { fileRouter } from '../controller/FileController';
import AgendaItemController from '../controller/AgendaItemController';

// Singleton Controllers
import { UserController } from '../controller/UserController';
import { SettingsController } from '../controller/SettingsController';
import { TaskController } from '../controller/TaskController';
import { AnnotationController } from '../controller/AnnotationController';
import { DecisionController } from '../controller/DecisionController';
import { ExternalGuestController } from '../controller/ExternalGuestController';
import { RoleController } from '../controller/RoleController';
import { ModalityController } from '../controller/ModalityController';
import { SessionController } from '../controller/SessionController';
import { NotificationController } from '../controller/NotificationController';
import { ConsultationController } from '../controller/ConsultationController';

const router = express.Router();

// Singleton instances
const userController = UserController.getInstance();
const settingsController = SettingsController.getInstance();
const modalityController = ModalityController.getInstance();
const roleController = RoleController.getInstance();
const annotationController = AnnotationController.getInstance();
const taskController = TaskController.getInstance();
const decisionController = DecisionController.getInstance();
const sessionController = SessionController.getInstance();
const guestController = ExternalGuestController.getInstance();
const notificationController = NotificationController.getInstance();
const consultationController = ConsultationController.getInstance();

// Usuarios
router.get('/users', authenticateJWT, userController.getUsers.bind(userController));
router.delete('/users/:id', authenticateJWT, userController.deleteUser.bind(userController));
router.put('/users/:id', authenticateJWT, userController.updateUserRole.bind(userController));
router.get('/users/board/:id', authenticateJWT, userController.getBoardMember.bind(userController));

// Configuración
router.get('/settings', authenticateJWT, settingsController.getSettings.bind(settingsController));
router.put('/settings', authenticateJWT, settingsController.updateSettings.bind(settingsController));

// Modalidades
router.get('/modalities', authenticateJWT, modalityController.getModalities.bind(modalityController));

// Roles
router.get('/roles', authenticateJWT, roleController.getRoles.bind(roleController));

// Sesiones
router.get('/sessions', authenticateJWT, sessionController.getSessions.bind(sessionController));
router.post('/sessions/create', authenticateJWT, sessionController.createSession.bind(sessionController));
router.get('/session/execution', authenticateJWT, sessionController.getTodaySessions.bind(sessionController));
router.get('/sessions/execution/:id/details', authenticateJWT, sessionController.getSessionDetails.bind(sessionController));
router.put('/session-participants/:id/attendance', authenticateJWT, sessionController.updateParticipantAttendance.bind(sessionController));
router.put('/sessions/:id/status', authenticateJWT, sessionController.updateSessionStatus.bind(sessionController));
router.put('/agenda-items/:id/vote-result', authenticateJWT, sessionController.updateVoteResult.bind(sessionController));
router.post('/sessions/:id/send-invitation', authenticateJWT, sessionController.sendInvitation.bind(sessionController));
router.put('/sessions/:id', authenticateJWT, sessionController.updateSession.bind(sessionController));

// Tareas
router.post('/tasks/create', authenticateJWT, taskController.createTask.bind(taskController));
router.put('/tasks/:id', authenticateJWT, taskController.updateTask.bind(taskController));
router.get('/points/:pointId/tasks', authenticateJWT, taskController.getTasksByPoint.bind(taskController));
router.delete('/tasks/:id', authenticateJWT, taskController.deleteTask.bind(taskController));

// Anotaciones
router.post('/notes/create', authenticateJWT, annotationController.createAnnotation.bind(annotationController));
router.put('/notes/:id', authenticateJWT, annotationController.updateAnnotation.bind(annotationController));
router.get('/points/:pointId/notes', authenticateJWT, annotationController.getNotesByPoint.bind(annotationController));
router.delete('/notes/:id', authenticateJWT, annotationController.deleteAnnotation.bind(annotationController));

// Decisiones
router.post('/decisions/create', authenticateJWT, decisionController.createDecision.bind(decisionController));
router.get('/points/:pointId/decisions', authenticateJWT, decisionController.getDecisionsByPoint.bind(decisionController));
router.delete('/decisions/:id', authenticateJWT, decisionController.deleteDecision.bind(decisionController));

// Invitados externos
router.post('/guests/create', authenticateJWT, guestController.createGuest.bind(guestController));
router.get('/sessions/:sessionId/guests', authenticateJWT, guestController.getGuestsBySession.bind(guestController));

// Tipo de AgendaItem
router.post('/agenda-items', authenticateJWT, AgendaItemController.create);

// Subir archivo
router.use('/files', fileRouter);

// Descargar PDF
router.get('/sessions/:id/export', authenticateJWT, sessionController.exportSessionPdf.bind(sessionController));

// Subir archivo
router.use('/files', fileRouter);

// Notificaciones
router.get('/notifications/:email', authenticateJWT, notificationController.getNotifications.bind(notificationController));
router.post('/notifications', authenticateJWT, notificationController.createNotification.bind(notificationController)); 
router.patch('/notifications/:id/read', authenticateJWT, notificationController.markAsRead.bind(notificationController));
router.delete('/notifications/:id', authenticateJWT, notificationController.deleteNotification.bind(notificationController));
router.delete('/notifications/clear/:email', authenticateJWT, notificationController.clearNotifications.bind(notificationController));
router.post('/notifications/test-template', authenticateJWT, notificationController.testTemplateNotification.bind(notificationController));



// VISITOR
// Admin only
router.get('/consultation/sessions/in-progress', authenticateJWT, consultationController.getInProgressSessions);
// Ejemplo: http://localhost:3000/api/consultation/sessions/in-progress
router.get('/consultation/sessions/editable-agendas', authenticateJWT, consultationController.getEditableAgendas);
// Ejemplo: http://localhost:3000/api/consultation/sessions/editable-agendas
router.get('/consultation/sessions/upcoming', authenticateJWT, consultationController.getUpcomingSessions);
// Ejemplo: http://localhost:3000/api/consultation/sessions/upcoming

// MIEMBRO JD only
router.get('/consultation/actas/presenter/:id', authenticateJWT, consultationController.getActasByPresenter);
// Ejemplo: http://localhost:3000/api/consultation/actas/presenter/10003 (id del miembro)
router.get('/consultation/actas/responsible/:id', authenticateJWT, consultationController.getActasByResponsible);
// Ejemplo: http://localhost:3000/api/consultation/actas/responsible/10003 (id del miembro)
router.get('/consultation/sessions/absent/:id', authenticateJWT, consultationController.getAbsentSessions);
// Ejemplo: http://localhost:3000/api/consultation/sessions/absent/10003 (id del miembro)

// AMBOS
router.get('/consultation/sessions/range', authenticateJWT, consultationController.getSessionsByRange);
// Ejemplo: http://localhost:3000/api/consultation/sessions/range?start=2024-01-01&end=2025-12-31
router.get('/consultation/actas/:id', authenticateJWT, consultationController.getActaById);
// Ejemplo: http://localhost:3000/api/consultation/actas/1 (id correspondiente)

export default router;

