import {Component, OnInit, Input} from '@angular/core';
import {Book} from '../../services/book';

@Component({
  selector: 'app-google-book-list',
  templateUrl: './google-book-list.component.html',
  styleUrls: ['./google-book-list.component.scss']
})
export class GoogleBookListComponent implements OnInit {

  @Input()
  public books: Book[];

  ngOnInit() {
  }

}
