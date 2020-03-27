import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { LoadingService } from '../service/loading.service';
import { AccountService } from '../service/account.service';
import { AlertType } from '../enum/alert-type.enum';
import { AlertService } from '../service/alert.service';
import { NULL_EXPR } from '@angular/compiler/src/output/output_ast';
import { element } from 'protractor';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription[] = [];
  clickMessage = '';
  selector = new FormGroup({ownPassword: new FormControl(''), randomPassword: new FormControl('')});
  buttonEnabled: boolean= true;


  constructor(
    private accountService: AccountService,
    private router: Router,
    private loadingService: LoadingService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    if (this.accountService.isLoggedIn()) {
      if (this.accountService.redirectUrl) {
        this.router.navigateByUrl(this.accountService.redirectUrl);
      } else {
        this.router.navigateByUrl('/home');  //if user is already logged in, (possible we could hide the button.)
      }
    } else {
      this.router.navigateByUrl('/signup');
    }
  }

  generateRandomPass(passwordInput:String) {
    
    //while password is not null and checkbox has been clicked,
    //simply send post request to the server without password, which will generate random password by server side.

    //so I have to figure out 
    /*
      1.how to access to HTML password and check whether it is null. 
      2.how to figure out whehter checkbox has been clicked. 
    */
    if(passwordInput != null)
    this.buttonEnabled = false;
    console.log(passwordInput);
  }


  onRegister(user): void {
    this.loadingService.isLoading.next(true);
    this.subscriptions.push(
    this.accountService.register(user).subscribe(
      response => {
        this.loadingService.isLoading.next(false);
        this.alertService.showAlert(
          'You have registered successfully. Please check your email for account details.',
          AlertType.SUCCESS
        );
        this.router.navigateByUrl('/login')
        console.log(response);
      },
      (error: HttpErrorResponse) => {
        console.log(error);
        this.loadingService.isLoading.next(false);
        const errorMsg: string = error.error;
        if (errorMsg === 'usernameExist') {  //these messages can be found on AccountResource in resource.
          this.alertService.showAlert(
            'This username already exists. Please try with a different username',
            AlertType.DANGER
          );
        } else if (errorMsg === 'emailExist') {
          this.alertService.showAlert(
            'This email address already exists. Please try with a different email',
            AlertType.DANGER
          );
        } else {
          this.alertService.showAlert(
            'Something went wrong. Please try again.',
            AlertType.DANGER
          );
        }
      }
    )
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
