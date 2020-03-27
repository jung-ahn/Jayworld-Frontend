import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from '../service/account.service';
import { LoadingService } from '../service/loading.service';
import { AlertService } from '../service/alert.service';
import { PostService } from '../service/post.service';
import { Subscription } from 'rxjs';
import { AlertType } from '../enum/alert-type.enum';
import { Post } from '../model/post';
import { User } from '../model/user';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  user = new User();
  posts: Post[] = [];
  host: string;
  userHost: string;
  postHost: string;
  color: string;
  like: string;
  post: Post = new Post();
  bColor: string = 'warn';
  userLiked: boolean[] = [];
  aColor: string;
  likeInput: string[] = [];
  currentIndex: number;



  constructor(
    private router: Router,
    private accountService: AccountService,
    private postService: PostService,
    private loadingService: LoadingService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    if (this.accountService.isLoggedIn()) {

      this.loadingService.isLoading.next(true);

      
      this.getPosts();

      this.host = this.postService.host;
      this.userHost = this.postService.userHost;
      this.postHost = this.postService.postHost;
      this.getUserInfo(this.accountService.loggInUsername);  //send admin

      //bug here
      //

      this.loadingService.isLoading.next(false);
      
    }
    else {
      this.router.navigateByUrl('/login')
    }


  }

  getUserInfo(username: string): void {
    this.subscriptions.push(

      this.accountService.getUserInformation(username).subscribe(
        (response: User) => {
          this.user = response;
        },
        error => {
          this.user = null;
          this.router.navigateByUrl('/login');
        }
      ));
  }

  logOut(): void {
    console.log('set')
    this.accountService.logOut();
    this.router.navigateByUrl('/login');
    this.alertService.showAlert(
      'You have been successfully logged out .',
      AlertType.DANGER
    );
  }

  getUserProfile(username: string): void {
    this.router.navigate(['/profile', username]);
  }

  getPosts(): void {
    this.subscriptions.push(this.accountService.getPosts().subscribe(
      (response: Post[]) => {
        this.posts = response;
        this.displayLike();
        this.loadingService.isLoading.next(false);
      },
      error => {
        console.log(error);
        this.loadingService.isLoading.next(false);
      }
    ));
  }

  onDelete(id: number): void {
    this.subscriptions.push(
      this.postService.delete(id).subscribe(
        response => {
          console.log('The deleted post: ', response);
          this.alertService.showAlert(
            'Post was deleted successfully.',
            AlertType.SUCCESS
          );
          this.getPosts();
        },
        error => {
          console.log(error);
          this.alertService.showAlert(
            'Post was not deleted. Please try again.',
            AlertType.DANGER
          );
          this.getPosts();
        }
      ));
  }

  seeOnePost(postId): void {
    this.router.navigate(['/post', postId]);
  }

  displayLike(): void{ //set default arrays with warn and true
    for (let i = 0; i<this.posts.length; i++){
      this.likeInput.push("warn");
      this.userLiked.push(true);
    }
  }

  likePost(post, user, i) {

    this.currentIndex = i;
    if (this.userLiked[i]) {
      this.doLike(post, user);
      post.likes += 1;
      this.likeInput[i] = "accent";
      this.userLiked[i] = false;
    } else{
      this.doUnlike(post, user);
      this.likeInput[i] = "warn";
      this.userLiked[i] = true;
      post.likes -= 1;

      if (user.likedPosts != null) {
        for (let i = 0; i < user.likedPosts.length; i++) {
          if (user.likedPosts[i].id === post.id) {
            user.likedPosts.splice(i, 1);
          }
        }
      }
    }
  }


  doLike(post, user) {
    this.subscriptions.push(
      this.postService.like(post.id, user.username).subscribe(
        response => {
          console.log(response);
        },
        error => {
          console.log(error);
        }
      )
    );
  }

  doUnlike(post, user) {
    this.subscriptions.push(
      this.postService.unLike(post.id, user.username).subscribe(
        response => {
          console.log(response);
        },
        error => {
          console.log(error);
        }
      )
    );
  }






  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
