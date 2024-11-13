import express from 'express';
import * as SocketIO from 'socket.io';
import { createServer, Server } from 'http';
import cors from "cors";

import router from '../routes/rest';
import config from '../common/config';

class ExpressServer {
    private _app!: express.Application;
    private _server!: Server;
    private _port!: number;

    public constructor() {
        this.listen();
    }

    private listen(): void {
        // initialize express app
        this._app = express();

        this._app.use(express.json());
        this._app.use(express.urlencoded());
        this._app.use(cors());
        this._app.use('/api', router);

        this._port = config.REST_PORT;
        this._server = createServer(this._app);
        this._app.listen(this._port, () => {
            console.log("Express server running on port:", this._port);
        })
    }

    public close(): void {
        this._server.close((err) => {
            if (err) throw Error();

            console.info(new Date(), 'Express server stopped');
        })
    }

    public initSocket(socket: SocketIO.Server): void {
        this._app.set('socket', socket);
    }

    get server(): Server {
        return this._server;
    }
}

export default ExpressServer;
