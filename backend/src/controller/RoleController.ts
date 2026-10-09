import { Request, Response } from 'express';
import { AppDataSource } from '../database/data-source';
import { Role } from '../model/role';

export class RoleController {
    private static instance: RoleController;

    private constructor() {}

    static getInstance(): RoleController {
        if (!RoleController.instance) {
            RoleController.instance = new RoleController();
        }
        return RoleController.instance;
    }

    async getRoles(req: Request, res: Response): Promise<void> {
        try {
            const roleRepo = AppDataSource.getRepository(Role);
            const roles = await roleRepo.find();
            res.json(roles);
        } catch (error) {
            console.error('Error getting roles:', error);
            res.status(500).json({ message: 'Error getting roles' });
        }
    }
}
