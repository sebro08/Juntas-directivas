import { Request, Response } from 'express';
import { SystemParameter } from '../model/SystemParameter';

export class SettingsController {
    private static instance: SettingsController;

    private constructor() {}

    static getInstance(): SettingsController {
        if (!SettingsController.instance) {
            SettingsController.instance = new SettingsController();
        }
        return SettingsController.instance;
    }

    async getSettings(req: Request, res: Response): Promise<void> {
        try {
            const minimumQuorum = await SystemParameter.getValue('minimumQuorum');
            const minimumNoticeDays = await SystemParameter.getValue('minimumNoticeDays');

            res.json({
                minimumQuorum: Number(minimumQuorum) || 0,
                minimumNoticeDays: Number(minimumNoticeDays) || 0,
            });
        } catch (error) {
            console.error('Error fetching settings:', error);
            res.status(500).json({ message: 'Error fetching settings', error });
        }
    }

    async updateSettings(req: Request, res: Response): Promise<void> {
        let { minimumQuorum, minimumNoticeDays } = req.body;

        minimumQuorum = parseInt(minimumQuorum, 10);
        minimumNoticeDays = parseInt(minimumNoticeDays, 10);

        if (isNaN(minimumQuorum) || isNaN(minimumNoticeDays)) {
            res.status(400).json({ message: 'Invalid input types' });
            return;
        }

        try {
            await SystemParameter.updateValue('minimumQuorum', minimumQuorum.toString());
            await SystemParameter.updateValue('minimumNoticeDays', minimumNoticeDays.toString());

            res.json({ message: 'Settings updated successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error updating settings', error });
        }
    }
}
