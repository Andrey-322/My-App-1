import './src/styles/pages/main.css';
import './src/styles/pages/main-page.css';
import './src/styles/pages/auth.css';
import './src/styles/pages/favorite.css';
import './src/styles/pages/profile.css';
import './src/styles/comps/header.css';
import './src/styles/comps/side.css';
import './src/styles/comps/player.css';

import { Header } from './src/view/comps/Header';
import { Side } from './src/view/comps/Side';
import { Player } from './src/view/comps/Player';
import { MainPage } from './src/view/pages/MainPage';
import { FavouritePage } from './src/view/pages/FavouritePage';
import { AuthPage } from './src/view/pages/AuthPage';
import { ProfilePage } from './src/view/pages/ProfilePage';
import { router } from './src/controller/Routes';
import { storage } from './src/model/localStorageClass';
import { appState } from './src/controller/HandleFunctionsClass';
import type { Route } from './src/controller/Routes';

const routes: Route[] = [
  { path: '/auth', component: () => new AuthPage(), requiresAuth: false },
  { path: '/tracks', component: () => new MainPage(), requiresAuth: true },
  { path: '/favorites', component: () => new FavouritePage(), requiresAuth: true },
  { path: '/profile', component: () => new ProfilePage(), requiresAuth: true },
];

const updateUI = (root: HTMLElement, content: HTMLElement, mainContainer: HTMLElement, header: Header, side: Side, player: Player) => {
  const isAuth = storage.isAuthenticated();
  
  if (isAuth && !content.contains(side.el)) {
    content.innerHTML = '';
    content.append(side.el, mainContainer);
    if (!root.contains(content)) root.appendChild(content);
    if (!root.contains(header.el)) root.insertBefore(header.el, content);
    if (!root.contains(player.el)) root.appendChild(player.el);
    header.update({
      username: storage.getUsername() || undefined,
      userInitials: storage.getUsername()?.charAt(0).toUpperCase() || 'U',
    });
  } else if (!isAuth && content.contains(side.el)) {
    content.innerHTML = '';
    content.appendChild(mainContainer);
    if (!root.contains(content)) root.appendChild(content);
    if (root.contains(header.el)) header.el.remove();
    if (root.contains(player.el)) player.el.remove();
  } else if (!isAuth && !root.contains(content)) {
    root.appendChild(content);
  }
};

const initApp = () => {
  const root = document.getElementById('app') ?? document.body;
  root.className = 'app-root';

  const header = new Header({
    username: storage.getUsername() || undefined,
    userInitials: storage.getUsername()?.charAt(0).toUpperCase() || 'U',
  });
  const side = new Side({ activeItem: 'tracks' });
  const player = new Player();
  const content = document.createElement('div');
  content.className = 'app-content';
  const mainContainer = document.createElement('div');
  mainContainer.className = 'app-main-container';

  router.register(routes);
  router.setRoot(mainContainer);
  router.navigate(storage.isAuthenticated() ? '/tracks' : '/auth');
  router.init();

  updateUI(root, content, mainContainer, header, side, player);

  window.addEventListener('hashchange', () => {
    const path = window.location.hash.slice(1) || (storage.isAuthenticated() ? '/tracks' : '/auth');
    const route = routes.find((r) => r.path === path);
    
    if (route?.requiresAuth && !storage.isAuthenticated()) {
      router.navigate('/auth');
    } else if (route && !route.requiresAuth && storage.isAuthenticated() && path === '/auth') {
      router.navigate('/tracks');
    } else {
      router.navigate(path);
    }
    updateUI(root, content, mainContainer, header, side, player);
  });

  appState.subscribe('tracksLoaded', () => {
    if (storage.isAuthenticated()) appState.loadFavorites();
  });
};

document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', initApp) : initApp();
