import { Response } from "express";
import { VerifiedRequest } from "../common/types";
import { ApiResponse } from "../utils/ApiResponse";

export const searchUser = async (req: VerifiedRequest, res: Response) => {
    const apiResponse = new ApiResponse();

    try {
        const username = req.params.username;

        if (!username) {
            apiResponse.error = 'No username provided';
            apiResponse.status_code = httpStatus.UNPROCESSABLE_ENTITY;

            res.status(httpStatus.UNPROCESSABLE_ENTITY).send(apiResponse);
            return;
        }

        res.send(username+'hihi');
    } catch (error) {
        apiResponse.error = error;
        apiResponse.status_code = httpStatus.INTERNAL_SERVER_ERROR;

        res.status(httpStatus.INTERNAL_SERVER_ERROR).send(apiResponse);
    }
}
