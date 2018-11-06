import {
  NgModule,
  CUSTOM_ELEMENTS_SCHEMA,
  NO_ERRORS_SCHEMA
} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import { Http, HttpModule } from '@angular/http';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { MatDialog, MatDialogRef } from '@angular/material/dialog';
// import { MatTableComponent } from './mat-table/mat-table.component';
// import { MatDialog } from '@angular/material';
import { MDBBootstrapModule } from './mdb-type/free';
import { MDBBootstrapModulePro } from './mdb-type/pro/index';
import { ToastModule } from './mdb-type/pro/alerts';
import { DefaultMaterialModule } from './mat.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  WpApiModule,
  WpApiLoader,
  WpApiStaticLoader
} from 'wp-api-angular';
import { CKEditorModule } from 'ng2-ckeditor';
import { FileUploadModule } from 'ng2-file-upload';
import { LoadingComponent } from './shared/loading/loading.component';
// import { UploadS3Component } from './shared/upload-s3/upload-s3.component';
import { AppComponent } from './app.component';
import { RoutingModule } from './routing.module';
import {
  AgentService,
  AnnotationService,
  AuthGuardLogin,
  WpUserService,
  CognitoUserService,
  LinkService,
  MessageService,
  NodeService,
  NoteService,
  ResourceService,
  S3Service,
  FileService,
  TranslatePipe,
  UploadService,
  UserService,
  WpPostService,
  WuweiService
} from './services';
import { AboutComponent } from './about';
import { AccountComponent } from './account';
import { AgentsComponent } from './agents/agents.component';
import { ResourcesComponent } from './resources/resources.component';
import { AnnotationsComponent } from './annotations/annotations.component';
// see https://medium.com/codingthesmartway-com-blog/building-an-angular-5-project-with-bootstrap-4-and-firebase-4504ff7717c1
// import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
// see https://loiane.com/2017/08/how-to-add-bootstrap-to-an-angular-cli-project/
// import {
//   BsDropdownModule,
//   TooltipModule,
//   ModalModule,
//   CollapseModule
// } from 'ngx-bootstrap';
import {
  GoogleBookComponent,
  GoogleBookListComponent,
  GoogleBookSearchComponent,
  GoogleBooksService,
  LibraryComponent,
  LibraryService,
  PagerComponent
} from './googleBook';
import { WuweiModel } from './model';
import {
  FilterComponent
  // FilterPC295Component,
  // FilterGenericComponent
} from './filter';
import {
  GoogleBooksSearchService,
  ItunesSearchService,
  PC295SearchService,
  SearchComponent,
  SearchGoogleBooksComponent,
  SearchItunesComponent,
  SearchPC295Component,
  SearchYoutubeComponent,
  YoutubeSearchService
} from './search';
import {
  InfoComponent,
  InfoGenericComponent,
  InfoPC295Component
} from './info';
import {
  EditComponent,
  EditGenericComponent,
  EditPC295Component
} from './edit';
import {
  DRAW_DIRECTIVES,
  DrawComponent,
  DrawService,
  GraphComponent,
  LinkDrawComponent,
  NodeDrawComponent,
  SHARED_DRAWS
} from './draw';
import { MenuComponent } from './menu/menu.component';
import {
  D3_DIRECTIVES,
  D3Service,
  ForceComponent,
  SimulateComponent
} from './simulate';
import { SignupComponent } from './signup';
import { SigninComponent } from './signin';
import { SignoutComponent } from './signout';
import { ChangePasswordComponent } from './change-password';
import { LostPasswordComponent } from './lost-password';

import { UploadComponent } from './upload';
import { FilesComponent } from './files';
import { ContentsComponent } from './contents';

import {
  ExplorerComponent,
  FileExplorerComponent,
//  FileService,
  NewFileDialogComponent,
  NewFolderDialogComponent,
  RenameDialogComponent
} from './explorer';

import { UserListComponent } from './user-list/user-list.component';
import { PostListComponent } from './post-list/post-list.component';
import { PostNewComponent } from './post-new/post-new.component';
import { PostEditComponent } from './post-edit/post-edit.component';
// import { PostListComponent } from './wp-posts/post-list/post-list.component';
// import { Http } from '@angular/http';

