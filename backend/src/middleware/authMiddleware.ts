import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
    id: number;
    email: string;
}

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or malformed token' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const secret = process.env.JWT_SECRET || 'secret123';
        const decoded = jwt.verify(token, secret) as JwtPayload;

        (req as any).user = {
            id: decoded.id,
            email: decoded.email,
        };
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Missing auth headers' });
    }
};
