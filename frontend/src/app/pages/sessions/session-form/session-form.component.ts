import { Component, OnInit } from '@angular/core';
import {FormArray,FormBuilder,FormGroup,ReactiveFormsModule,Validators} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {MatSelectModule} from '@angular/material/select';
import {JsonPipe,NgForOf,NgIf} from '@angular/common';
import {Modality} from '../../../core/models/modality';
import {SessionService} from '../../../core/services/session.service';
import {ToastrService} from 'ngx-toastr';
import {NgxSpinnerService} from 'ngx-spinner';
import {UserService} from '../../../core/services/user.service';
import {User} from '../../../core/models/user';
import {CdkDragDrop,DragDropModule} from '@angular/cdk/drag-drop';
import {VISITOR_USER} from '../../../core/shared/constants';
import {HttpClient} from '@angular/common/http';
import {MatCheckbox} from "@angular/material/checkbox";
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-session-form',
  imports: [
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    NgForOf,
    NgIf,
    DragDropModule,
    MatCheckbox,
  ],
  templateUrl: './session-form.component.html',
  styleUrl: './session-form.component.css'
})
export class SessionFormComponent implements OnInit {
  form: FormGroup;
  modalities: Modality[] = [];
  users: User[] = [];

  /** Modo edición */
  editId: number | null = null;
  isEditMode = false;

  /** Para la barra de progreso por cada upload */
  uploadInProgress: boolean[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private sessionService: SessionService,
    private userService: UserService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService
  ) {
    /* Formulario base */
    this.form = this.fb.group({
      title: ['', Validators.required],
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      modalityId: [null, Validators.required],
      participantIds: [[], Validators.required],
      agenda: this.fb.array([])
    });

    /* Al menos un punto de agenda por defecto */
    this.addAgendaPoint();
  }

 /* ---------------- getters ---------------- */
  get agenda(): FormArray      { return this.form.get('agenda') as FormArray; }
  get participants()           { return this.form.get('participantIds')?.value; }

  /* ---------------- ciclo de vida ---------------- */
  ngOnInit(): void {
    this.loadModalities();
    this.loadUsers();

    /** Detectar modo edición por query ?edit=ID */
    this.route.queryParams.subscribe(params => {
      if (params['edit']) {
        this.editId = +params['edit'];
        this.isEditMode = true;
        this.loadSessionData();
      }
    });
  }

  /* ---------------- cargar catálogo ---------------- */
  private loadUsers(): void {
    this.spinner.show();
    this.userService.getUsers().subscribe({
      next: (u) => this.users = u,
      error: () => this.toastr.error('Error cargando usuarios'),
      complete: () => this.spinner.hide()
    });
  }

  private loadModalities(): void {
    this.spinner.show();
    this.sessionService.getModalities().subscribe({
      next: (m) => this.modalities = m,
      error: () => this.toastr.error('Error cargando modalidades'),
      complete: () => this.spinner.hide()
    });
  }

  /* ---------------- cargar datos de la sesión (modo edición) ---------------- */
  private loadSessionData(): void {
    if (!this.editId) return;

    this.spinner.show();
    this.sessionService.getSessionById(this.editId).subscribe({
      next: (session) => {
        /* patch datos simples */
        this.form.patchValue({
          title        : session.title,
          date         : session.date,
          startTime    : session.timeStart,
          endTime      : session.timeEnd,
          modalityId   : session.modality?.id,
          participantIds: session.participants.map((p: any) => p.user.id)
        });

        /* cargar agenda */
        this.agenda.clear();
        session.agendaItems.forEach((item: any) => {
          this.agenda.push(this.fb.group({
            title        : [item.title, Validators.required],
            speakerId    : [item.presenter?.id || VISITOR_USER, Validators.required],
            duration     : [item.duration, [Validators.required, Validators.min(1)]],
            externalName : [item.externalPresenter?.name || ''],
            externalEmail: [item.externalPresenter?.email || ''],
            filePath     : [item.filePath || ''],
            requiresVote : [item.requiresVote]
          }));
        });

        this.spinner.hide();
      },
      error: () => {
        this.spinner.hide();
        this.toastr.error('Error cargando sesión');
        this.router.navigate(['/sessions']);
      }
    });
  }

  /* ---------------- agenda (add/remove/drag) ---------------- */
  addAgendaPoint(): void {
    this.agenda.push(this.fb.group({
      title        : ['', Validators.required],
      speakerId    : [null, Validators.required],
      duration     : ['', [Validators.required, Validators.min(1)]],
      externalName : [''],
      externalEmail: [''],
      filePath     : [''],
      requiresVote : [false]
    }));
  }

  removeAgendaPoint(idx: number): void { if (this.agenda.length > 1) this.agenda.removeAt(idx); }

  dropAgenda(ev: CdkDragDrop<FormGroup[]>) {
    const item = this.agenda.at(ev.previousIndex);
    this.agenda.removeAt(ev.previousIndex);
    this.agenda.insert(ev.currentIndex, item);
  }

  /* ---------------- subir archivo ---------------- */
  uploadFile(e: Event, i: number): void {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.uploadInProgress[i] = true;
    const fd = new FormData();
    fd.append('file', file);

    this.sessionService.uploadAgendaFile(fd).subscribe({
      next: res => {
        this.uploadInProgress[i] = false;
        this.agenda.at(i).get('filePath')?.setValue(res.filePath);
      },
      error: err => {
        this.uploadInProgress[i] = false;
        this.toastr.error(err.error?.message || 'Error al subir archivo');
      }
    });
  }

  /* ---------------- guardar ---------------- */
  save(): void {
    if (this.form.invalid) return;

    this.spinner.show();
    const payload = this.form.value;

    const req$ = this.isEditMode && this.editId
      ? this.sessionService.updateSession(this.editId, payload)   // 👈 PUT
      : this.sessionService.createSession(payload);               // 👈 POST

    req$.subscribe({
      next   : () => this.toastr.success(this.isEditMode ? 'Sesión actualizada' : 'Sesión creada'),
      error  : () => this.toastr.error('Error al guardar'),
      complete: () => {
        this.spinner.hide();
        this.router.navigate(['/sessions']);
      }
    });
  }

  /* ---------------- cancelar ---------------- */
  cancel(): void { this.router.navigate(['/sessions']); }

  /* ---------------- util ---------------- */
  goBack(): void { this.router.navigate(['/sessions']); }

  protected readonly VISITOR_USER = VISITOR_USER;
}