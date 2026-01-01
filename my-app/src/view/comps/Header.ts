import { el, mount } from 'redom';
import { router } from '../../controller/Routes';
import { storage } from '../../model/localStorageClass';
import type { Component } from '../../controller/Routes';
import logoIconSrc from '../../icon/logo-icon.png';
import searchIconSrc from '../../icon/search-icon.png';
import chevronIconSrc from '../../icon/chevron-icon.png';

type HeaderOptions = {
  username?: string;
  userInitials?: string;
};

export class Header implements Component {
  public el: HTMLElement;
  private usernameEl: HTMLElement | null = null;
  private avatarEl: HTMLElement | null = null;
  private profileMenu: HTMLElement | null = null;
  private isMenuOpen: boolean = false;

  constructor(options: HeaderOptions = {}) {
    this.el = el('header', { class: 'app-header' });
    this.render(options);
  }

  private render(options: HeaderOptions): void {
    this.el.innerHTML = '';
    const username = options.username || storage.getUsername() || 'Пользователь';
    const userInitials = options.userInitials || username.charAt(0).toUpperCase();

    const logoWrapper = el('a', {
      class: 'app-header__logo',
      href: '#tracks',
    });

    logoWrapper.addEventListener('click', (e: Event) => {
      e.preventDefault();
      router.navigate('/tracks');
    });

    const logoImg = el('img', { class: 'app-header__logo-image', src: logoIconSrc, alt: '' });
    mount(logoWrapper, logoImg);

    const searchLabel = el('label', {
      class: 'app-header__search',
      'aria-label': 'Поиск по сайту',
    });

    const searchIcon = el('img', {
      class: 'app-header__search-icon',
      src: searchIconSrc,
      alt: '',
      'aria-hidden': 'true',
    });

    const searchInput = el('input', {
      class: 'app-header__search-input',
      type: 'search',
      placeholder: 'Что будем искать?',
    });

    mount(searchLabel, searchIcon);
    mount(searchLabel, searchInput);

    const profileButton = el('button', {
      class: 'app-header__profile',
      type: 'button',
      'aria-haspopup': 'menu',
    });

    this.avatarEl = el('span', { class: 'app-header__avatar' }, userInitials);
    this.usernameEl = el('span', { class: 'app-header__username' }, username);

    const chevron = el('img', {
      class: 'app-header__chevron',
      src: chevronIconSrc,
      alt: '',
      'aria-hidden': 'true',
    });

    profileButton.addEventListener('click', () => {
      this.toggleMenu();
    });

    mount(profileButton, this.avatarEl);
    mount(profileButton, this.usernameEl);
    mount(profileButton, chevron);

    this.profileMenu = el('div', { class: 'app-header__menu' });
    const profileMenuItem = el('button', {
      class: 'app-header__menu-item',
      type: 'button',
    }, 'Профиль');

    profileMenuItem.addEventListener('click', () => {
      router.navigate('/profile');
      this.toggleMenu();
    });

    mount(this.profileMenu, profileMenuItem);

    mount(this.el, logoWrapper);
    mount(this.el, searchLabel);
    mount(this.el, profileButton);
    mount(this.el, this.profileMenu);

    document.addEventListener('click', (e) => {
      if (this.isMenuOpen && !this.el.contains(e.target as Node)) {
        this.toggleMenu();
      }
    });
  }

  private toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    if (this.profileMenu) {
      this.profileMenu.classList.toggle('app-header__menu--open', this.isMenuOpen);
    }
  }

  update(options?: HeaderOptions): void {
    if (options) this.render(options);
  }
}
