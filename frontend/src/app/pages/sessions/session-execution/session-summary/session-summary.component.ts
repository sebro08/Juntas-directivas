import {Component, OnInit, signal, viewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {SessionService} from "../../../../core/services/session.service";
import {NgxSpinnerService} from "ngx-spinner";
import {ToastrService} from "ngx-toastr";
import {DatePipe, NgForOf, NgIf} from "@angular/common";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatIconModule} from "@angular/material/icon";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../../environments/environment"; 


@Component({
  selector: 'app-session-summary',
  imports: [
    DatePipe,
    NgForOf,
    NgIf,
    MatExpansionModule,
    MatIconModule,
  ],
  templateUrl: './session-summary.component.html',
  styleUrl: './session-summary.component.css'
})
export class SessionSummaryComponent implements OnInit {
  sessionId!: number;
  session: any;
  readonly panelOpenState = signal(false);

  constructor(
    private route: ActivatedRoute,
    private sessionService: SessionService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private router: Router,
    private http: HttpClient 
  ) { }


  ngOnInit() {
    this.sessionId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadSessionDetails();
  }

  loadSessionDetails() {
    this.spinner.show();
    this.sessionService.getSessionById(this.sessionId).subscribe({
      next: (session) => {
        this.session = session;
        this.spinner.hide();
      },
      error: (error) => {
        this.spinner.hide();
        this.toastr.error(error);
      }
    });
  }

  exportPdf(): void {
  if (!this.sessionId) {
    this.toastr.warning('ID de sesión inválido');
    return;
  }

  this.spinner.show();

  this.http.get(`${environment.urlApi}/sessions/${this.sessionId}/export`, {
    responseType: 'blob'
  }).subscribe({
    next: (blob) => {
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `resumen_sesion_${this.sessionId}.pdf`;
      link.click();
      this.spinner.hide();
      this.toastr.success('PDF generado correctamente');
    },
    error: () => {
      this.spinner.hide();
      this.toastr.error('Error al generar el PDF');
    }
  });
}

}
