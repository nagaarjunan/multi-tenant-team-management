import { GLOBAL_CONFIG } from "@/global-config";
import { t } from "@/locales/i18n";
import userStore from "@/store/userStore";
import axios, { type AxiosRequestConfig, type AxiosError, type AxiosResponse } from "axios";
import { toast } from "sonner";
import type { Result } from "#/api";
import { ResultStatus } from "#/enum";

const axiosInstance = axios.create({
	baseURL: GLOBAL_CONFIG.apiBaseUrl,
	timeout: 50000,
	headers: { "Content-Type": "application/json;charset=utf-8" },
	withCredentials: true,
});

axiosInstance.interceptors.request.use(
	(config) => {
		const token = userStore.getState().userToken?.accessToken;
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
	(res: AxiosResponse<Result<any>>) => {
		if (!res.data) throw new Error(t("sys.api.apiRequestFailed"));
		const { status, data, message, success } = res.data as any;
		if (status === ResultStatus.SUCCESS || success === true || (res.status >= 200 && res.status < 300 && status === undefined)) {
			return data !== undefined ? data : res.data;
		}
		const errMsg = message || t("sys.api.apiRequestFailed");
		toast.error(errMsg, { id: "api-error" });
		throw new Error(errMsg);
	},
	(error: AxiosError<Result>) => {
		const { response, message, config } = error || {};
		const errMsg = response?.data?.message || message || t("sys.api.errorMessage");
		const isSilentCheck = config?.url?.includes("/auth/me");
		if (!isSilentCheck) {
			toast.error(errMsg, { id: "api-error" });
		}
		if (response?.status === 401) {
			userStore.getState().actions.clearUserInfoAndToken();
			if (!isSilentCheck && !window.location.pathname.startsWith("/auth/")) {
				window.location.href = "/auth/login";
			}
		}
		return Promise.reject(new Error(errMsg));
	},
);

class APIClient {
	get<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return this.request<T>({ ...config, method: "GET" });
	}
	post<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return this.request<T>({ ...config, method: "POST" });
	}
	put<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return this.request<T>({ ...config, method: "PUT" });
	}
	delete<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return this.request<T>({ ...config, method: "DELETE" });
	}
	request<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return axiosInstance.request(config) as Promise<T>;
	}
}

export default new APIClient();
