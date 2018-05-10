import { Router } from '@angular/router';
import { BaseComponent } from './base.component';

export class BaseNavComponent extends BaseComponent {
  constructor(
    protected router?: Router
  ) {
    super();
  }

  protected navigateTo(pathArray: String[]) {
    if (this.router) {
      this.router.navigate(pathArray, {
        queryParamsHandling: 'preserve'
      });
    }
  }
}
