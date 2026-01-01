import { el, mount } from 'redom';
import { appState } from '../../controller/HandleFunctionsClass';
import type { Component } from '../../controller/Routes';

type PlayerOptions = {
  trackTitle?: string;
  artist?: string;
  currentTime?: string;
  duration?: string;
  isPlaying?: boolean;
  volume?: number;
};

export class Player implements Component {
  public el: HTMLElement;
  private playButton: HTMLElement | null = null;
  private prevButton: HTMLElement | null = null;
  private nextButton: HTMLElement | null = null;
  private likeButton: HTMLElement | null = null;
  private progressBar: HTMLElement | null = null;
  private progressFill: HTMLElement | null = null;
  private currentTimeEl: HTMLElement | null = null;
  private durationEl: HTMLElement | null = null;
  private titleEl: HTMLElement | null = null;
  private artistEl: HTMLElement | null = null;
  private volumeSlider: HTMLElement | null = null;
  private volumeFill: HTMLElement | null = null;
  private volumeThumb: HTMLElement | null = null;
  private isDragging: boolean = false;

  constructor() {
    this.el = el('div', { class: 'app-player' });
    this.render();
    this.setupListeners();
    this.setupKeyboardListeners();
  }

  private render(): void {
    this.el.innerHTML = '';

    const leftSection = el('div', { class: 'app-player__left' });

    const coverWrapper = el('div', { class: 'app-player__cover' });
    const coverPlaceholder = el('div', { class: 'app-player__cover-placeholder' }, '♪');
    mount(coverWrapper, coverPlaceholder);

    const trackInfo = el('div', { class: 'app-player__track-info' });
    this.titleEl = el('span', { class: 'app-player__title' }, 'Выберите трек');
    this.artistEl = el('span', { class: 'app-player__artist' }, '');
    mount(trackInfo, this.titleEl);
    mount(trackInfo, this.artistEl);

    this.likeButton = el('button', {
      class: 'app-player__like',
      type: 'button',
      'aria-label': 'Добавить в избранное',
    });
    
    const heartIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg') as SVGElement;
    heartIcon.setAttribute('class', 'app-player__like-icon');
    heartIcon.setAttribute('width', '18');
    heartIcon.setAttribute('height', '18');
    heartIcon.setAttribute('viewBox', '0 0 24 24');
    heartIcon.setAttribute('fill', 'none');
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'currentColor');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    
    heartIcon.appendChild(path);
    (this.likeButton as HTMLElement).appendChild(heartIcon);

    this.likeButton.addEventListener('click', async () => {
      const track = appState.getCurrentTrack();
      if (track) {
        await appState.toggleFavorite(track.id);
        this.updateLikeButton();
      }
    });

    mount(leftSection, coverWrapper);
    mount(leftSection, trackInfo);
    mount(leftSection, this.likeButton);

    const centerSection = el('div', { class: 'app-player__center' });

    const controls = el('div', { class: 'app-player__controls' });

    const shuffleButton = el('button', {
      class: 'app-player__control',
      type: 'button',
      'aria-label': 'Перемешать',
    }, '⇄');

    this.prevButton = el('button', {
      class: 'app-player__control',
      type: 'button',
      'aria-label': 'Предыдущий трек',
    }, '⏮');

    this.prevButton.addEventListener('click', () => {
      appState.prevTrack();
    });

    this.playButton = el('button', {
      class: 'app-player__control app-player__control--play',
      type: 'button',
      'aria-label': 'Воспроизведение',
    }, '▶');

    this.playButton.addEventListener('click', () => {
      appState.togglePlay();
    });

    this.nextButton = el('button', {
      class: 'app-player__control',
      type: 'button',
      'aria-label': 'Следующий трек',
    }, '⏭');

    this.nextButton.addEventListener('click', () => {
      appState.nextTrack();
    });

    const repeatButton = el('button', {
      class: 'app-player__control',
      type: 'button',
      'aria-label': 'Повтор',
    }, '↻');

    mount(controls, shuffleButton);
    mount(controls, this.prevButton);
    mount(controls, this.playButton);
    mount(controls, this.nextButton);
    mount(controls, repeatButton);

    const progress = el('div', { class: 'app-player__progress' });

    this.progressBar = el('div', { class: 'app-player__progress-bar' });
    this.progressFill = el('div', { class: 'app-player__progress-fill' });
    mount(this.progressBar, this.progressFill);

    this.progressBar.addEventListener('click', (e) => {
      if (this.progressBar) {
        const rect = this.progressBar.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        const duration = appState.getDuration();
        appState.seekTo(percentage * duration);
      }
    });

    const progressTime = el('div', { class: 'app-player__progress-time' });
    this.currentTimeEl = el('span', {}, '0:00');
    this.durationEl = el('span', {}, '0:00');
    const separator = el('span', {}, '/');
    mount(progressTime, this.currentTimeEl);
    mount(progressTime, separator);
    mount(progressTime, this.durationEl);

    mount(progress, this.progressBar);
    mount(progress, progressTime);

    mount(centerSection, controls);
    mount(centerSection, progress);

    const rightSection = el('div', { class: 'app-player__right' });

    const volumeControl = el('div', { class: 'app-player__volume' });

