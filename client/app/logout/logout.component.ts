import {
  Component,
  OnInit
} from '@angular/core';
import { WpUserService } from '../services';

@Component({
  selector: 'app-logout',
  template: '',
  styles: ['']
})
export class LogoutComponent implements OnInit {

  constructor(private auth: WpUserService) { }

  ngOnInit() {
    this.auth.logout();
  }

}
