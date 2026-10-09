import { Request, Response } from 'express';
import { AppDataSource } from '../database/data-source';
import { User } from '../model/User';
import { Role } from '../model/role';
import { BoardMember } from '../model/BoardMember';
import { UserJDAdapter } from '../utils/UserJDAdapter';

export class UserController {
    private static instance: UserController;

    private constructor() {}

    static getInstance(): UserController {
        if (!UserController.instance) {
            UserController.instance = new UserController();
        }
        return UserController.instance;
    }

    async getUsers(req: Request, res: Response): Promise<void> {
        const userRepo = AppDataSource.getRepository(User);
        try {
            const users = await userRepo.find({ relations: ['role'] });
            res.json(users);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener usuarios', error });
        }
    }

    async deleteUser(req: Request, res: Response): Promise<void> {
        const userRepo = AppDataSource.getRepository(User);
        const userId = Number(req.params.id);

        if (isNaN(userId)) {
            res.status(400).json({ message: 'Invalid user ID' });
            return;
        }

        try {
            const user = await userRepo.findOne({ where: { id: userId } });

            if (!user) {
                res.status(404).json({ message: 'User not found' });
                return;
            }

            await userRepo.remove(user);
            res.status(200).json({ message: 'User deleted successfully' });
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({ message: 'Error deleting user', error });
        }
    }

    async updateUserRole(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const { roleId } = req.body;

        try {
            const userRepo = AppDataSource.getRepository(User);
            const roleRepo = AppDataSource.getRepository(Role);

            const user = await userRepo.findOneByOrFail({ id: Number(id) });
            const role = await roleRepo.findOneByOrFail({ id: roleId });

            user.role = role;
            await userRepo.save(user);

            res.json({ message: 'Rol actualizado' });
        } catch (error) {
            res.status(500).json({ message: 'Error al actualizar rol', error });
        }
    }

    async getBoardMember(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const boardRepo = AppDataSource.getRepository(BoardMember);

    try {
        const boardMember = await boardRepo.findOne({
            where: { id: Number(id) },
            relations: ['role'],
        });

        if (!boardMember) {
            res.status(404).json({ message: 'Miembro de junta no encontrado' });
            return;
        }

        const usuarioJD = new UserJDAdapter(boardMember);

        res.json({
            id: usuarioJD.getId(),
            nombre: usuarioJD.getNombreCompleto(),
            correo: usuarioJD.getCorreo(),
            rol: usuarioJD.getRol(),
            puesto: usuarioJD.getPuestoEnJunta(),
            periodo: usuarioJD.getPeriodo(),
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener miembro de junta', error });
    }
}
}
