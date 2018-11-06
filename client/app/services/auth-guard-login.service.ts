import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { WpUserService } from './wp-user.service';

@Injectable()
export class AuthGuardLogin implements CanActivate {

  constructor(
    public auth: WpUserService,
    private router: Router
  ) { }

  canActivate() {
    return this.auth.loggedIn;
  }

}
