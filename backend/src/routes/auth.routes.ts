import { Router } from 'express';
import { AuthController } from '../controller/LoginController';
const router = Router();

const authController = AuthController.getInstance();

router.post('/login', authController.login.bind(authController));
router.post('/register', authController.register.bind(authController));

export default router;
