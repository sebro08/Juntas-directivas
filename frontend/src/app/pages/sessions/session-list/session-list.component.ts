import { Component, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Session } from '../../../core/models/session';
import { SessionService } from '../../../core/services/session.service';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-session-list',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    RouterLink,
    MatButtonModule
  ],
  templateUrl: './session-list.component.html',
  styleUrls: ['./session-list.component.css']
})
export class SessionListComponent {
  displayedColumns: string[] = ['name', 'status', 'date', 'send'];
  dataSource!: MatTableDataSource<Session>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private sessionService: SessionService,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.loadSessions();
  }

  loadSessions() {
    this.sessionService.getSessions().subscribe({
      next: (sessions: Session[]) => {
        this.dataSource = new MatTableDataSource(sessions);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: err => {
        console.error(err);
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  sendInvitation(sessionId: number) {
    const url = `http://localhost:3000/api/sessions/${sessionId}/send-invitation`;;

    this.http.post(url, {}).subscribe({
      next: () => {
        this.snackBar.open('Convocatoria enviada correctamente.', 'Cerrar', {
          duration: 3000,
        });
      },
      error: (error) => {
        console.error('Error enviando convocatoria:', error);
        this.snackBar.open('Error al enviar la convocatoria.', 'Cerrar', {
          duration: 3000,
        });
      }
    });
  }

  downloadActa(sessionId: number) {
  const url = `http://localhost:3000/api/sessions/${sessionId}/export`;
  this.http.get(url, { responseType: 'blob' }).subscribe({
    next: (blob) => {
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = `Acta_Sesion_${sessionId}.pdf`;
      a.click();
      URL.revokeObjectURL(objectUrl);
    },
    error: (error) => {
      console.error('Error descargando el acta:', error);
      this.snackBar.open('Error al descargar el acta.', 'Cerrar', {
        duration: 3000,
      });
    }
  });
}

}
