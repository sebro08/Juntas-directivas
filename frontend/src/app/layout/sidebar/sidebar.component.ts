import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrl: './../layout.component.css',
  imports: [
    RouterLink,
    NgIf,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule
  ]
})
export class SidebarComponent {
  user = JSON.parse(localStorage.getItem('user') || '{}');
  role: string = this.user?.rol === 'Admin' ? 'Administrador' : this.user?.rol;

  isAdmin(): boolean {
    return this.role === 'Administrador';
  }

  isMiembro(): boolean {
    return this.role === 'Miembro de Junta';
  }
}

