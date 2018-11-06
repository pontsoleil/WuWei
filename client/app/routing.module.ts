import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';

import { PageNotFoundComponent } from './page-not-found';
import { AboutComponent } from './about/about.component';
import { AccountComponent } from './account/account.component';
// import { AdminComponent } from './admin/admin.component';
import { AuthGuardLogin } from './services/auth-guard-login.service';
// import { AuthGuardAdmin } from './services/auth-guard-admin.service';
import {
  CognitoUserService,
  WpUserService
} from './services';


import { SimulateComponent } from './simulate/simulate.component';
import { DrawComponent } from './draw/draw.component';

import { AgentsComponent } from './agents/agents.component';
import { ResourcesComponent } from './resources/resources.component';
import { AnnotationsComponent } from './annotations/annotations.component';

import { GoogleBookSearchComponent } from './googleBook/google-book-search/google-book-search.component';
import { LibraryComponent } from './googleBook/library/library.component';
import { GoogleBookComponent } from './googleBook/google-book/google-book.component';

import { SignupComponent } from './signup';
import { SigninComponent } from './signin';
import { SignoutComponent } from './signout';
import { ChangePasswordComponent } from './change-password';
import { LostPasswordComponent } from './lost-password';

import { UploadComponent } from './upload/upload.component';
import { FilesComponent } from './files/files.component';
import { UploadS3Component } from './upload-s3/upload-s3.component';
import { FilesS3Component } from './files-s3/files-s3.component';

// import { MatTableComponent  } from './mat-table/mat-table.component';
import { ContentsComponent } from './contents/contents.component';
import { ExplorerComponent } from './explorer/explorer.component';

/** Wordpress REST API */
import { UserListComponent } from './user-list/user-list.component';
import { PostListComponent } from './post-list/post-list.component';
import { PostNewComponent } from './post-new/post-new.component';
// import { PostListComponent } from './wp-posts/post-list/post-list.component';

const routes: Routes = [
  { path: '',   redirectTo: '/about', pathMatch: 'full' },
  { path: 'about', component: AboutComponent },
  { path: 'account', component: AccountComponent }, // , canActivate: [AuthGuardLogin] },
  { path: 'agents', component: AgentsComponent },
  { path: 'annotations', component: AnnotationsComponent },
  { path: 'book/:bookId', component: GoogleBookComponent },
  { path: 'change-password', component: ChangePasswordComponent },
  { path: 'contents', component: ContentsComponent },
  { path: 'draw', component: DrawComponent },
  { path: 'explorer', component: ExplorerComponent },
  { path: 'upload', component: UploadComponent },
  { path: 'files', component: FilesComponent },
  { path: 'upload-s3', component: UploadS3Component },
  { path: 'files-s3', component: FilesS3Component },
  { path: 'googlebook-library', component: LibraryComponent },
  { path: 'googlebook-search', component: GoogleBookSearchComponent },
  { path: 'lost-password', component: LostPasswordComponent },
  { path: 'post', component: PostNewComponent },
  { path: 'posts', component: PostListComponent },
  { path: 'resources', component: ResourcesComponent },
  { path: 'simulate', component: SimulateComponent },
  { path: 'signin', component: SigninComponent },
  { path: 'signout', component: SignoutComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'upload', component: UploadComponent },
  // {path: 'uploads/*', redirectTo: '/uploads/*', pathMatch: 'full' },
  { path: 'users', component: UserListComponent },
  // { path: 'wp-posts', component: PostListComponent }
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  // see https://angular.io/guide/router
  imports: [
    RouterModule.forRoot(
      routes,
      { enableTracing: false }
    )
  ],
  exports: [
    RouterModule
  ]
})

export class RoutingModule {}
