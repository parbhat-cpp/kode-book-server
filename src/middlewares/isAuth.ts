import { NextFunction, Response } from "express";

import { VerifiedRequest } from "../common/types";
import { ApiResponse } from "../utils/ApiResponse";
import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';
import config from "../common/config";

export const isAuth = (req: VerifiedRequest, res: Response, next: NextFunction) => {
    const apiResponse = new ApiResponse();

    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        apiResponse.error = 'Access Denied: No token provided';
        apiResponse.status_code = httpStatus.UNAUTHORIZED;
        res.status(httpStatus.UNAUTHORIZED).send(apiResponse);
        return;
    }

    try {
        // verify token
        const decoded = jwt.verify(token, config.JWT_SECRET as string);

        // attach user to request
        req.user = decoded;
        next();
    } catch (error) {
        apiResponse.error = error?.toString();
        apiResponse.status_code = httpStatus.INTERNAL_SERVER_ERROR;

        res.status(httpStatus.INTERNAL_SERVER_ERROR).send(apiResponse);
    }
}
