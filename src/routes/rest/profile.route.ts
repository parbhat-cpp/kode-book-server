import express from 'express';
import { isAuth } from '../../middlewares/isAuth';
import { searchUser } from '../../controller/user.controller';

const router = express.Router();

/**
 * Search user by username
 */
router.get('/:username', isAuth, searchUser);

export default router;
