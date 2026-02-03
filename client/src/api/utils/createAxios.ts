import axios, { AxiosError, type AxiosResponse } from "axios";
const createAxios = () => {
    const instance = axios.create({
        timeout : 5000,
        baseURL : 'http://localhost:3000',
        headers:{'Content-Type':'application/json'}
    });

    instance.interceptors.request.use((config)=>{
        return config;
    },(err:AxiosError)=>{
        return Promise.reject(err);
    });

    instance.interceptors.response.use((res:AxiosResponse)=>{
        return res;
    },(err:AxiosError)=>{
        return Promise.reject(err);
    })

    return instance;
};
export default createAxios;