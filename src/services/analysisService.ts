import api from './api';
import { AnalysisResult, UploadResponse } from '@/types/analysis';

export const analysisService = {
    uploadImage: async (file: File): Promise<UploadResponse> => {
        const formData = new FormData();
        formData.append('image', file);

        const response = await api.post<UploadResponse>('/analysis/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    getStatus: async (id: string): Promise<AnalysisResult> => {
        const response = await api.get<AnalysisResult>(`/analysis/${id}/status`);
        return response.data;
    },

    getResult: async (id: string): Promise<AnalysisResult> => {
        const response = await api.get<AnalysisResult>(`/analysis/${id}/result`);
        return response.data;
    },
};
