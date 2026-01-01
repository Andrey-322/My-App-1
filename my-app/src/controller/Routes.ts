export interface Component {
  el: HTMLElement;
  update?(): void;
}

export type Route = {
  path: string;
  component: () => Component;
  requiresAuth?: boolean;
};

class Router {
  private routes: Route[] = [];
  private currentRoute: Route | null = null;
  private rootElement: HTMLElement | null = null;
  private currentComponent: Component | null = null;

  register(routes: Route[]): void {
    this.routes = routes;
  }

  setRoot(element: HTMLElement): void {
    this.rootElement = element;
  }

  navigate(path: string): void {
    const route = this.routes.find((r) => r.path === path);
    if (!route) return;

    if (route.requiresAuth && !this.isAuthenticated()) {
      this.navigate('/auth');
      return;
    }

    this.currentRoute = route;
    this.render();
    this.updateURL(path);
  }

  private isAuthenticated(): boolean {
    return localStorage.getItem('token') !== null;
  }

  private render(): void {
    if (!this.rootElement || !this.currentRoute) {
      return;
    }

    if (this.currentComponent) {
      this.currentComponent.el.remove();
    }

    this.currentComponent = this.currentRoute.component();
    this.rootElement.appendChild(this.currentComponent.el);
  }

  private updateURL(path: string): void {
    window.history.pushState({ path }, '', `#${path}`);
  }

  init(): void {
    const handleRoute = () => {
      const path = window.location.hash.slice(1) || '/tracks';
      this.navigate(path);
    };
    window.addEventListener('popstate', handleRoute);
    window.addEventListener('hashchange', handleRoute);
  }
}

export const router = new Router();

