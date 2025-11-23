export interface Track {
  id: string;
  title: string;
  artist: string;
}

export interface User {
  username: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  user?: User;
}

export interface LoginResponse {
  message: string;
  token?: string;
}

export interface FavoritesRequest {
  trackId: string;
}

export interface FavoritesResponse {
  message: string;
}

export interface ApiError {
  message: string;
}

