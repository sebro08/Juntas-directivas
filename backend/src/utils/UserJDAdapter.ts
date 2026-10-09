import { IUserSys } from '../interfaces/IUserSys';
import { BoardMember } from '../model/BoardMember';

/**
 * Adapter que permite tratar a un BoardMember como un IUserSys.
 */
export class UserJDAdapter implements IUserSys {
  private boardMember: BoardMember;

  constructor(boardMember: BoardMember) {
    this.boardMember = boardMember;
  }

  getId(): number {
    return this.boardMember.id;
  }

  getNombreCompleto(): string {
    return `${this.boardMember.firstName} ${this.boardMember.lastName}`;
  }

  getCorreo(): string {
    return this.boardMember.email;
  }

  getRol(): string {
    return this.boardMember.role?.name || 'MiembroJD';
  }

  isLoginActivo(): boolean {
    return this.boardMember.loginAvailable;
  }

  getPuestoEnJunta(): string | null {
    return this.boardMember.position || null;
  }

  getPeriodo(): { inicio: Date | null; fin: Date | null } {
    return {
      inicio: this.boardMember.startDate || null,
      fin: this.boardMember.endDate || null,
    };
  }
}
