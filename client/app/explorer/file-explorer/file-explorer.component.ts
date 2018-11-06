import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FileElement } from './model/element';
import { FileService } from '../service/file.service';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { Observable } from 'rxjs/Observable';
import { MatDialog } from '@angular/material/dialog';
import { NewFileDialogComponent } from './modals/new-file-dialog/new-file-dialog.component';
import { NewFolderDialogComponent } from './modals/new-folder-dialog/new-folder-dialog.component';
import { RenameDialogComponent } from './modals/rename-dialog/rename-dialog.component';

@Component({
  selector: 'app-file-explorer',
  templateUrl: './file-explorer.component.html',
  styleUrls: ['./file-explorer.component.css']
})
export class FileExplorerComponent {

  @Input() fileElements: FileElement[];
  @Input() canNavigateUp: string;
  @Input() path: string;

  @Output() fileAdded = new EventEmitter<{ name: string }>();
  @Output() folderAdded = new EventEmitter<{ name: string }>();
  @Output() elementRemoved = new EventEmitter<FileElement>();
  @Output() elementRenamed = new EventEmitter<FileElement>();
  @Output() elementMoved = new EventEmitter<{ element: FileElement; moveTo: FileElement }>();
  @Output() navigatedDown = new EventEmitter<FileElement>();
  @Output() navigatedUp = new EventEmitter();

  constructor(
    public dialog: MatDialog,
    private fileService: FileService
  ) {}

  deleteElement(element: FileElement) {
    this.elementRemoved.emit(element);
  }

  navigate(element: FileElement) {
    if (element.isFolder) {
      if (element.isParent || '..' === element.name) {
        this.navigatedUp.emit();
      } else {
        this.navigatedDown.emit(element);
      }
    }
  }

  navigateUp() {
    this.navigatedUp.emit();
  }

  moveElement(element: FileElement, moveTo: FileElement) {
    this.elementMoved.emit({ element: element, moveTo: moveTo });
  }

  openNewFileDialog() {
    const dialogRef = this.dialog.open(NewFileDialogComponent);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.fileAdded.emit({ name: res });
      }
    });
  }

  openNewFolderDialog() {
    const dialogRef = this.dialog.open(NewFolderDialogComponent);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.folderAdded.emit({ name: res });
      }
    });
  }

  openRenameDialog(element: FileElement) {
    const dialogRef = this.dialog.open(RenameDialogComponent);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        element.name = res;
        this.elementRenamed.emit(element);
      }
    });
  }

  openMenu(event: MouseEvent, viewChild: MatMenuTrigger) {
    event.preventDefault();
    viewChild.openMenu();
  }

  drag(event) {
    console.log(event.target);
    event.dataTransfer.setData('text', event.target.id);
  }

  allowDrop(event) {
    event.preventDefault();
  }

  drop(event) {
    event.preventDefault();
    const folderId = event.currentTarget.id;
    const draggedId = event.dataTransfer.getData('text');
    if (folderId === draggedId) {
      return;
    }
    let folderElement: FileElement;
    if ('root' === folderId) {
      folderElement = this.fileService.rootElement;
    } else {
      folderElement = this.fileService.get(folderId);
    }
    const draggedElement = this.fileService.get(draggedId);
    this.moveElement(draggedElement, folderElement);
  }
}
