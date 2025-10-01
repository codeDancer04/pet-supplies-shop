import axios, { AxiosError, type AxiosResponse } from "axios";

const createTokenAxios = () => {
    const token = localStorage.getItem('token');
    const instance = axios.create({
    timeout:5000,
    baseURL:'http://localhost:3000',
    headers:{
        'Content-Type':'application/json',
        Authorization:`Bearer ${token}`
    }
    });

    instance.interceptors.request.use((config)=>{
        //每次请求前更新token
        const updatedToken = localStorage.getItem('token');
        if(updatedToken && config.headers){
            config.headers.Authorization = `Bearer ${updatedToken}`;
        }
        return config;
    },(err:AxiosError)=>{
        return Promise.reject(err);
    });

    instance.interceptors.response.use((res:AxiosResponse)=>{
        return res;
    },(err:AxiosError)=>{
        // 处理token过期或无效的情况
        if(err.response?.status === 401){
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    })

    return instance;
};
export default createTokenAxios;