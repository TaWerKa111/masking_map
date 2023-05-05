import axios from "axios";

export const apiInst = axios.create({
    baseURL: 'http://localhost:5001/api/',
    timeout: 1000,
    headers: {'X-Custom-Header': 'foobar'}
  });
