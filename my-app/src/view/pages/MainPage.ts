import { el, mount } from 'redom';
import { appState } from '../../controller/HandleFunctionsClass';
import { storage } from '../../model/localStorageClass';
import type { Component } from '../../controller/Routes';
import type { Track } from '../../../types';

export class MainPage implements Component {
  public el: HTMLElement;
  private tableBody: HTMLElement | null = null;
  private tracks: Track[] = [];
  private currentPage: number = 1;
  private itemsPerPage: number = 10;
  private paginationContainer: HTMLElement | null = null;
  private isLoading: boolean = false;

  constructor() {
    this.el = el('div', { class: 'app-main' });
    this.render();
    this.loadTracks();
    this.setupIntersectionObserver();
    appState.subscribe('tracksLoaded', () => this.renderTracks());
    appState.subscribe('favoritesChanged', () => this.renderTracks());
    appState.subscribe('favoritesLoaded', () => this.renderTracks());
  }

  private async loadTracks(): Promise<void> {
    if (this.isLoading || !storage.isAuthenticated()) {
      this.renderTracks();
      return;
    }
    this.isLoading = true;
    try {
      await appState.loadTracks();
      this.tracks = appState.getTracks();
      await appState.loadFavorites();
      this.renderTracks();
    } finally {
      this.isLoading = false;
    }
  }

  private render(): void {
    this.el.innerHTML = '';

    const title = el('h1', { class: 'app-main__title' }, 'Аудифайлы и треки');

    const table = el('div', { class: 'app-main__table' });

    const tableHeader = el('div', { class: 'app-main__table-header' });

    const headerNumber = el('span', { class: 'app-main__table-header-cell' }, '№');
    const headerName = el('span', { class: 'app-main__table-header-cell' }, 'НАЗВАНИЕ');
    const headerAlbum = el('span', { class: 'app-main__table-header-cell' }, 'АЛЬБОМ');
    const headerDate = el('span', {
      class: 'app-main__table-header-cell app-main__table-header-cell--icon app-main__table-header-cell--date',
      'aria-label': 'Дата',
    });
    const headerActions = el('span', {
      class: 'app-main__table-header-cell app-main__table-header-cell--icon app-main__table-header-cell--duration',
      'aria-label': 'Длительность',
    });

    mount(tableHeader, headerNumber);
    mount(tableHeader, headerName);
    mount(tableHeader, headerAlbum);
    mount(tableHeader, headerDate);
    mount(tableHeader, headerActions);

    this.tableBody = el('div', { class: 'app-main__table-body' });

    mount(table, tableHeader);
    mount(table, this.tableBody);

    this.paginationContainer = el('div', { class: 'app-main__pagination' });

    mount(this.el, title);
    mount(this.el, table);
    mount(this.el, this.paginationContainer);
  }

  private renderTracks(): void {
    if (!this.tableBody) return;

    const tableBody = this.tableBody;
    tableBody.innerHTML = '';

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const pageTracks = this.tracks.slice(startIndex, endIndex);

    if (pageTracks.length === 0) {
      const emptyMessage = el('div', { class: 'app-main__empty' }, 'Треки не найдены');
      mount(tableBody, emptyMessage);
      return;
    }

    pageTracks.forEach((track, index) => {
      const row = this.createTrackRow(track, startIndex + index + 1);
      mount(tableBody, row);
    });

    this.renderPagination();
  }

