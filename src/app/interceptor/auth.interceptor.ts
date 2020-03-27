import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AccountService } from '../service/account.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private accountService: AccountService) {}

  intercept(
    req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {


      //just pass over for below urls which requires login(auth) process.
    if (req.url.includes(`${this.accountService.host}/user/login`)) {
      return next.handle(req);
    }

    if (req.url.includes(`${this.accountService.host}/user/register`)) {
      return next.handle(req);
    }

    if (req.url.includes(`${this.accountService.host}/user/resetPassword/`)) {
      return next.handle(req);
    }

    if (req.url.includes('https://maps.googleapis.com/')) {
      return next.handle(req);
    }


    this.accountService.loadToken(); //if token exists,
    const token = this.accountService.getToken();
    const request = req.clone({ setHeaders: { Authorization: token } }); //request is immutable. thus we have to clone it and set it to the header
    return next.handle(request); //pass the new request to handler
  }

}
