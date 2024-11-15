import express from 'express';
import profileRoute from './profile.route';

const router = express.Router();

const routes = [
    {
        path: '/profile',
        route: profileRoute
    }
];

routes.forEach((route) => {
    router.use(route.path, route.route);
})

export default router;
