import { el, mount } from 'redom';
import { appState } from '../../controller/HandleFunctionsClass';
import type { Component } from '../../controller/Routes';

export class AuthPage implements Component {
  public el: HTMLElement;
  private form: HTMLElement | null = null;
  private errorMessage: HTMLElement | null = null;
  private isLoginMode: boolean = true;

  constructor() {
    this.el = el('div', { class: 'auth-page' });
    this.render();
  }

  private render(): void {
    this.el.innerHTML = '';
    this.errorMessage = null;

    const container = el('div', { class: 'auth-page__container' });
    const card = el('div', { class: 'auth-page__card' });

    const title = el('h1', { class: 'auth-page__title' }, 
      this.isLoginMode ? 'Вход' : 'Регистрация'
    );

    const toggleButton = el('button', {
      class: 'auth-page__toggle',
      type: 'button',
    }, this.isLoginMode ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти');

    toggleButton.addEventListener('click', () => {
      this.isLoginMode = !this.isLoginMode;
      this.render();
    });

    this.form = el('form', { class: 'auth-page__form' });

    const usernameInput = el('input', {
      class: 'auth-page__input',
      type: 'text',
      placeholder: 'Имя пользователя',
      required: true,
      name: 'username',
    });

    const passwordInput = el('input', {
      class: 'auth-page__input',
      type: 'password',
      placeholder: 'Пароль',
      required: true,
      name: 'password',
    });

    const submitButton = el('button', {
      class: 'auth-page__submit',
      type: 'submit',
    }, this.isLoginMode ? 'Войти' : 'Зарегистрироваться');

    this.errorMessage = el('div', { class: 'auth-page__error' });

    this.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(this.form as HTMLFormElement);
      const username = formData.get('username') as string;
      const password = formData.get('password') as string;

      if (!username || !password) {
        if (this.errorMessage) {
          this.errorMessage.textContent = 'Пожалуйста, заполните все поля';
          this.errorMessage.style.display = 'block';
        }
        return;
      }

      if (this.errorMessage) {
        this.errorMessage.textContent = '';
        this.errorMessage.style.display = 'none';
      }

      submitButton.disabled = true;
      submitButton.textContent = this.isLoginMode ? 'Вход...' : 'Регистрация...';

      try {
        const result = this.isLoginMode
          ? await appState.login(username, password)
          : await appState.register(username, password);
        if (!result.success && this.errorMessage) {
          this.errorMessage.textContent = result.error || (this.isLoginMode ? 'Неверное имя пользователя или пароль' : 'Ошибка регистрации');
          this.errorMessage.style.display = 'block';
        }
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = this.isLoginMode ? 'Войти' : 'Зарегистрироваться';
      }
    });

    mount(this.form, usernameInput);
    mount(this.form, passwordInput);
    mount(this.form, submitButton);
    if (this.errorMessage) {
      mount(this.form, this.errorMessage);
    }

    mount(card, title);
    mount(card, toggleButton);
    mount(card, this.form);
    mount(container, card);
    mount(this.el, container);
  }

  update(): void {}
}

