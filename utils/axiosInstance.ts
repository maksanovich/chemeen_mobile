import axios from 'axios';
import { store } from '@/store';
import { setAlert } from '@/store/reducers/alert';
import { EXPO_PUBLIC_API_KEY, EXPO_PUBLIC_API_URL } from '@/config';

const axiosInstance = axios.create({
  baseURL: EXPO_PUBLIC_API_URL,
  timeout: 60000, // 60 seconds for large file downloads
  maxContentLength: 20 * 1024 * 1024, // 20MB max response size
  maxBodyLength: 20 * 1024 * 1024, // 20MB max request size
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = EXPO_PUBLIC_API_KEY;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error?.response?.status === 409) {
      const errorMessage = error.response?.data?.message || 'This data already exists in the system.';
      store.dispatch(setAlert({
        kind: 2, // toast
        type: 1, // warning
        title: 'Duplicate Data',
        message: errorMessage,
        url: ''
      }));
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
