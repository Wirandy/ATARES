export interface AnalysisResult {
    id: string;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    imageUrl: string;
    createdAt: string;
    detections?: Detection[];
    recommendations?: Recommendation[];
}

export interface Detection {
    label: string; // e.g., 'acne', 'blackhead'
    confidence: number;
    box: [number, number, number, number]; // [x, y, width, height]
}

export interface Recommendation {
    title: string;
    description: string;
    products?: string[];
}

export interface UploadResponse {
    analysisId: string;
    status: string;
}
