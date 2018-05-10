import { Directive, ElementRef, Renderer2, OnDestroy } from '@angular/core';

@Directive({ selector: '[disable-mouse-wheel]'})
export class DisablingMouseWheelDirective implements OnDestroy {
  private listener: () => void;
  constructor(el: ElementRef, renderer: Renderer2) {
    renderer.listen(el.nativeElement, 'wheel', (e) => {
      el.nativeElement.blur();
    });
  }

  public ngOnDestroy() {
    if (this.listener) {
      this.listener();
    }
  }
}
