import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class MessageService {
  /** EXAMPLE
      this.messageService.refreshScreen( json );

      this.subscription = messageService.screenRefresh$.subscribe(
        json => {
          const parsed = JSON.parse(json);
          this.resource = this.rcService.resourceFactory(parsed);
          this.refreshScreen();
        },
        err => {
          alert('MessageService' + JSON.stringify(err));
        }
      );
   */
  trace = false;
  // Observable string sources for WuWei
  private straightenLinkSource = new Subject<string>();
  private screenRefreshSource = new Subject<string>();
  private editOpenSource = new Subject<string>();
  private editMadeSource = new Subject<string>();
  private mouseOverSource = new Subject<string>();
  private mouseOutSource = new Subject<string>();
  private closeMenuSource = new Subject<string>();
  private drawingNotifySource = new Subject<string>();
  private onscreenSource = new Subject<string>();
  private tokenSource = new Subject<string>();
  private playPauseSource = new Subject<string>();
  private undoredoSource = new Subject<string>();
  private statusNotifySource = new Subject<string>();
  private modelUpdateSource = new Subject<string>();
  private simulationSource = new Subject<string>();

  // Observable string streams
  straightenLink$ = this.straightenLinkSource.asObservable();
  screenRefresh$ = this.screenRefreshSource.asObservable();
  editOpen$ = this.editOpenSource.asObservable();
  editMade$ = this.editMadeSource.asObservable();
  mouseOver$ = this.mouseOverSource.asObservable();
  mouseOut$ = this.mouseOutSource.asObservable();
  closeMenu$ = this.closeMenuSource.asObservable();
  drawingNotify$ = this.drawingNotifySource.asObservable();
  onscreen$ = this.onscreenSource.asObservable();
  token$ = this.tokenSource.asObservable();
  playPause$ = this.playPauseSource.asObservable();
  undoRedo$ = this.undoredoSource.asObservable();
  statusNotify$ = this.statusNotifySource.asObservable();
  modelUpdate$ = this.modelUpdateSource.asObservable();
  simulation$ = this.simulationSource.asObservable();

  // Service message commands for WuWei
  linkStraighten(json: string) {
    if (this.trace) {console.log('linkStraighten', json); }
    this.straightenLinkSource.next(json);
  }

  refreshScreen(json: string) {
    if (this.trace) {console.log('refreshScreen', json); }
    this.screenRefreshSource.next(json);
  }

  openEdit(json: string) {
    if (this.trace) {console.log('openEdit', json); }
    this.editOpenSource.next(json);
  }

  editMade(json: string) {
    if (this.trace) {console.log('editMade', json); }
    this.editMadeSource.next(json);
  }

  mouseOver(json: string) {
    if (this.trace) {console.log('mouseOver', json); }
    this.mouseOverSource.next(json);
  }

  mouseOut(json: string) {
    if (this.trace) {console.log('mouseOut', json); }
    this.mouseOutSource.next(json);
  }

  closeMenu(json: string) {
    if (this.trace) {console.log('closeMenu', json); }
    this.closeMenuSource.next(json);
  }

  notifyDrawing(json: string) {
    if (this.trace) {console.log('notifyDrawing', json); }
    this.drawingNotifySource.next(json);
  }

  onscreen(json: string) {
    if (this.trace) {console.log('onscreen', json); }
    this.onscreenSource.next(json);
  }

  tokenChanged(json: string) {
    if (this.trace) {console.log('token', json); }
    this.tokenSource.next(json);
  }

  playPause(json: string) {
    if (this.trace) {console.log('token', json); }
    this.playPauseSource.next(json);
  }

  undoRedo(json: string) {
    if (this.trace) {console.log('token', json); }
    this.undoredoSource.next(json);
  }

  notifyStatus(json: string) { // online, offline
    if (this.trace) {console.log('token', json); }
    this.statusNotifySource.next(json);
  }

  updateModel(json: string) {
    if (this.trace) {console.log('token', json); }
    this.modelUpdateSource.next(json);
  }

  simulation(json: string) {
    if (this.trace) {console.log('token', json); }
    this.simulationSource.next(json);
  }
}
