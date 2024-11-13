import httpStatus from "http-status"

export class ApiResponse {
    public status_code: number;
    public error: any;
    public data: Array<any>;

    constructor() {
        this.status_code = httpStatus.OK;
        this.data = [];
        this.error = null;
    }
}
