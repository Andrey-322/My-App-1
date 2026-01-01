class LocalStorageManager {
  private readonly TOKEN_KEY = 'token';
  private readonly USERNAME_KEY = 'username';

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  setUsername(username: string): void {
    localStorage.setItem(this.USERNAME_KEY, username);
  }

  getUsername(): string | null {
    return localStorage.getItem(this.USERNAME_KEY);
  }

  removeUsername(): void {
    localStorage.removeItem(this.USERNAME_KEY);
  }

  clear(): void {
    this.removeToken();
    this.removeUsername();
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
}

export const storage = new LocalStorageManager();

