import axios from 'axios';
// const BASE_URL = 'http://192.168.100.198:3500';
const BASE_URL = 'http://192.168.100.198:3500';

export default axios.create({
    baseURL: BASE_URL
});

export const axiosPrivate = axios.create({
    baseURL: BASE_URL+'/api',
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true
});