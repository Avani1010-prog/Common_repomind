import axios from 'axios';

// In development use local backend; in production use deployed backend
const API_BASE_URL = import.meta.env.DEV
    ? 'http://localhost:5000/api'
    : (import.meta.env.VITE_API_URL || 'https://repomind-backend-fufh.onrender.com/api');

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 120000, // 120 seconds — split-repo clone can be slow
});

export const uploadZip = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/upload/zip', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        timeout: 120000,
    });

    return response.data;
};

export const uploadGithub = async (repoUrl) => {
    const response = await api.post('/upload/github', { repoUrl });
    return response.data;
};

export const uploadGithubSplit = async (frontendUrl, backendUrl) => {
    // Cloning 2 repos in parallel can be slow — use a longer timeout (5 min)
    const response = await api.post('/upload/github-split', { frontendUrl, backendUrl }, {
        timeout: 300000,
    });
    return response.data;
};

// Alias for backward compatibility
export const connectGithub = uploadGithub;

export const askQuestion = async (codebaseId, question, tags = []) => {
    const response = await api.post('/question/ask', {
        codebaseId,
        question,
        tags,
    });
    return response.data;
};

export const getHistory = async (codebaseId, search = '') => {
    const params = search ? { search } : {};
    const response = await api.get(`/history/${codebaseId}`, { params });
    return response.data;
};

export const getAllCodebases = async () => {
    const response = await api.get('/history');
    return response.data;
};

export const getHealth = async () => {
    const response = await api.get('/health');
    return response.data;
};

export const generateRefactor = async (code, language) => {
    const response = await api.post('/refactor', { code, language });
    return response.data;
};

export default api;
