import { apiClient } from '../model/requestsClass';
import { storage } from '../model/localStorageClass';
import { router } from './Routes';
import type { Track } from '../../types';

export class AppState {
  private currentTrack: Track | null = null;
  private tracks: Track[] = [];
  private favorites: Track[] = [];
  private currentTrackIndex: number = -1;
  private audioElement: HTMLAudioElement | null = null;
  private isPlaying: boolean = false;
  private currentTime: number = 0;
  private duration: number = 0;
  private volume: number = 50;
  private listeners: Map<string, Set<() => void>> = new Map();

  constructor() {
    this.audioElement = new Audio();
    this.audioElement.volume = this.volume / 100;
    this.setupAudioListeners();
  }

  private setupAudioListeners(): void {
    if (!this.audioElement) return;

    this.audioElement.addEventListener('timeupdate', () => {
      this.currentTime = this.audioElement?.currentTime || 0;
      this.notify('timeupdate');
    });

    this.audioElement.addEventListener('loadedmetadata', () => {
      this.duration = this.audioElement?.duration || 0;
      this.notify('loadedmetadata');
    });

    this.audioElement.addEventListener('ended', () => {
      this.nextTrack();
    });

    this.audioElement.addEventListener('play', () => {
      this.isPlaying = true;
      this.notify('play');
    });

    this.audioElement.addEventListener('pause', () => {
      this.isPlaying = false;
      this.notify('pause');
    });

    this.audioElement.addEventListener('error', (e) => {
      console.error('Audio error:', e);
      this.isPlaying = false;
      this.notify('pause');
    });
  }

  subscribe(event: string, callback: () => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  unsubscribe(event: string, callback: () => void): void {
    this.listeners.get(event)?.delete(callback);
  }

  private notify(event: string): void {
    this.listeners.get(event)?.forEach((callback) => callback());
  }

  async loadTracks(): Promise<void> {
    if (!storage.getToken()) {
      router.navigate('/auth');
      return;
    }
    try {
      this.tracks = await apiClient.getTracks();
      this.notify('tracksLoaded');
    } catch (error) {
      if (error instanceof Error && /403|401|Неверный токен/.test(error.message)) {
        router.navigate('/auth');
      }
    }
  }

  async loadFavorites(): Promise<void> {
    if (!storage.getToken()) return;
    try {
      this.favorites = await apiClient.getFavorites();
      this.notify('favoritesLoaded');
    } catch (error) {
      if (error instanceof Error && /403|401|Неверный токен/.test(error.message)) {
        router.navigate('/auth');
      }
    }
  }

  getTracks(): Track[] {
    return this.tracks;
  }

  getFavorites(): Track[] {
    return this.favorites;
  }

  getCurrentTrack(): Track | null {
    return this.currentTrack;
  }

  setCurrentTrack(track: Track): void {
    this.currentTrack = track;
    this.currentTrackIndex = this.tracks.findIndex((t) => t.id === track.id);
    if (this.audioElement) {
      this.currentTime = 0;
      this.duration = 0;
      this.isPlaying = false;
      this.audioElement.src = `http://localhost:8000/api/tracks/${track.id}/audio`;
      this.audioElement.crossOrigin = 'anonymous';
      this.audioElement.load();
    }
    this.notify('trackChanged');
  }

  async play(): Promise<void> {
    if (!this.audioElement) return;
    try {
      await this.audioElement.play();
      this.isPlaying = true;
    } catch {
      this.isPlaying = false;
      this.notify('pause');
    }
  }

  pause(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.isPlaying = false;
    }
  }

  togglePlay(): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  nextTrack(): void {
    if (this.currentTrackIndex < this.tracks.length - 1) {
      this.setCurrentTrack(this.tracks[this.currentTrackIndex + 1]);
      this.play();
    }
  }

  prevTrack(): void {
    if (this.currentTrackIndex > 0) {
      this.setCurrentTrack(this.tracks[this.currentTrackIndex - 1]);
      this.play();
    }
  }

  seekTo(seconds: number): void {
    if (this.audioElement) {
      this.audioElement.currentTime = seconds;
    }
  }

  seekForward(): void {
    if (this.audioElement) {
      this.audioElement.currentTime = Math.min(
        this.audioElement.currentTime + 10,
        this.duration
      );
    }
  }

  seekBackward(): void {
    if (this.audioElement) {
      this.audioElement.currentTime = Math.max(
        this.audioElement.currentTime - 10,
        0
      );
    }
  }

  setVolume(volume: number): void {
    this.volume = volume;
    if (this.audioElement) {
      this.audioElement.volume = volume / 100;
    }
    this.notify('volumeChanged');
  }

  getVolume(): number {
    return this.volume;
  }

  getCurrentTime(): number {
    return this.currentTime;
  }

  getDuration(): number {
    return this.duration;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  isFavorite(trackId: string): boolean {
    return this.favorites.some((t) => t.id === trackId);
  }

  async toggleFavorite(trackId: string): Promise<void> {
    try {
      this.isFavorite(trackId)
        ? await apiClient.removeFromFavorites({ trackId })
        : await apiClient.addToFavorites({ trackId });
      await this.loadFavorites();
      this.notify('favoritesChanged');
    } catch {}
  }


  async login(username: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await apiClient.login({ username, password });
      if (!response.token) {
        return { success: false, error: 'Токен не получен от сервера' };
      }
      storage.setToken(response.token);
      storage.setUsername(username);
      await this.loadTracks();
      router.navigate('/tracks');
      window.dispatchEvent(new HashChangeEvent('hashchange'));
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Ошибка входа' };
    }
  }

  async register(username: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      await apiClient.register({ username, password });
      return await this.login(username, password);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Ошибка регистрации' };
    }
  }

  logout(): void {
    storage.clear();
    router.navigate('/auth');
  }
}

export const appState = new AppState();

