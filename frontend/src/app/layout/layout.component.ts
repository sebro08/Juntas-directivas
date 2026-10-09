import {Component, inject, OnDestroy, signal, ViewChild} from '@angular/core';
import {MediaMatcher} from '@angular/cdk/layout';
import {HeaderComponent} from './header/header.component';
import {MatSidenav, MatSidenavModule} from '@angular/material/sidenav';
import {SidebarComponent} from './sidebar/sidebar.component';
import {MatToolbarModule} from '@angular/material/toolbar';
import {RouterOutlet} from '@angular/router';
import {MatListModule} from '@angular/material/list';

@Component({
  selector: 'app-layout',
  imports: [
    HeaderComponent,
    SidebarComponent,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    RouterOutlet
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent implements OnDestroy {
  @ViewChild('snav') sidenav!: MatSidenav;

  protected readonly isMobile = signal(true);

  private readonly _mobileQuery: MediaQueryList;
  private readonly _mobileQueryListener: () => void;

  constructor() {
    const media = inject(MediaMatcher);
    this._mobileQuery = media.matchMedia('(max-width: 600px)');
    this.isMobile.set(this._mobileQuery.matches);
    this._mobileQueryListener = () => this.isMobile.set(this._mobileQuery.matches);
    this._mobileQuery.addEventListener('change', this._mobileQueryListener);
  }

  toggleSidebar = () => {
    this.sidenav.toggle();
  };

  ngOnDestroy(): void {
    this._mobileQuery.removeEventListener('change', this._mobileQueryListener);
  }
}
