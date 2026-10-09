import { Request, Response } from 'express';
import { AppDataSource } from '../database/data-source';
import { User } from '../model/User';
import { Role } from '../model/role';
import { BoardMember } from '../model/BoardMember';
import { UserJDAdapter } from '../utils/UserJDAdapter';

import jwt from 'jsonwebtoken';

export class AuthController {
    private static instance: AuthController;

    private constructor() {}

    static getInstance(): AuthController {
        if (!AuthController.instance) {
            AuthController.instance = new AuthController();
        }
        return AuthController.instance;
    }

    async register(req: Request, res: Response): Promise<void> {
        const { firstName, lastName, email, password, roleId } = req.body;
        const userRepo = AppDataSource.getRepository(User);
        const boardRepo = AppDataSource.getRepository(BoardMember);
        const roleRepo = AppDataSource.getRepository(Role);

        try {
            const existingUser = await userRepo.findOne({ where: { email } });
            if (existingUser) {
                res.status(400).json({ error: 'Email is already in use' });
                return;
            }

            const role = await roleRepo.findOneBy({ id: roleId });
            if (!role) {
                res.status(400).json({ error: 'Invalid role' });
                return;
            }

            let newUser: User | BoardMember;

            if (role.name === 'Miembro de Junta') {
                // Crea un BoardMember
                newUser = boardRepo.create({
                    firstName,
                    lastName,
                    email,
                    password,
                    role,
                    startDate: new Date(),
                    loginAvailable: true,
                });
            } else {
                // Crea un usuario normal(Admin)
                newUser = userRepo.create({
                    firstName,
                    lastName,
                    email,
                    password,
                    role,
                    loginAvailable: true,
                });
            }

            await userRepo.save(newUser);

            res.status(201).json({
                message: 'User registered successfully',
                user: {
                    id: newUser.id,
                    name: newUser.getFullName(),
                    email: newUser.email,
                    role: role.name,
                },
            });
        } catch (error) {
            console.error('Register error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async login(req: Request, res: Response): Promise<void> {
        const { email, password } = req.body;
        const userRepo = AppDataSource.getRepository(User);
        const boardRepo = AppDataSource.getRepository(BoardMember);

        const user = await userRepo.findOne({
            where: { email },
            relations: ['role'],
        });

        if (!user || !user.loginAvailable) {
            res.status(401).json({ error: 'Invalid credentials or unauthorized user' });
            return;
        }

        const isMatch = await user.checkPassword(password);
        if (!isMatch) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const boardMember = await boardRepo.findOne({ where: { id: user.id }, relations: ['role'] });

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
            },
            process.env.JWT_SECRET || 'secret123',
            { expiresIn: '96d' }
        );

        if (boardMember) {
            // Implementacion del adapter
            const usuarioJD = new UserJDAdapter(boardMember);
            res.json({
                token,
                user: {
                    id: usuarioJD.getId(),
                    name: usuarioJD.getNombreCompleto(),
                    correo: usuarioJD.getCorreo(),
                    puesto: usuarioJD.getPuestoEnJunta(),
                    periodo: usuarioJD.getPeriodo(),
                    rol: usuarioJD.getRol(),
                }
            });
        } else {
            res.json({
                token,
                user: {
                    id: user.id,
                    name: user.getFullName(),
                    correo: user.email,
                    rol: user.role.name,
                }
            });
        }
    }
}
