import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { InitializationService } from '../../shared/initialization.service';
import { DeactivateGuardInterface } from './deactivate-guard.interface';

@Injectable()
export class DeactivateGuardComponent implements CanDeactivate<DeactivateGuardInterface> {

  constructor(private initService: InitializationService) {}

  public async canDeactivate(target: DeactivateGuardInterface): Promise<boolean> {
    if (!this.initService.isAuthenticated()) {
      return Promise.resolve(true);
    }
    return await target.canDeactivate();
  }
}
