import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { ServerConstant} from '../constant/server-constant';
import { Observable } from 'rxjs';
import { User } from '../model/user';


@Injectable({
  providedIn: 'root'
})
export class InitService {

  constant: ServerConstant = new ServerConstant();
  public host: string = this.constant.host;
  private joke = null;

  constructor(private http: HttpClient) {

  }

} 

