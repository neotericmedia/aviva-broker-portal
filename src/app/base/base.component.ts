import { OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export class BaseComponent implements OnDestroy {
  protected isAlive: boolean = true;

  public ngOnDestroy() {
    this.isAlive = false;
  }

  /**
   * There are two types of subscriptions; finite and infinite.
   * Observables from http request is finite and Angular will take care of unsubscription.
   * Observables to router is a sample of infinite type but Angular Router promises to take care
   *  of unsubscription.
   * The other observables that are similar to router that keeps listening to its source and
   *  are not guaranteed by Angular to clean up will be prone to memory leaks.
   * It is always safe not to think about any type of subscription and just preempt subscription
   *  with this function.
   * @param observable any subscribable type; Observalbe and Subject are targeted for now.
   */
  protected safeSubscribe(observable: Observable<any> | Subject<any>) {
    /**
     * This is one of the approaches of unsubscribing in addition to calling unsubscribe
     * The TakeWhile mirrors the source Observable until such time as some condition you
     * specify becomes false, at which point TakeWhile stops mirroring the source
     * Observable and terminates its own Observable.
     */
    return observable.takeWhile(() => this.isAlive);
  }
}
