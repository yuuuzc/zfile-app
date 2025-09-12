import axios, { AxiosHeaders } from 'axios';
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { useUserStore } from '~/stores/user';

// 在开发时不重复拼接 baseURL，调用处可使用完整 /api/... 路径
const baseURL = import.meta.env.VITE ? '/' : (import.meta.env.VITE_API_BASE_URL ?? '/');

const service: AxiosInstance = axios.create({
    baseURL,
    timeout: 0,
    headers: { 'Content-Type': 'application/json;charset=UTF-8;' },
});

service.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const userStore = useUserStore();
    const token = (userStore as any).token || (userStore as any).getToken?.();
    if (token) {
        // 确保 headers 存在并设置自定义 token 头 Zfile-Token
        if (!config.headers) config.headers = new AxiosHeaders();
        // 使用 AxiosHeaders.set 保证类型正确
        (config.headers as AxiosHeaders).set('Zfile-Token', String(token));
    }

    // 打印每次请求的关键信息
    try {
        console.log('[request] ', {
            method: (config.method ?? 'GET').toString().toUpperCase(),
            url: config.url,
            params: config.params,
            data: config.data,
            headers: config.headers,
        });
    } catch (e) {
        // 避免在打印时抛出错误影响请求
        console.warn('[request] log error', e);
    }

    return config;
}, (error) => {
    console.error('[request] error', error);
    return Promise.reject(error);
});

service.interceptors.response.use(
    (response: AxiosResponse) => {
        // 打印响应数据
        try {
            console.log('[response] ', {
                method: (response.config.method ?? 'GET').toString().toUpperCase(),
                url: response.config.url,
                status: response.status,
                data: response.data,
            });
        } catch (e) {
            console.warn('[response] log error', e);
        }

        const res = response.data;
        if (res && typeof res === 'object' && 'code' in res) {
            // 同时兼容 number 和 string 类型的 code
            if (res.code === 0 || res.code === '0') return res.data;
            return Promise.reject(new Error(res.msg || '请求错误'));
        }
        return res;
    },
    (error) => {
        // 打印错误信息（包含请求信息）
        try {
            console.error('[response] error', {
                message: error?.message,
                config: error?.config,
                response: error?.response?.data ?? error?.response,
            });
        } catch (e) {
            console.warn('[response] error log failed', e);
        }

        // 返回一个 rejected 的 Promise，终止当前失败的请求链
        return Promise.reject(error);
    }
);

export default service;