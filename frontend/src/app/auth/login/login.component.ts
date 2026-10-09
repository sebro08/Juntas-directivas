import { Component, OnInit, signal } from '@angular/core';
import { LoginService } from '../services/login.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    NgIf,
  ],
})
export class LoginComponent implements OnInit {
  form!: FormGroup;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private router: Router,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  hide = signal(true);
  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const { email, password } = this.form.value;

    this.spinner.show();
    this.loginService.login(email, password).subscribe({
      next: () => {
        /** ───────── Redirección según rol ───────── */
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const role = user?.rol;

        if (role === 'Miembro de Junta') {
          this.router.navigate(['/notifications']);     // 👈 Va directo al buzón
        } else {
          this.router.navigate(['/dashboard']);         // Admin u otros roles
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Login failed';
        this.spinner.hide();
      },
      complete: () => this.spinner.hide(),
    });
  }
}
