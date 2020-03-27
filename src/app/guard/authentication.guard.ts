import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AccountService } from '../service/account.service';
import { AlertService } from '../service/alert.service';
import { AlertType } from '../enum/alert-type.enum';
import { Statement } from '@angular/compiler';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationGuard implements CanActivate  {

  constructor(private accountService: AccountService, private alertService: AlertService,
              private router: Router) {}

//guard protects users stay on the website without logged in status and redirect back to login page if so.

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
    return this.isLoggedIn(state.url);
  }

  private isLoggedIn(url: string): boolean { //true if user is logged in, false not.
    if (this.accountService.isLoggedIn) 
      return true;
    
    this.accountService.redirectUrl = url;
    this.router.navigate(['/login']);
    this.alertService.showAlert('You must be logged in to access this page', AlertType.DANGER);
    console.log('user not logged in');
    return false;
  }

}
