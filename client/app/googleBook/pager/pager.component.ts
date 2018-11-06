import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter
} from '@angular/core';

@Component({
  selector: 'app-pager',
  templateUrl: './pager.component.html',
  styleUrls: ['./pager.component.scss']
})
export class PagerComponent implements OnInit {

  @Input()
  public page = 1;

  @Input()
  public totalPages = 0;

  @Output()
  private changePage: EventEmitter<number> = new EventEmitter<number>();

  constructor() {
  }

  next() {
    if (this.page < this.totalPages) {
      this.changePage.emit(this.page + 1);
    }
  }

  prev() {
    if (this.page > 1) {
      this.changePage.emit(this.page - 1);
    }
  }

  ngOnInit() {
  }

}
