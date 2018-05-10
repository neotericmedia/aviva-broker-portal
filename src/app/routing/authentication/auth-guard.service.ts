import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivate } from '@angular/router';
import { AuthService } from './auth.service';
import { InitializationService } from '../../shared/initialization.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
    private initService: InitializationService
  ) {}

  public async canActivate(): Promise<boolean> {
    const isAuthed = await this.authService.isAuthenticated();
    if (isAuthed) {
      console.log('Allow : User is authenticated.');
      return true;
    }
    this.initService.resetAuthentication(true);
    console.log('DENY : User is not authenticated.');
    this.router.navigate(['/login'], {
      queryParamsHandling: 'preserve'
    });
    return false;
  }
}
