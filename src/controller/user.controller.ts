import { Response } from "express";
import httpStatus from "http-status";
import { like, sql } from "drizzle-orm";

import { VerifiedRequest } from "../common/types";
import { ApiResponse } from "../utils/ApiResponse";
import { db } from "../db/connect";
import { profilesTable } from '../db/schema/profile.schema';

export const searchUser = async (req: VerifiedRequest, res: Response) => {
    const apiResponse = new ApiResponse();

    try {
        const username = req.params.username;

        // when username is not provided
        if (!username) {
            apiResponse.error = 'No username provided';
            apiResponse.status_code = httpStatus.UNPROCESSABLE_ENTITY;

            res.status(httpStatus.UNPROCESSABLE_ENTITY).send(apiResponse);
            return;
        }

        // querying database for profile with the provided username
        const userDataResponse = await db.select({
            id: profilesTable.id,
            username: profilesTable.username,
            full_name: profilesTable.full_name,
            avatar_url: profilesTable.avatar_url,
        }).from(profilesTable).where(like(profilesTable.username, `%${username}%`));

        // when user doesn't exists
        if (!userDataResponse.length) {
            apiResponse.error = 'User not found';
            apiResponse.status_code = httpStatus.NOT_FOUND;

            res.send(apiResponse);
            return;
        }

        // user found
        apiResponse.data = userDataResponse;
        apiResponse.status_code = httpStatus.OK;
        res.status(httpStatus.OK).send(apiResponse);
    } catch (error) {
        apiResponse.error = error?.toString();
        apiResponse.status_code = httpStatus.INTERNAL_SERVER_ERROR;

        res.status(httpStatus.INTERNAL_SERVER_ERROR).send(apiResponse);
    }
}
