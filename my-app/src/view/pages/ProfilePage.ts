import { el, mount } from 'redom';
import { appState } from '../../controller/HandleFunctionsClass';
import { storage } from '../../model/localStorageClass';
import { router } from '../../controller/Routes';
import type { Component } from '../../controller/Routes';

export class ProfilePage implements Component {
  public el: HTMLElement;

  constructor() {
    this.el = el('div', { class: 'profile-page' });
    this.render();
  }

  private render(): void {
    this.el.innerHTML = '';

    const container = el('div', { class: 'profile-page__container' });
    const card = el('div', { class: 'profile-page__card' });

    const avatar = el('div', { class: 'profile-page__avatar' });
    const avatarPlaceholder = el('div', { class: 'profile-page__avatar-placeholder' });
    const username = storage.getUsername() || 'Пользователь';
    const initials = username.charAt(0).toUpperCase();
    avatarPlaceholder.textContent = initials;
    mount(avatar, avatarPlaceholder);

    const info = el('div', { class: 'profile-page__info' });
    const usernameEl = el('h2', { class: 'profile-page__username' }, username);
    const emailEl = el('p', { class: 'profile-page__email' }, 'email@example.com');

    mount(info, usernameEl);
    mount(info, emailEl);

    const logoutButton = el('button', {
      class: 'profile-page__logout',
      type: 'button',
    }, 'Выйти');

    logoutButton.addEventListener('click', () => {
      appState.logout();
    });

    mount(card, avatar);
    mount(card, info);
    mount(card, logoutButton);
    mount(container, card);
    mount(this.el, container);
  }

  update(): void {
    this.render();
  }
}

