import {Component, ViewChild, signal, WritableSignal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { NotificationService } from '../../core/services/notification.service';
import { Notification } from '../../core/models/notification';

@Component({
  selector: 'app-notifications',
  standalone: true,
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
  ],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded',  style({ height: '*' })),
      transition('expanded <=> collapsed', animate('200ms ease-in-out')),
    ]),
  ],
})
export class NotificationsComponent {
  /** Columnas principales */
  displayedColumns: string[] = ['subject', 'timestamp', 'status', 'actions'];
  columnsWithExpand: string[] = ['expand', ...this.displayedColumns];

  /** DataSource reactivo */
  dataSource: WritableSignal<MatTableDataSource<Notification>> = signal(new MatTableDataSource<Notification>());

  /** Fila expandida actualmente */
  expandedElement: Notification | null = null;

  /** ViewChilds */
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private notificationService: NotificationService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
  ) {
    this.loadNotifications();
  }

  /** Carga de notificaciones del usuario */
  private loadNotifications(): void {
    const user = JSON.parse(localStorage.getItem('user')!);
    const email = user?.correo;

    this.spinner.show();
    this.notificationService.getNotifications(email).subscribe({
      next: (notifications) => {
        const table = new MatTableDataSource(notifications);
        table.paginator = this.paginator!;
        table.sort = this.sort!;
        table.filterPredicate = (data, filter) =>
          data.subject.toLowerCase().includes(filter);
        this.dataSource.set(table);
      },
      error: () => this.toastr.error('Error cargando notificaciones'),
      complete: () => this.spinner.hide(),
    });
  }

  /** Filtro por asunto */
  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim().toLowerCase();
    const table = this.dataSource();
    table.filter = value;
    if (table.paginator) table.paginator.firstPage();
  }

  /** Marcar como leída */
  markAsRead(id: number): void {
    this.spinner.show();
    this.notificationService.markAsRead(id).subscribe({
      next: () => {
        this.loadNotifications();
        this.toastr.success('Notificación marcada como leída');
      },
      error: () => {
        this.spinner.hide();
        this.toastr.error('Error al marcar como leída');
      },
    });
  }

  /** Eliminar una notificación */
  deleteNotification(id: number): void {
    this.spinner.show();
    this.notificationService.deleteNotification(id).subscribe({
      next: () => {
        this.loadNotifications();
        this.toastr.success('Notificación eliminada');
      },
      error: () => {
        this.spinner.hide();
        this.toastr.error('Error al eliminar notificación');
      },
    });
  }

  /** Vaciar todo el buzón */
  clearNotifications(): void {
    const user = JSON.parse(localStorage.getItem('user')!);
    const email = user?.correo;

    this.spinner.show();
    this.notificationService.clearNotifications(email).subscribe({
      next: () => {
        this.loadNotifications();
        this.toastr.success('Buzón vaciado');
      },
      error: () => {
        this.spinner.hide();
        this.toastr.error('Error al vaciar buzón');
      },
    });
  }

  /** Chevron del botón de expansión */
  chevron(el: Notification): string {
    return this.expandedElement === el ? 'expand_less' : 'expand_more';
  }
  
}
