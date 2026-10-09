import { Component, ViewChild, WritableSignal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTabsModule, MatTabChangeEvent } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

import { Observable, of } from 'rxjs';
import { ConsultationService } from '../../core/services/consultation.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

import { Session } from '../../core/models/session';
import { Acta } from '../../core/models/acta';

type Row = Session | Acta;
type Rows = Row[];

type Mode =
  | 'admin-inprogress'
  | 'admin-editable'
  | 'admin-upcoming'
  | 'jd-presenter'
  | 'jd-responsible'
  | 'jd-absent';

@Component({
  standalone: true,
  selector: 'app-consultation',
  templateUrl: './consultation.component.html',
  styleUrls: ['./consultation.component.css'],
  imports: [
    CommonModule, FormsModule, RouterModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatTabsModule, MatFormFieldModule, MatInputModule,
    MatIconModule, MatButtonModule
  ]
})
export class ConsultationComponent {

  /* ---------------- tabla ---------------- */
  displayedColumns = ['id', 'title', 'date', 'extra'];
  dataSource: WritableSignal<MatTableDataSource<Row>> =
    signal(new MatTableDataSource<Row>([]));

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort)      sort!     : MatSort;

  /* ---------------- rol / modo ---------------- */
  private user = JSON.parse(localStorage.getItem('user') || '{}');
  role: 'Admin' | 'Miembro de Junta' = this.user.rol;
  currentMode: Mode = this.role === 'Admin'
    ? 'admin-inprogress'
    : 'jd-presenter';

  /* ---------------- filtro de rango ---------------- */
  startDate = '';
  endDate   = '';

  constructor(
    private service : ConsultationService,
    private toast   : ToastrService,
    private spinner : NgxSpinnerService
  ) { this.load(); }

  /* ---------- cambio de tab ---------- */
  tabChanged(e: MatTabChangeEvent): void {
    const map: {[k: string]: Mode} = {
      'En Progreso'            : 'admin-inprogress',
      'Agendas Editables'      : 'admin-editable',
      'Próximas (sin acta)'    : 'admin-upcoming',
      'Actas como Expositor'   : 'jd-presenter',
      'Actas como Responsable' : 'jd-responsible',
      'Sesiones Ausente'       : 'jd-absent'
    };
    this.currentMode = map[e.tab.textLabel] || this.currentMode;
    this.load();
  }

  
  /* ---------- carga según modo ---------- */
  private load(): void {
    this.spinner.show();
    const uid = this.user.id;
    let obs$: Observable<Rows>;

    switch (this.currentMode) {
      case 'admin-inprogress': obs$ = this.service.inProgress();               break;
      case 'admin-editable'  : obs$ = this.service.editableAgendas();          break;
      case 'admin-upcoming'  : obs$ = this.service.upcoming();                 break;
      case 'jd-presenter'    : obs$ = this.service.actasByPresenter(uid);      break;
      case 'jd-responsible'  : obs$ = this.service.actasByResponsible(uid);    break;
      case 'jd-absent'       : obs$ = this.service.absentSessions(uid);        break;
      default                : obs$ = of([]);
    }

    obs$.subscribe({
      next   : rows => this.setTable(rows),
      error  : ()   => { this.toast.error('Error cargando datos'); this.spinner.hide(); },
      complete: ()  => this.spinner.hide()
    });
  }

  private setTable(rows: Rows) {
    const table = new MatTableDataSource<Row>(rows);
    table.paginator = this.paginator;
    table.sort      = this.sort;
    this.dataSource.set(table);
  }

  /* ---------- filtro por rango ---------- */
  applyRange(): void {
    if (!this.startDate || !this.endDate) {
      this.toast.warning('Seleccione ambas fechas');
      return;
    }
    this.spinner.show();
    this.service.sessionsByRange(this.startDate, this.endDate).subscribe({
      next   : rows => this.setTable(rows),
      error  : ()   => this.toast.error('Error filtrando por rango'),
      complete: ()  => this.spinner.hide()
    });
  }

  /* ---------- PDF ---------- */
  pdf(a: Acta) { if (a?.pdfPath) window.open(a.pdfPath, '_blank'); }
}
