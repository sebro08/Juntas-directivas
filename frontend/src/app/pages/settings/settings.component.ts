import {Component, OnInit} from '@angular/core';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {SettingsService} from '../../core/services/settings.service';
import {Settings} from '../../core/models/settings';
import {ToastrService} from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-settings',
  imports: [
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    ReactiveFormsModule
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  form: FormGroup;
  originalSettings!: Settings;

  constructor(private settingsService: SettingsService,
              private fb: FormBuilder,
              private toastr: ToastrService,
              private spinner: NgxSpinnerService) {
    this.form = this.fb.group({
      minimumQuorum: [null, [Validators.required, Validators.min(1)]],
      minimumNoticeDays: [null, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.spinner.show();
    this.settingsService.getSettings().subscribe({
      next: (settings: Settings) => {
        this.originalSettings = settings;
        this.form.patchValue({
          minimumQuorum: settings.minimumQuorum,
          minimumNoticeDays: settings.minimumNoticeDays
        });
      },
      error: err => {
        console.error(err);
      },
      complete: () => {
        this.spinner.hide();
      }
    });
  }

  save(): void {
    if (this.form.valid) {
      const updatedSettings = this.form.value;

      this.spinner.show();
      this.settingsService.saveSettings(updatedSettings).subscribe({
        next: () => {
          this.toastr.success('Settings saved successfully');
          this.loadSettings();
        },
        error: err => {
          this.toastr.error();
        },
        complete: () => {
          this.spinner.hide();
        }
      })
    }
  }

  cancel(): void {
    if (this.originalSettings) {
      this.form.setValue({
        minimumQuorum: this.originalSettings.minimumQuorum,
        minimumNoticeDays: this.originalSettings.minimumNoticeDays
      });
    }
  }

  isUnchanged(): boolean {
    if (!this.originalSettings) return true;

    const current = this.form.value;
    return (
        (current.minimumQuorum === this.originalSettings.minimumQuorum &&
        current.minimumNoticeDays === this.originalSettings.minimumNoticeDays) ||
            !this.form.valid
    );
  }

}