import { AuthenticationComponent } from './authentication/authentication.component';

import { BLOG_ENV } from '../assets/config/environment.blog';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { UploadS3Component } from './upload-s3/upload-s3.component';
import { FilesS3Component } from './files-s3/files-s3.component';
import { NoteComponent } from './note/note.component';
import { PageComponent } from './page/page.component';

export function WpApiLoaderFactory(http: Http) {
  const
    baseUrl = BLOG_ENV.baseUrl,
    api = BLOG_ENV.rest_api.wp;
  return new WpApiStaticLoader(http, baseUrl + api, '');
}

@NgModule({
  declarations: [
    AppComponent,

    LoadingComponent,
    // ModalComponent,
    // MessageComponent,
    // UploadS3Component,

    AboutComponent,
    AccountComponent,
    // AdminComponent,

    ContentsComponent,
    TranslatePipe,

    FilterComponent,
    // FilterPC295Component,
    // FilterGenericComponent,

    SearchComponent,
    SearchItunesComponent,
    SearchGoogleBooksComponent,
    SearchYoutubeComponent,
    SearchPC295Component,

    SimulateComponent,
    ForceComponent,

    InfoComponent,
    InfoGenericComponent,
    InfoPC295Component,

    EditComponent,
    EditGenericComponent,
    EditPC295Component,
      ...D3_DIRECTIVES,

    DrawComponent,
    MenuComponent,
    GraphComponent,
      ...SHARED_DRAWS,
      ...DRAW_DIRECTIVES,
    LinkDrawComponent,
    NodeDrawComponent,

    AgentsComponent,
    ResourcesComponent,
    AnnotationsComponent,

    GoogleBookComponent,
    GoogleBookListComponent,
    GoogleBookSearchComponent,
    LibraryComponent,
    PagerComponent,

    SignupComponent,
    SigninComponent,
    SignoutComponent,
    ChangePasswordComponent,
    LostPasswordComponent,

    UploadComponent,
    FilesComponent,

    // MatTableComponent,

    ExplorerComponent,
    FileExplorerComponent,
    NewFileDialogComponent,
    NewFolderDialogComponent,
    RenameDialogComponent,
    AuthenticationComponent,
    UserListComponent,
    PostListComponent,
    PostNewComponent,
    PostEditComponent,
    PageNotFoundComponent,
    UploadS3Component,
    FilesS3Component,
    NoteComponent,
    PageComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    FlexLayoutModule,
    BrowserAnimationsModule,
    RoutingModule,
    FileUploadModule,
    // ReactiveFormsModule,
    // SharedModule,
    HttpModule,
    HttpClientModule,
    ReactiveFormsModule,

    FontAwesomeModule,

    CKEditorModule,

    WpApiModule.forRoot({
      provide: WpApiLoader,
      useFactory: (WpApiLoaderFactory),
      deps: [Http]
    }),

    DefaultMaterialModule,

    MDBBootstrapModule.forRoot(),
    MDBBootstrapModulePro.forRoot(),
    ToastModule.forRoot({ maxOpened: 2 })

    // NgbModule.forRoot()
    // CollapseModule.forRoot(),
    // BsDropdownModule.forRoot(),
    // TooltipModule.forRoot(),
    // ModalModule.forRoot()
  ],
  providers: [
    // MatDialog,
    // MatDialogRef,

    WpUserService,
    CognitoUserService,
    AuthGuardLogin,
    // AuthGuardAdmin,
    UserService,

    ItunesSearchService,
    GoogleBooksSearchService,
    YoutubeSearchService,
    PC295SearchService,

    WuweiModel,
    D3Service,
    DrawService,

    AgentService,
    ResourceService,
    AnnotationService,
    WuweiService,
    MessageService,
    TranslatePipe,
    // LocalizationService,
    NodeService,
    LinkService,
    NoteService,
    UploadService,

    WpPostService,

    GoogleBooksService,
    LibraryService,

    S3Service,
    FileService
  ],
  // entryComponents: [
    // ModalComponent,
    // MessageComponent
    // NewFileDialogComponent,
    // NewFolderDialogComponent,
    // RenameDialogComponent
  // ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