  private createTrackRow(track: Track, number: number): HTMLElement {
    const row = el('div', { class: 'app-main__table-row' });

    const numberCell = el('span', { class: 'app-main__table-cell' }, String(number));

    const nameCell = el('div', { class: 'app-main__table-cell app-main__table-cell--name' });

    const coverWrapper = el('div', { class: 'app-main__table-cover' });
    const coverPlaceholder = el('div', { class: 'app-main__table-cover-placeholder' }, '♪');
    mount(coverWrapper, coverPlaceholder);

    const trackInfo = el('div', { class: 'app-main__table-track-info' });
    const trackTitle = el('span', { class: 'app-main__table-track-title' }, track.title);
    const trackArtist = el('span', { class: 'app-main__table-track-artist' }, track.artist);
    mount(trackInfo, trackTitle);
    mount(trackInfo, trackArtist);

    mount(nameCell, coverWrapper);
    mount(nameCell, trackInfo);

    const albumCell = el('span', { class: 'app-main__table-cell' }, '-');

    const dateCell = el('span', { class: 'app-main__table-cell' }, '-');

    const actionsCell = el('div', { class: 'app-main__table-cell app-main__table-cell--actions' });

    const isFavorite = appState.isFavorite(track.id);
    const likeButton = el('button', {
      class: `app-main__table-action app-main__table-action--like ${isFavorite ? 'app-main__table-action--liked' : ''}`,
      type: 'button',
      'aria-label': isFavorite ? 'Убрать из избранного' : 'Добавить в избранное',
    });
    
    const heartIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg') as SVGElement;
    heartIcon.setAttribute('class', 'app-main__table-action-icon');
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
    (likeButton as HTMLElement).appendChild(heartIcon);

    likeButton.addEventListener('click', async () => {
      await appState.toggleFavorite(track.id);
    });

    const durationCell = el('span', { class: 'app-main__table-cell' }, '-');

    const menuButton = el('button', {
      class: 'app-main__table-action app-main__table-action--menu',
      type: 'button',
      'aria-label': 'Меню',
    }, '⋮');

    mount(actionsCell, likeButton);
    mount(actionsCell, durationCell);
    mount(actionsCell, menuButton);

    mount(row, numberCell);
    mount(row, nameCell);
    mount(row, albumCell);
    mount(row, dateCell);
    mount(row, actionsCell);

    row.addEventListener('click', (e) => {
      // Не воспроизводим при клике на кнопки
      if ((e.target as HTMLElement).closest('button')) {
        return;
      }
      appState.setCurrentTrack(track);
      appState.play();
    });

    return row;
  }

  private renderPagination(): void {
    if (!this.paginationContainer) return;

    this.paginationContainer.innerHTML = '';

    const totalPages = Math.ceil(this.tracks.length / this.itemsPerPage);

    if (totalPages <= 1) return;

    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      const loadMoreButton = el('button', {
        class: 'app-main__load-more',
        type: 'button',
      }, 'Загрузить еще');

      if (this.currentPage < totalPages) {
        loadMoreButton.addEventListener('click', () => {
          this.currentPage++;
          this.loadMoreTracks();
        });
        mount(this.paginationContainer, loadMoreButton);
      }
    } else {
      const pagination = el('div', { class: 'app-main__pagination-controls' });

      if (this.currentPage > 1) {
        const prevButton = el('button', {
          class: 'app-main__pagination-button',
          type: 'button',
        }, '‹');
        prevButton.addEventListener('click', () => {
          this.currentPage--;
          this.renderTracks();
        });
        mount(pagination, prevButton);
      }

      for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
          const pageButton = el('button', {
            class: `app-main__pagination-button ${i === this.currentPage ? 'app-main__pagination-button--active' : ''}`,
            type: 'button',
          }, String(i));
          pageButton.addEventListener('click', () => {
            this.currentPage = i;
            this.renderTracks();
          });
          mount(pagination, pageButton);
        } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
          const ellipsis = el('span', { class: 'app-main__pagination-ellipsis' }, '...');
          mount(pagination, ellipsis);
        }
      }

      if (this.currentPage < totalPages) {
        const nextButton = el('button', {
          class: 'app-main__pagination-button',
          type: 'button',
        }, '›');
        nextButton.addEventListener('click', () => {
          this.currentPage++;
          this.renderTracks();
        });
        mount(pagination, nextButton);
      }

      mount(this.paginationContainer, pagination);
    }
  }

  private loadMoreTracks(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const pageTracks = this.tracks.slice(startIndex, endIndex);

    pageTracks.forEach((track, index) => {
      const row = this.createTrackRow(track, startIndex + index + 1);
      if (this.tableBody) {
        mount(this.tableBody, row);
      }
    });

    this.renderPagination();
  }

  private setupIntersectionObserver(): void {
    if (window.innerWidth > 768) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !this.isLoading) {
          const totalPages = Math.ceil(this.tracks.length / this.itemsPerPage);
          if (this.currentPage < totalPages) {
            this.currentPage++;
            this.loadMoreTracks();
          }
        }
      });
    });

    const sentinel = el('div', { class: 'app-main__sentinel' });
    mount(this.el, sentinel);
    observer.observe(sentinel);
  }

  update(): void {
    this.loadTracks();
  }
}
