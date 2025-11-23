import { el, mount } from 'redom';
import { appState } from '../../controller/HandleFunctionsClass';
import type { Component } from '../../controller/Routes';
import type { Track } from '../../../types';

export class FavouritePage implements Component {
  public el: HTMLElement;
  private tracksContainer: HTMLElement | null = null;
  private tracks: Track[] = [];

  constructor() {
    this.el = el('div', { class: 'favourite-page' });
    this.render();
    this.loadTracks();
    appState.subscribe('favoritesLoaded', () => this.loadTracks());
    appState.subscribe('favoritesChanged', () => this.loadTracks());
  }

  private async loadTracks(): Promise<void> {
    await appState.loadFavorites();
    this.tracks = appState.getFavorites();
    this.renderTracks();
  }

  private render(): void {
    this.el.innerHTML = '';

    const container = el('div', { class: 'favourite-page__container' });
    const title = el('h1', { class: 'favourite-page__title' }, 'Избранное');

    this.tracksContainer = el('div', { class: 'favourite-page__tracks' });

    mount(container, title);
    mount(container, this.tracksContainer);
    mount(this.el, container);
  }

  private renderTracks(): void {
    if (!this.tracksContainer) return;

    this.tracksContainer.innerHTML = '';

    if (this.tracks.length === 0) {
      const emptyMessage = el('div', { class: 'favourite-page__empty' }, 
        'В избранном пока нет треков'
      );
      mount(this.tracksContainer, emptyMessage);
      return;
    }

    this.tracks.forEach((track) => {
      const trackCard = this.createTrackCard(track);
      if (this.tracksContainer) {
        mount(this.tracksContainer, trackCard);
      }
    });
  }

  private createTrackCard(track: Track): HTMLElement {
    const card = el('div', { class: 'favourite-page__track-card' });

    const cover = el('div', { class: 'favourite-page__track-cover' });
    const coverPlaceholder = el('div', { class: 'favourite-page__track-cover-placeholder' });
    mount(cover, coverPlaceholder);

    const info = el('div', { class: 'favourite-page__track-info' });
    const title = el('h3', { class: 'favourite-page__track-title' }, track.title);
    const artist = el('p', { class: 'favourite-page__track-artist' }, track.artist);
    mount(info, title);
    mount(info, artist);

    const actions = el('div', { class: 'favourite-page__track-actions' });
    const playButton = el('button', {
      class: 'favourite-page__track-play',
      type: 'button',
      'aria-label': 'Воспроизвести',
    }, '▶');

    playButton.addEventListener('click', () => {
      appState.setCurrentTrack(track);
      appState.play();
    });

    const likeButton = el('button', {
      class: 'favourite-page__track-like favourite-page__track-like--liked',
      type: 'button',
      'aria-label': 'Убрать из избранного',
    });
    
    const heartIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg') as SVGElement;
    heartIcon.setAttribute('class', 'favourite-page__track-like-icon');
    heartIcon.setAttribute('width', '18');
    heartIcon.setAttribute('height', '18');
    heartIcon.setAttribute('viewBox', '0 0 24 24');
    heartIcon.setAttribute('fill', 'none');
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z');
    path.setAttribute('fill', 'currentColor');
    path.setAttribute('stroke', 'none');
    
    heartIcon.appendChild(path);
    (likeButton as HTMLElement).appendChild(heartIcon);

    likeButton.addEventListener('click', async () => {
      await appState.toggleFavorite(track.id);
    });

    mount(actions, playButton);
    mount(actions, likeButton);

    mount(card, cover);
    mount(card, info);
    mount(card, actions);

    return card;
  }

  update(): void {
    this.loadTracks();
  }
}

