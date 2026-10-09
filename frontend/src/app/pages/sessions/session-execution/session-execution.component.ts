import {Component, OnInit, ViewChild} from '@angular/core';
import {NgxSpinnerService} from "ngx-spinner";
import {SessionService} from "../../../core/services/session.service";
import {ToastrService} from "ngx-toastr";
import {Session} from "../../../core/models/session";
import {JsonPipe} from "@angular/common";
import {MatTableDataSource, MatTableModule} from "@angular/material/table";
import {MatPaginator, MatPaginatorModule} from "@angular/material/paginator";
import {MatSort, MatSortModule} from "@angular/material/sort";
import {MatInputModule} from "@angular/material/input";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatButtonModule} from "@angular/material/button";
import {Router, RouterOutlet} from "@angular/router";

@Component({
  selector: 'app-session-execution',
  imports: [MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, MatButtonModule, RouterOutlet],
  templateUrl: './session-execution.component.html',
  styleUrl: './session-execution.component.css'
})
export class SessionExecutionComponent implements OnInit {
  todaySessions!: Session[];
  displayedColumns: string[] = ['name', 'status', 'date', 'send'];
  dataSource!: MatTableDataSource<Session>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private sessionService: SessionService,
              private spinner: NgxSpinnerService,
              private toastr: ToastrService,
              private router: Router) {
    this.loadTodaySessions();
  }

  ngOnInit() {
  }

  loadTodaySessions() {
    this.spinner.show();
    this.sessionService.getTodaySessions().subscribe({
      next: (sessions) => {
        this.spinner.hide();
        if (sessions.length === 0) {
          this.toastr.info('No sessions found for today.');
        } else {
          this.todaySessions = sessions;
          this.dataSource = new MatTableDataSource(sessions);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        }
      },
      error: (error) => {
        this.spinner.hide();
        this.toastr.error('Failed to load sessions: ' + error.message);
      }
    });
  }

  isNow(dateStr: string, timeStr: string): boolean {
    return true
    const now = new Date();
    const sessionDate = new Date(dateStr + 'T' + timeStr);

    const toleranceMinutes = 120; // Optional window
    const diff = Math.abs(sessionDate.getTime() - now.getTime()) / 1000 / 60;

    return now.toDateString() === sessionDate.toDateString() && diff <= toleranceMinutes;
  }

  updateStatusAndExecute(sessionId: number, statusId: number): void {
    this.spinner.show();
    this.sessionService.updateSessionStatus(sessionId, statusId).subscribe({
      next: () => {
        this.spinner.hide();
        this.toastr.success('Session status updated');
        this.goToExecution(sessionId);
      },
      error: () => {
        this.spinner.hide();
        this.toastr.error('Failed to update session status');
      }
    });
  }

  goToExecution(sessionId: number): void {
    this.router.navigate(['/sessions/execute', sessionId]);
  }
}
