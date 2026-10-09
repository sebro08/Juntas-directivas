import {Component, ViewChild} from '@angular/core';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {User} from '../../core/models/user';
import {UserService} from '../../core/services/user.service';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {ToastrService} from 'ngx-toastr';
import {NgxSpinnerService} from 'ngx-spinner';
import {VISITOR_USER} from '../../core/shared/constants';
import {RoleService} from "../../core/services/role.service";
import {Role} from "../../core/models/role";
import {MatSelectModule} from "@angular/material/select";
import {NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-users',
  imports: [MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, MatButtonModule, MatIconModule, MatSelectModule, NgIf, NgForOf,],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent {
  displayedColumns: string[] = ['user', 'email', 'role', 'delete'];
  dataSource!: MatTableDataSource<User>;
  currentUser: number = 0;
  roles!: Role[];
  editedUserId: number | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private userService: UserService,
              private toastr: ToastrService,
              private spinner: NgxSpinnerService,
              private roleService: RoleService,) {
    this.loadUsers();
    this.loadRoles();
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      this.currentUser = parsedUser.id
    }
  }

  loadRoles() {
    this.spinner.show();
    this.roleService.getRoles().subscribe({
      next: (roles: Role[]) => {
        this.roles = roles;
      },
      error: err => {
        console.error(err);
      },
      complete: () => {
        this.spinner.hide();
      }
    });
  }

  loadUsers() {
    this.spinner.show();
    this.userService.getUsers().subscribe({
      next: (users: User[]) => {
        this.dataSource = new MatTableDataSource(users);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: err => {
        console.error(err);
      },
      complete: () => {
        this.spinner.hide();
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

  deleteUser(id: number) {
    if (!confirm('Are you sure you want to delete this user?')) return;

    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.loadUsers();
        this.toastr.success('El usuario ha sido eliminado correctamente');

      },
      error: err => {
        this.toastr.error();
      }
    });
  }

  editUser(userId: number): void {
    this.editedUserId = userId;
  }

  saveUserRole(row: User): void {
    const updatedRoleId = row.role.id;

    this.spinner.show();
    this.userService.updateUserRole(row.id, updatedRoleId).subscribe({
      next: () => {
        this.toastr.success('Rol actualizado');
        this.editedUserId = null;
        this.loadUsers();
      },
      error: () => this.toastr.error('Error al actualizar rol'),
      complete: () => this.spinner.hide()
    });
  }

  cancelEdit(): void {
    this.editedUserId = null;
  }

  protected readonly VISITOR_USER = VISITOR_USER;
}
