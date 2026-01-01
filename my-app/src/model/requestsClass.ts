import type { Track, RegisterRequest, LoginRequest, RegisterResponse, LoginResponse, FavoritesRequest, FavoritesResponse, ApiError } from '../../types';

const API_BASE_URL = 'http://localhost:8000/api';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        if (response.status === 403 || response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          if (window.location.hash !== '#/auth') window.location.hash = '#/auth';
        }
        let errorMessage = 'Произошла ошибка';
        try {
          const error: ApiError = await response.json();
          errorMessage = error.message || errorMessage;
        } catch {
          errorMessage = `Ошибка ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get('content-type');
      return contentType?.includes('application/json') ? response.json() : ({} as T);
    } catch (error) {
      if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
        throw new Error('Не удалось подключиться к серверу. Убедитесь, что бэкенд запущен на http://localhost:8000. Перейдите в папку express-backend и запустите команду npm start');
      }
      if (error instanceof Error && error.message.includes('ERR_CONNECTION_REFUSED')) {
        throw new Error('Сервер недоступен. Убедитесь, что бэкенд запущен на http://localhost:8000');
      }
      throw error;
    }
  }

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return this.request<RegisterResponse>('/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTracks(): Promise<Track[]> {
    return this.request<Track[]>('/tracks');
  }

  async getFavorites(): Promise<Track[]> {
    return this.request<Track[]>('/favorites');
  }

  async addToFavorites(data: FavoritesRequest): Promise<FavoritesResponse> {
    return this.request<FavoritesResponse>('/favorites', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async removeFromFavorites(data: FavoritesRequest): Promise<FavoritesResponse> {
    return this.request<FavoritesResponse>('/favorites', {
      method: 'DELETE',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient();

