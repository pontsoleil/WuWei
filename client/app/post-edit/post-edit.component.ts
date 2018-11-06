import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { WpApiPosts } from 'wp-api-angular';
import { Headers } from '@angular/http';
import { BLOG_ENV } from 'assets/config/environment.blog';

@Component({
  selector: 'app-post-edit',
  templateUrl: './post-edit.component.html',
  styleUrls: ['./post-edit.component.scss']
})
export class PostEditComponent implements OnInit {
  @Input() token;
  @Input() post;

  @Output() finish = new EventEmitter<void>();

  post_edit = {
    title: '',
    content: ''
  };

  constructor(
    private wpApiPosts: WpApiPosts
  ) { }

  ngOnInit() {
    this.post_edit['title'] = this.post.title.rendered;
    this.post_edit['content'] = this.post.content.rendered;
  }

  updatePost() {
    const headers: Headers = new Headers({
      'Authorization': 'Bearer ' + this.token
    });

    this.wpApiPosts.update(this.post.id, this.post_edit, { headers: headers })
    .toPromise()
    .then( response => {
      this.finish.emit(null);
    });
  }
}
