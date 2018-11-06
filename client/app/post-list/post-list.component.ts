import { Component, OnInit, Input } from '@angular/core';
import { WpApiPosts } from 'wp-api-angular';
import { Headers } from '@angular/http';
import { Subscription } from 'rxjs/Subscription';
import { MessageService } from '../services/message.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.scss']
})
export class PostListComponent implements OnInit {
  subscription: Subscription;

  @Input() token;

  posts = [];
  editingPost = null;

  constructor(
    private wpApiPosts: WpApiPosts
  ) {
    this.getPosts();
  }

  ngOnInit() { }

  getPosts() {
    this.wpApiPosts.getList()
      .toPromise()
      .then( response => {
        const json: any = response.json();
        this.posts = json;
      })
      .catch( err => {
        const json: any = [{title: 'Error', rendered: err.toString()}];
        this.posts = json;
      });
  }

  deletePost(id: number, index: number) {
    const headers: Headers = new Headers({
      'Authorization': 'Bearer ' + this.token
    });

    this.wpApiPosts.delete(id, { headers: headers })
      .toPromise()
      .then( response => {
        if (response['ok'] === true) {
          this.posts.splice(index, 1);
        }
      });
  }

  updatePost(post) {
    this.editingPost = post;
  }

}
