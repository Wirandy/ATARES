export interface User {
    id: number;
    email: string;
    name: string;
    passwordHash?: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface LoginResponse {
    success: boolean;
    token: string;
    user: User;
    redirectTo?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    name: string;
    email: string;
    phoneNumber: string;  // ✅ TAMBAH INI
    password: string;
}
