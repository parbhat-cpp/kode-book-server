import { Response } from "express";
import httpStatus from "http-status";
import { and, eq, like, sql, asc } from "drizzle-orm";

import { VerifiedRequest } from "../common/types";
import { ApiResponse } from "../utils/ApiResponse";
import { db } from "../db/connect";
import { profilesTable } from '../db/schema/profile.schema';
import { followsTable } from "../db/schema/follows.schema";

export const searchUser = async (req: VerifiedRequest, res: Response) => {
    const apiResponse = new ApiResponse();

    try {
        const currentUserId = req.user.sub;
        const username = req.params.username;
        const page = Number(req.params.page) || 1;
        const pageSize = 5; // no. of profile data in each page

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
            following: sql<boolean>`
                EXISTS (
                    SELECT 1
                    FROM follows
                    WHERE follower_id = ${currentUserId}
                    AND followee_id = ${profilesTable.id}
                )
            `.as("following"),
        }).from(profilesTable)
            .orderBy(asc(profilesTable.full_name))
            .limit(pageSize)
            .offset((page - 1) * pageSize)
            .where(like(profilesTable.username, `%${username}%`));

        const totalSearchRows = await db.select({
            count: sql<number>`COUNT(*)`.as("total"),
        })
            .from(profilesTable)
            .where(like(profilesTable.username, `%${username}%`));

        // when user doesn't exists
        if (!userDataResponse.length) {
            apiResponse.error = 'User not found';
            apiResponse.status_code = httpStatus.NOT_FOUND;

            res.send(apiResponse);
            return;
        }

        // user found
        apiResponse.data = [{ searchResult: userDataResponse, totalRows: totalSearchRows[0].count }];
        apiResponse.status_code = httpStatus.OK;
        res.status(httpStatus.OK).send(apiResponse);
    } catch (error) {
        apiResponse.error = error?.toString();
        apiResponse.status_code = httpStatus.INTERNAL_SERVER_ERROR;

        res.status(httpStatus.INTERNAL_SERVER_ERROR).send(apiResponse);
    }
}

export const getProfile = async (req: VerifiedRequest, res: Response) => {
    const apiResponse = new ApiResponse();

    try {
        const username = req.params.username;

        if (!username) {
            apiResponse.error = 'No id provided';
            apiResponse.status_code = httpStatus.BAD_REQUEST;

            res.send(apiResponse);
            return;
        }

        const profileData = await db.select({
            id: profilesTable.id,
            username: profilesTable.username,
            full_name: profilesTable.full_name,
            avatar_url: profilesTable.avatar_url,
            works_at: profilesTable.works_at,
            location: profilesTable.location,
        }).from(profilesTable).where(eq(profilesTable.username, username));

        const followersCountData = await db.select({
            followers: sql<number>`COUNT(followee_id)`.as("followers"),
        }).from(followsTable).where(eq(followsTable.followee_id, profileData[0].id));

        const followingCountData = await db.select({
            following: sql<number>`COUNT(follower_id)`.as("following"),
        }).from(followsTable).where(eq(followsTable.follower_id, profileData[0].id));

        apiResponse.status_code = httpStatus.OK;
        apiResponse.data = [
            {
                ...profileData[0],
                ...followersCountData[0],
                ...followingCountData[0],
            }
        ]

        res.send(apiResponse);
    } catch (error) {
        apiResponse.error = error?.toString();
        apiResponse.status_code = httpStatus.INTERNAL_SERVER_ERROR;

        res.status(httpStatus.INTERNAL_SERVER_ERROR).send(apiResponse);
    }
}

export const followUser = async (req: VerifiedRequest, res: Response) => {
    const apiResponse = new ApiResponse();

    try {
        const currentUserId = req.user.sub;
        const { followee_id } = req.body;

        // when no followee id is provided
        if (!followee_id) {
            apiResponse.error = 'Provide followee id to follow';
            apiResponse.status_code = httpStatus.BAD_REQUEST;

            res.send(apiResponse);
            return;
        }

        // checking if provided followee id is user's id
        if (currentUserId === followee_id) {
            apiResponse.error = 'Cannot follow';
            apiResponse.status_code = httpStatus.BAD_REQUEST;

            res.send(apiResponse);
            return;
        }

        // checking if user already follow the other user
        const followExists = await db.select().from(followsTable)
            .where(
                and(
                    eq(followsTable.follower_id, currentUserId),
                    eq(followsTable.followee_id, followee_id)
                )
            );

        if (followExists.length) {
            apiResponse.error = 'Already following this user';
            apiResponse.status_code = httpStatus.BAD_REQUEST;

            res.send(apiResponse);
            return;
        }

        // user started following the other user
        const followUserResponse = await db.insert(followsTable).values({
            followee_id: followee_id,
            follower_id: currentUserId,
        });

        apiResponse.data = [followUserResponse];
        apiResponse.status_code = httpStatus.OK;
        res.send(apiResponse);
    } catch (error) {
        apiResponse.error = error?.toString();
        apiResponse.status_code = httpStatus.INTERNAL_SERVER_ERROR;

        res.status(httpStatus.INTERNAL_SERVER_ERROR).send(apiResponse);
    }
}

export const unfollowUser = async (req: VerifiedRequest, res: Response) => {
    const apiResponse = new ApiResponse();

    try {
        const currentUserId = req.user.sub;
        const { followee_id } = req.body;

        // when no followee id provided
        if (!followee_id) {
            apiResponse.error = 'Provide followee id to unfollow';
            apiResponse.status_code = httpStatus.BAD_REQUEST;

            res.send(apiResponse);
            return;
        }

        // when user id and followee id matches
        if (followee_id === currentUserId) {
            apiResponse.error = 'Cannot unfollow user';
            apiResponse.status_code = httpStatus.BAD_REQUEST;

            res.send(apiResponse);
            return;
        }

        // unfollow if follow exists
        const followExists = await db.select().from(followsTable)
            .where(
                and(
                    eq(followsTable.follower_id, currentUserId),
                    eq(followsTable.followee_id, followee_id)
                )
            );

        if (followExists.length) {
            const unfollowUserResponse = await db.delete(followsTable).where(
                and(
                    eq(followsTable.follower_id, currentUserId),
                    eq(followsTable.followee_id, followee_id)
                )
            );

            apiResponse.data = [unfollowUserResponse];
            apiResponse.status_code = httpStatus.OK;

            res.send(apiResponse);
        } else {
            apiResponse.error = "Follow doesn't exists";
            apiResponse.status_code = httpStatus.NOT_FOUND;

            res.send(apiResponse);
        }
    } catch (error) {
        apiResponse.error = error?.toString();
        apiResponse.status_code = httpStatus.INTERNAL_SERVER_ERROR;

        res.status(httpStatus.INTERNAL_SERVER_ERROR).send(apiResponse);
    }
}