    // Создаем SVG иконку динамика с волнами
    const volumeIcon = el('svg', {
      class: 'app-player__volume-icon',
      width: '20',
      height: '20',
      viewBox: '0 0 24 24',
      fill: 'none',
      'aria-hidden': 'true',
    });
    volumeIcon.innerHTML = `
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" fill="#9CA3AF"/>
    `;

    this.volumeSlider = el('div', { class: 'app-player__volume-slider' });
    this.volumeFill = el('div', { class: 'app-player__volume-fill' });
    this.volumeThumb = el('div', { class: 'app-player__volume-thumb' });
    
    mount(this.volumeSlider, this.volumeFill);
    mount(this.volumeSlider, this.volumeThumb);

    // Обработчик клика на слайдере
    this.volumeSlider.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      // Игнорируем клик на thumb, так как он обрабатывается отдельно
      if (!this.isDragging && target !== this.volumeThumb && this.volumeSlider) {
        this.handleVolumeChange(e);
      }
    });

    // Обработчики для drag and drop
    this.volumeThumb.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.isDragging = true;
      document.addEventListener('mousemove', this.handleVolumeDrag);
      document.addEventListener('mouseup', this.handleVolumeDragEnd);
    });

    this.volumeSlider.addEventListener('mousedown', (e) => {
      const target = e.target as HTMLElement;
      // Не начинаем перетаскивание, если кликнули на thumb (он сам обработает)
      if (target !== this.volumeThumb) {
        this.isDragging = true;
        this.handleVolumeChange(e);
        document.addEventListener('mousemove', this.handleVolumeDrag);
        document.addEventListener('mouseup', this.handleVolumeDragEnd);
      }
    });

    mount(volumeControl, volumeIcon);
    mount(volumeControl, this.volumeSlider);
    mount(rightSection, volumeControl);

    mount(this.el, leftSection);
    mount(this.el, centerSection);
    mount(this.el, rightSection);

    // Устанавливаем начальную позицию слайдера
    this.updateVolume();
  }

  private setupListeners(): void {
    appState.subscribe('trackChanged', () => this.updateTrack());
    appState.subscribe('play', () => this.updatePlayButton());
    appState.subscribe('pause', () => this.updatePlayButton());
    appState.subscribe('timeupdate', () => this.updateTime());
    appState.subscribe('loadedmetadata', () => this.updateTime());
    appState.subscribe('volumeChanged', () => this.updateVolume());
    appState.subscribe('favoritesChanged', () => this.updateLikeButton());
  }

  private setupKeyboardListeners(): void {
    document.addEventListener('keydown', (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          appState.togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          appState.seekBackward();
          break;
        case 'ArrowRight':
          e.preventDefault();
          appState.seekForward();
          break;
        case 'ArrowUp':
          e.preventDefault();
          appState.setVolume(Math.min(100, appState.getVolume() + 10));
          this.updateVolume();
          break;
        case 'ArrowDown':
          e.preventDefault();
          appState.setVolume(Math.max(0, appState.getVolume() - 10));
          this.updateVolume();
          break;
      }
    });
  }

  private updateTrack(): void {
    const track = appState.getCurrentTrack();
    if (track && this.titleEl && this.artistEl) {
      this.titleEl.textContent = track.title;
      this.artistEl.textContent = track.artist;
    }
    this.updateLikeButton();
  }

  private updatePlayButton(): void {
    if (this.playButton) {
      const isPlaying = appState.getIsPlaying();
      this.playButton.textContent = isPlaying ? '⏸' : '▶';
      this.playButton.setAttribute('aria-label', isPlaying ? 'Пауза' : 'Воспроизведение');
    }
  }

  private updateTime(): void {
    const currentTime = appState.getCurrentTime();
    const duration = appState.getDuration();
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    if (this.progressFill) {
      this.progressFill.style.width = `${progress}%`;
    }

    if (this.currentTimeEl) {
      this.currentTimeEl.textContent = this.formatTime(currentTime);
    }

    if (this.durationEl) {
      this.durationEl.textContent = this.formatTime(duration);
    }
  }

  private updateVolume(): void {
    const volume = appState.getVolume();
    if (this.volumeFill) {
      this.volumeFill.style.width = `${volume}%`;
    }
    if (this.volumeThumb) {
      this.volumeThumb.style.left = `${volume}%`;
    }
  }

  private handleVolumeChange(e: MouseEvent): void {
    if (this.volumeSlider) {
      const rect = this.volumeSlider.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      appState.setVolume(percentage);
      this.updateVolume();
    }
  }

  private handleVolumeDrag = (e: MouseEvent): void => {
    if (this.isDragging) {
      this.handleVolumeChange(e);
    }
  };

  private handleVolumeDragEnd = (): void => {
    this.isDragging = false;
    document.removeEventListener('mousemove', this.handleVolumeDrag);
    document.removeEventListener('mouseup', this.handleVolumeDragEnd);
  };

  private updateLikeButton(): void {
    const track = appState.getCurrentTrack();
    if (track && this.likeButton) {
      const isFavorite = appState.isFavorite(track.id);
      this.likeButton.className = isFavorite
        ? 'app-player__like app-player__like--liked'
        : 'app-player__like';
      this.likeButton.setAttribute(
        'aria-label',
        isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'
      );
    }
  }

  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  update(): void {
    this.updateTrack();
    this.updatePlayButton();
    this.updateTime();
    this.updateVolume();
    this.updateLikeButton();
  }
}
