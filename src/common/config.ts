import * as dotenv from "dotenv";
import { resolve } from "path";

const ENV_FILE_PATH = resolve('.env');
const isEnvFound = dotenv.config({ path: ENV_FILE_PATH });

if (isEnvFound.error) {
    throw new Error("Cannot find .env file");
}

process.env.NODE_ENV = process.env.NODE_ENV || "development";
process.env.REST_PORT = process.env.REST_PORT || "5000";
process.env.SOCKET_PORT = process.env.SOCKET_PORT || "8080";

export default {
    REST_PORT: parseInt(process.env.REST_PORT, 10),
    SOCKET_PORT: parseInt(process.env.SOCKET_PORT, 10),
    JWT_SECRET: process.env.SUPABASE_JWT_SECRET,
    BASE_URL: process.env.BASE_URL,
    SOCKET_BASE_URL: process.env.SOCKET_BASE_URL,
}
