import express from 'express';
import { allUsers, registerUser, authUser } from '../controllers/userControllers.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, allUsers).post(registerUser);
router.post('/login', authUser);

export default router;
