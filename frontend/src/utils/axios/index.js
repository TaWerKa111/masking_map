import axios from "axios";

export const apiInst = axios.create({
    baseURL: "http://localhost:5001/api/",
    // baseURL: "http://app:5000/api/",
    timeout: 5000,
    headers: {
        "X-Custom-Header": "foobar",
        "Access-Control-Allow-Credentials": true,
    },
});
