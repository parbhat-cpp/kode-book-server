import express from 'express';
import { isAuth } from '../../middlewares/isAuth';
import { followUser, getProfile, searchUser, unfollowUser } from '../../controller/profile.controller';

const router = express.Router();

/**
 * Fetch profile data by username
 */
router.get('/get-profile/:username', isAuth, getProfile);

/**
 * Search user by username
 */
router.get('/:username/:page', isAuth, searchUser);

/**
 * Follow user
 */
router.post('/follow', isAuth, followUser);

/**
 * Follow user
 */
router.post('/unfollow', isAuth, unfollowUser);

export default router;
