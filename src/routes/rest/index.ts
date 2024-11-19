import express from 'express';
import profileRoute from './profile.route';

const router = express.Router();

const routes = [
    {
        path: '/profile',
        route: profileRoute
    }
];

// iterating over routes array and using every router provided
routes.forEach((route) => {
    router.use(route.path, route.route);
})

// base api router
export default router;
