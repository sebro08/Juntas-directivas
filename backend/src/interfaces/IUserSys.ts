/**
 * Interfaz común para usuarios del sistema.
 * Utilizada por el Adapter para unificar el acceso a los atributos de usuario.
 */

export interface IUserSys {
  getId(): number;
  getNombreCompleto(): string;
  getCorreo(): string;
  getRol(): string;
  isLoginActivo(): boolean;
  getPuestoEnJunta(): string | null;
  getPeriodo(): { inicio: Date | null; fin: Date | null };
}
