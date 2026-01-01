import { el, mount } from 'redom';
import { router } from '../../controller/Routes';
import type { Component } from '../../controller/Routes';
import musicNotesIconSrc from '../../icon/music-notes-icon.png';

type SideOptions = {
  activeItem?: 'favorites' | 'tracks';
};

export class Side implements Component {
  public el: HTMLElement;
  private favoritesItem: HTMLElement | null = null;
  private tracksItem: HTMLElement | null = null;

  constructor(options: SideOptions = {}) {
    this.el = el('aside', { class: 'app-side' });
    this.render(options);
    this.setupListeners();
  }

  private render(options: SideOptions): void {
    this.el.innerHTML = '';

    const activeItem = options.activeItem || 'tracks';

    this.favoritesItem = el('a', {
      class: `app-side__item ${activeItem === 'favorites' ? 'app-side__item--active' : ''}`,
      href: '#favorites',
    });

    this.favoritesItem.addEventListener('click', (e) => {
      e.preventDefault();
      router.navigate('/favorites');
    });

    const favoritesIcon = el('img', {
      class: 'app-side__icon',
      src: musicNotesIconSrc,
      alt: '',
    });

    const favoritesText = el('span', { class: 'app-side__text' }, 'Избранное');

    mount(this.favoritesItem, favoritesIcon);
    mount(this.favoritesItem, favoritesText);

    this.tracksItem = el('a', {
      class: `app-side__item ${activeItem === 'tracks' ? 'app-side__item--active' : ''}`,
      href: '#tracks',
    });

    this.tracksItem.addEventListener('click', (e) => {
      e.preventDefault();
      router.navigate('/tracks');
    });

    const tracksIcon = el('img', {
      class: 'app-side__icon',
      src: musicNotesIconSrc,
      alt: '',
    });

    const tracksText = el('span', { class: 'app-side__text' }, 'Аудиокомпозиции');

    mount(this.tracksItem, tracksIcon);
    mount(this.tracksItem, tracksText);

    mount(this.el, this.favoritesItem);
    mount(this.el, this.tracksItem);
  }

  private setupListeners(): void {
    window.addEventListener('hashchange', () => {
      const path = window.location.hash.slice(1) || '/tracks';
      this.updateActiveItem(path);
    });
  }

  private updateActiveItem(path: string): void {
    if (!this.favoritesItem || !this.tracksItem) return;
    const isFavorites = path === '/favorites';
    this.favoritesItem.classList.toggle('app-side__item--active', isFavorites);
    this.tracksItem.classList.toggle('app-side__item--active', !isFavorites);
  }

  update(options?: SideOptions): void {
    if (options) this.render(options);
  }
}
