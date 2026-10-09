import { Request, Response } from 'express';
import { AppDataSource } from '../database/data-source';
import { Modality } from '../model/Modality';

export class ModalityController {
    private static instance: ModalityController;

    private constructor() {}

    static getInstance(): ModalityController {
        if (!ModalityController.instance) {
            ModalityController.instance = new ModalityController();
        }
        return ModalityController.instance;
    }

    async getModalities(req: Request, res: Response): Promise<void> {
        const modalityRepo = AppDataSource.getRepository(Modality);

        try {
            const modalities = await modalityRepo.find();
            res.json(modalities);
        } catch (error) {
            console.error('Error fetching modalities:', error);
            res.status(500).json({ message: 'Error fetching modalities' });
        }
    }
}
