import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import { AccountService } from '../service/account.service';
import { PostService } from '../service/post.service';
import { LoadingService } from '../service/loading.service';
import { AlertService } from '../service/alert.service';
import { Post } from '../model/post';
import { User } from '../model/user';
import { PasswordChange } from '../model/password-change';
import { AlertType } from '../enum/alert-type.enum';
import { AuthenticationGuard } from '../guard/authentication.guard';
import { CacheService } from '../service/cache.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  postId: number;
  posts: Post = new Post();
  user: User;
  id: number;
  host: string;
  userHost: string;
  postHost: string;
  username: string;
  createdDate: Date;
  profilePictureChange: boolean;
  imgURL: any;
  public imagePath;
  profilePicture: File;
  message: string;
  timeStamp: any;
  linkPicture: string;
  userId: number;




  constructor(
    private route: ActivatedRoute,
    public accountService: AccountService,
    private postService: PostService,
    private router: Router,
    private loadingService: LoadingService,
    private alertService: AlertService,
    private authentication: AuthenticationGuard,
    private cacheService: CacheService
  ) { }

  ngOnInit() {
    if (this.accountService.isLoggedIn()) {

      this.loadingService.isLoading.next(true);
      this.username = this.route.snapshot.paramMap.get('username');
      this.host = this.postService.host;
      this.userHost = this.postService.userHost;
      this.postHost = this.postService.postHost;
      this.getUserInfo(this.username);
      this.loadingService.isLoading.next(false);
    }
    else {
      this.router.navigateByUrl('/login')
    }
  }

  

  getUserNumber(): void {

  }

  getUserInfo(username: string): void {
    this.subscriptions.push(
      this.accountService.getUserInformation(username).subscribe(
        (response: User) => {
          this.user = response;
          this.id = (this.user.id);
          this.getPostsByUsername(this.user.username);
          this.linkPicture = this.userHost + "/" + this.id + ".png";

        },
        error => {
          console.log(error);
          this.user = null;
        }
      )
    );
  }

  getPostsByUsername(username: string): void {
    this.subscriptions.push(
      this.postService.getPostsByUsername(username).subscribe(
        (response: Post[]) => {
          this.user.post = response;
        },
        error => {
          console.log(error);
          this.user.post = null;
        }
      )
    );
  }
  //"{{ userHost }}/{{ user?.id }}.png"
  onProfilePictureSelected(event: any): void {
    console.log(event);
    this.profilePicture = event.target.files[0];
    
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = e => this.imgURL = reader.result;
      reader.readAsDataURL(file);    
    

    this.profilePictureChange = true;
  }

  public getLinkPicture() {
    if (this.timeStamp) {
      return this.linkPicture + '?' + this.timeStamp;
      console.log(this.linkPicture);
    }
    return this.linkPicture;
  }

  public setLinkPicture(url: string) {
    this.linkPicture = url;
    this.timeStamp = (new Date()).getTime();
  }

  readURL(event: any): void {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      const reader = new FileReader();
      reader.onload = e => this.imgURL = reader.result;

      reader.readAsDataURL(file);
    }
  }

  onUpdateUser(updatedUser: User): void {
    this.loadingService.isLoading.next(true);
    this.subscriptions.push(
      this.accountService.updateUser(updatedUser).subscribe(
        response => {
          console.log(response);
          if (this.profilePictureChange) {
            this.accountService.uploadeUserProfilePicture(this.profilePicture);
          }
          
          this.alertService.showAlert(
            'Profile updated successfully.',
            AlertType.SUCCESS
          );
          setTimeout(() => {
            location.reload();this.loadingService.isLoading.next(false);
          }, 2300);
        },
        error => {
          console.log(error);
          this.loadingService.isLoading.next(false);
          this.alertService.showAlert(
            'Profile update failed. Please try again..',
            AlertType.DANGER
          );
        }
      )
    );
  }

  onChangePassword(passwordChange: PasswordChange) {
    console.log(passwordChange);
    const element: HTMLElement = document.getElementById(
      'changePasswordDismiss'
    ) as HTMLElement;
    element.click();
    this.loadingService.isLoading.next(true);
    this.subscriptions.push(
      this.accountService.changePassword(passwordChange).subscribe(
        response => {
          console.log(response);
          this.loadingService.isLoading.next(false);
          this.alertService.showAlert(
            'Password was updated successfully',
            AlertType.SUCCESS
          );
        },
        error => {
          console.log(error);
          this.loadingService.isLoading.next(false);
          const errorMsg: string = error.error;
          this.showErrorMessage(errorMsg);
        }
      )
    );
  }

  private showErrorMessage(errorMessage: string): void {
    if (errorMessage === 'PasswordNotMatched') {
      this.alertService.showAlert(
        'Passwords do not match. Please try again.',
        AlertType.DANGER
      );
    } else if (errorMessage === 'IncorrectCurrentPassword') {
      this.alertService.showAlert(
        'The current password is incorrect. Please try again.',
        AlertType.DANGER
      );
    } else {
      this.alertService.showAlert(
        'Password change failed. Please try again.',
        AlertType.DANGER
      );
    }
  }

  seeOnePost(postId): void {
    this.router.navigate(['/post', postId]);

  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
