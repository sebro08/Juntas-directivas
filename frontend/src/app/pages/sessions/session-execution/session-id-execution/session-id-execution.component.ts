import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {SessionService} from "../../../../core/services/session.service";
import {NgxSpinnerService} from "ngx-spinner";
import {ToastrService} from "ngx-toastr";
import {DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {FormControl, ReactiveFormsModule} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {Note} from "../../../../core/models/note";
import {Task} from "../../../../core/models/task";
import {NoteService} from "../../../../core/services/note.service";
import {Decision} from "../../../../core/models/decision";
import {DecisionService} from "../../../../core/services/decision.service";
import {MatOption} from "@angular/material/core";
import {MatSelect} from "@angular/material/select";
import {User} from "../../../../core/models/user";
import {UserService} from "../../../../core/services/user.service";
import {TaskService} from "../../../../core/services/task.service";
import {MatTabsModule} from "@angular/material/tabs";

@Component({
  selector: 'app-session-id-execution',
  imports: [
    NgClass,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    NgForOf,
    MatIconModule,
    MatOption,
    MatSelect,
    NgIf,
    MatTabsModule,
    DatePipe,
  ],
  templateUrl: './session-id-execution.component.html',
  styleUrl: './session-id-execution.component.css'
})
export class SessionIdExecutionComponent implements OnInit, OnDestroy {
  sessionId!: number;
  sessionDetails: any;
  sessionParticipants: any[] = [];
  sessionAgendaPoints: any[] = [];
  selectedAgendaPoint!: {idx: number, point: any};
  currentTime: string = '';
  intervalId: any;
  annotationControl = new FormControl('');
  resolutionControl = new FormControl('');
  assignmentControl = new FormControl('');
  assigneeControl = new FormControl('');
  currentUser: number = 0;
  users!: User[];
  activeTimer: any = null;
  pointStartTime: Date | null = null;
  elapsedTime: number = 0;
  timerColor: string = 'black';
  minutesElapsed: number = 0;
  secondsElapsed: number = 0;


  constructor(private route: ActivatedRoute,
              private sessionService: SessionService,
              private spinner: NgxSpinnerService,
              private toastr: ToastrService,
              private noteService: NoteService,
              private decisionService: DecisionService,
              private userService: UserService,
              private taskService: TaskService,
              private router: Router) {
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      this.currentUser = parsedUser.id
    }
    this.loadUsers();
  }

  ngOnInit() {
    this.sessionId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadSessionDetails();
    this.updateTime();
    this.intervalId = setInterval(() => {
      this.updateTime();
    }, 1000);
  }

  loadSessionDetails() {
      this.spinner.show();
      this.sessionService.getSessionById(this.sessionId).subscribe({
        next: (session) => {
          this.sessionDetails = session;
          this.sessionParticipants = session.participants || [];
          this.sessionAgendaPoints = session.agendaItems || [];
          this.selectedAgendaPoint = {idx: 0, point: this.sessionAgendaPoints[0] || null};

          // Inicia temporizador con la duración del primer punto si existe
          if (this.selectedAgendaPoint.point?.duration) {
            this.startAgendaTimer(this.selectedAgendaPoint.point.duration);
          }

          this.spinner.hide();
        },
      error: (error) => {
        this.spinner.hide();
        this.toastr.error(error);
      }
    });
  }

  updateTime() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  toggleAttendance(participant: any): void {
    const id = participant.id;
    const currentStatus = this.isAttended(participant);

    this.sessionService.updateAttendance(id, !currentStatus).subscribe({
      next: () => {
        participant.attended = !currentStatus;
      },
      error: () => {
        this.toastr.error('Error updating attendance');
      }
    });
  }

  isAttended(participant: any): boolean {
    return participant ? participant.attended : participant.attended;
  }

  goToNextPoint(): void {
    const currentIndex = this.selectedAgendaPoint.idx;
    if (currentIndex < this.sessionAgendaPoints.length - 1) {
      this.selectedAgendaPoint = {
        idx: currentIndex + 1,
        point: this.sessionAgendaPoints[currentIndex + 1]
      };
      this.startAgendaTimer(this.selectedAgendaPoint.point.duration);
    }
  }

  goToPreviousPoint(): void {
    const currentIndex = this.selectedAgendaPoint.idx;
    if (currentIndex > 0) {
      this.selectedAgendaPoint = {
        idx: currentIndex - 1,
        point: this.sessionAgendaPoints[currentIndex - 1]
      };
      this.startAgendaTimer(this.selectedAgendaPoint.point.duration);
    }
  }

  submitAnnotation() {
    const content = this.annotationControl.value;
    const pointId = this.selectedAgendaPoint?.point?.id;

    if (!content || !pointId) {
      this.toastr.warning('Debe ingresar una anotación y tener un punto de agenda seleccionado.');
      return;
    }

    const note: Partial<Note> = {
      pointId,
      content,
      createdBy: this.currentUser
    };

    this.noteService.createNote(note).subscribe({
      next: (savedNote) => {
        this.toastr.success('Anotación guardada correctamente');
        this.annotationControl.reset();
        this.loadSessionDetails();
      },
      error: (err) => {
        this.toastr.error('Ocurrió un error al guardar la anotación');
      }
    });  }

  submitResolution() {
    const agendaItemId = this.selectedAgendaPoint?.point?.id;
    const summary = this.resolutionControl.value;
    const createdById = this.currentUser;

    if (!agendaItemId || !summary) {
      this.toastr.warning('Debe completar todos los campos de la decisión.');
      return;
    }

    const decision: Partial<Decision> = {
      agendaItemId,
      summary,
      createdById
    };

    this.decisionService.createDecision(decision).subscribe({
      next: () => {
        this.toastr.success('Decisión registrada exitosamente');
        this.resolutionControl.reset();
        this.loadSessionDetails();
      },
      error: () => {
        this.toastr.error('Error al registrar la decisión');
      }
    });
  }

  submitAssignment() {
    const pointId = this.selectedAgendaPoint?.point?.id;
    const description = this.assignmentControl.value;
    const assignedToUserId = Number(this.assigneeControl.value);

    if (!pointId || !description || !assignedToUserId) {
      this.toastr.warning('Debe ingresar la tarea y seleccionar a la persona encargada.');
      return;
    }

    const task: Partial<Task> = {
      pointId,
      title: description,
      description,
      assignedToUserId,
      sessionId: this.sessionId
    };

    this.taskService.createTask(task).subscribe({
      next: () => {
        this.toastr.success('Tarea registrada exitosamente');
        this.assignmentControl.reset();
        this.assigneeControl.reset();
        this.loadSessionDetails();
      },
      error: () => {
        this.toastr.error('Error al registrar la tarea');
      }
    });
  }

  loadUsers() {
    this.spinner.show();
    this.userService.getUsers().subscribe({
      next: (users: User[]) => {
        this.users = users;
      },
      error: err => {
        this.toastr.error();
      },
      complete: () => {
        this.spinner.hide();
      }
    });
  }

  deleteDecision(id: number): void {
    if (!id) return;

    this.spinner.show();
    this.decisionService.deleteDecision(id).subscribe({
      next: () => {
        this.toastr.success('Decisión eliminada correctamente');
        this.selectedAgendaPoint.point.decisions = this.selectedAgendaPoint.point.decisions.filter((d: any) => d.id !== id);
      },
      error: () => {
        this.toastr.error('Error al eliminar la decisión');
      },
      complete: () => this.spinner.hide()
    });
  }

  get selectedPointLabel(): string {
    if (!this.selectedAgendaPoint || !this.selectedAgendaPoint.point) {
      return '';
    }

    return `Punto ${this.selectedAgendaPoint.idx + 1}: ${this.selectedAgendaPoint.point.title}`;
  }

  redirectToSummary(): void {
    const sessionId = this.sessionId;
    this.router.navigate(['/sessions/summary', sessionId]);
  }

  updateStatusAndExecute(statusId: number): void {
    this.spinner.show();
    this.sessionService.updateSessionStatus(this.sessionId, statusId).subscribe({
      next: () => {
        this.spinner.hide();
        this.toastr.success('Session status updated');
        this.redirectToSummary();
      },
      error: () => {
        this.spinner.hide();
        this.toastr.error('Failed to update session status');
      }
    });
  }

  updateVoteResult(result: number): void {
    const pointId = this.selectedAgendaPoint?.point.id;
    if (!pointId) return;

    this.spinner.show();
    this.sessionService.updateVoteResult(pointId, result).subscribe({
      next: () => {
        this.toastr.success('Resultado de votación actualizado');
        this.selectedAgendaPoint.point.voteResult = result;
      },
      error: () => {
        this.toastr.error('Error al actualizar el resultado de votación');
      },
      complete: () => this.spinner.hide()
    });
  }

  deleteAnnotation(noteId: number): void {
    if (!noteId) return;

    this.spinner.show();
    this.noteService.deleteNote(noteId).subscribe({
      next: () => {
        this.toastr.success('Anotación eliminada correctamente');
        this.selectedAgendaPoint.point.annotations = this.selectedAgendaPoint.point.annotations.filter((n: any) => n.id !== noteId);
      },
      error: () => {
        this.toastr.error('Error al eliminar la anotación');
      },
      complete: () => this.spinner.hide()
    });
  }

  deleteTask(taskId: number): void {
    if (!taskId) return;

    this.taskService.deleteTask(taskId).subscribe({
      next: () => {
        this.toastr.success('Tarea eliminada');
        this.loadSessionDetails();
      },
      error: () => {
        this.toastr.error('Error al eliminar la tarea');
      }
    });
  }

  startAgendaTimer(duration: number) {
    if (this.activeTimer) clearInterval(this.activeTimer);

    this.minutesElapsed = 0;
    this.secondsElapsed = 0;
    this.timerColor = 'black';

    this.activeTimer = setInterval(() => {
      this.secondsElapsed++;

      if (this.secondsElapsed >= 60) {
        this.minutesElapsed++;
        this.secondsElapsed = 0;
      }

      const totalSecondsPassed = this.minutesElapsed * 60 + this.secondsElapsed;
      const totalSecondsExpected = duration * 60;
      const secondsRemaining = totalSecondsExpected - totalSecondsPassed;

      if (secondsRemaining <= 0) {
        this.timerColor = 'red';
      } else if (secondsRemaining <= 300) {
        this.timerColor = 'goldenrod';
      } else {
        this.timerColor = 'black';
      }

    }, 1000);
  }

  trackByAgendaItemId(index: number, item: any): number {
    return item.id;
  }


  ngOnDestroy() {
    if (this.intervalId) {
      if (this.intervalId) clearInterval(this.intervalId);
      if (this.activeTimer) clearInterval(this.activeTimer);
      clearInterval(this.intervalId);
    }
  }
}
