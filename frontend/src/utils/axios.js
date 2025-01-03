import axios from 'axios';
import Cookies from 'js-cookie';

import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: CONFIG.site.serverUrl, withCredentials: true });

const fetchCsrfToken = async () => {
  try {
    let csrfToken = Cookies.get('XSRF-TOKEN');
    const response = await axios.get(`${CONFIG.site.serverUrl}/csrf-token`, {
      withCredentials: true,
    });
    // Use destructuring to extract csrfToken from response.data
    const { csrfToken: token } = response.data;
    csrfToken = token;
    // Store the token in cookies
    Cookies.set('XSRF-TOKEN', csrfToken, { secure: false, sameSite: 'lax' });
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    throw error;
  }
};

axiosInstance.interceptors.request.use(
  async (config) => {
    let csrfToken = Cookies.get('XSRF-TOKEN');
    // Fetch the CSRF token if it's missing
    if (config.url === '/auth/verify-session') {
      csrfToken = await fetchCsrfToken();
    }
    // Exclude GET, HEAD, OPTIONS requests from CSRF token requirement
    if (!['get', 'head', 'options'].includes(config.method) && csrfToken) {
      // Add CSRF token to request headers
      config.headers['x-csrf-token'] = csrfToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong!')
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args) => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args];

    const res = await axiosInstance.get(url, { ...config });

    return res.data;
  } catch (error) {
    console.error('Failed to fetch:', error);
    throw error;
  }
};

// ----------------------------------------------------------------------

export const endpoints = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: {
    me: '/auth/verify-session',
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    logout: '/auth/logout',
  },
  mail: {
    verify: '/verify',
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  list: {
    verifySingle: "lists/validate-single",
    startBulkVerification: "lists/validate-bulk",
    getStatus: "lists/get-status",
    upload: "/lists",
    get: "/lists",
    delete: "/lists",
    chart: "/lists/stats",
    download: "/lists/download"
  },
  post: {
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  get: {
    list: '/lists/single',
    lists: '/lists',
    chart: '/lists/chart',
    verify: '/verify',
    bulk: '/verify/bulk',
    status: '/verify/status',
    download: '/verify/download',
    credits: '/users/credit',
    timeZone: '/users/time-zone',
    details: '/api/get/details',
    search: '/api/get/search',
  },
  delete: {
    list: '/lists',
  },
  product: {
    list: '/api/product/list',
    details: '/api/product/details',
    search: '/api/product/search',
  },
  credit: {
    getBalance: "credits/balance",
    getHistory: "credits/history"
  },
  timeZone: {
    get: "/time-zone/country",
    save: "/time-zone/save"
  }
}


// ... other endpoints};
