import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { UsersComponent } from './pages/users/users.component';
import { SessionListComponent } from './pages/sessions/session-list/session-list.component';
import { SessionFormComponent } from './pages/sessions/session-form/session-form.component';
import { SessionExecutionComponent } from './pages/sessions/session-execution/session-execution.component';
import { LoginComponent } from './auth/login/login.component';
import { authGuard } from './core/guards/auth.guard';
import { SessionIdExecutionComponent } from './pages/sessions/session-execution/session-id-execution/session-id-execution.component';
import { SessionSummaryComponent } from './pages/sessions/session-execution/session-summary/session-summary.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'settings', pathMatch: 'full' },
      { path: 'settings', component: SettingsComponent },
      { path: 'users', component: UsersComponent },
      {
        path: 'sessions',
        children: [
          { path: '', component: SessionListComponent },
          { path: 'new', component: SessionFormComponent },
          { path: 'execute', component: SessionExecutionComponent },
          { path: 'execute/:id', component: SessionIdExecutionComponent },
          { path: 'summary/:id', component: SessionSummaryComponent },
        ],
      },
      {
      path: 'consultation',
      loadComponent: () =>
        import('./pages/consultation/consultation.component')
          .then(m => m.ConsultationComponent)
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./pages/notifications/notifications.component')
            .then(m => m.NotificationsComponent)
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
