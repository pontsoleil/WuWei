import { Component, OnInit, Input } from '@angular/core';
import { WpApiUsers } from 'wp-api-angular';
import { Headers } from '@angular/http';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  users = [];

  constructor(
    private wpApiUsers: WpApiUsers
  ) {
    this.getUserList();
  }

  ngOnInit() { }

  getUserList() {
    this.wpApiUsers.getList()
    .toPromise()
    .then( response => {
      const json: any = response.json();
      this.users = json;
    })
    .catch( err => {
      const json: any = [{name: 'ERROR:' + err.toString()}];
      this.users = json;
    });
  }
}
