import { Component, OnInit } from '@angular/core';
import { FileElement } from './file-explorer/model/element';
import { Observable } from 'rxjs/Observable';
import { FileService } from './service/file.service';

@Component({
  selector: 'app-explorer',
  templateUrl: './explorer.component.html',
  styleUrls: ['./explorer.component.scss']
})
export class ExplorerComponent implements OnInit {

  public fileElements: Observable<FileElement[]>;
  public folderElements: Observable<FileElement[]>;

  currentRoot: FileElement;
  currentPath: string;
  canNavigateUp = false;

  constructor(
    public fileService: FileService
  ) {}

  ngOnInit() {
    const root = this.fileService.rootElement; // add({ id: 'root', name: '..', isFolder: true, parent: '' });
    const folderA = this.fileService.add(new FileElement({ name: 'Folder A', isFolder: true, parent: 'root' }));
    this.fileService.add(new FileElement({ name: 'Folder B', isFolder: true, parent: 'root' }));
    this.fileService.add(new FileElement({ name: 'Folder C', isFolder: true, parent: folderA.id }));
    this.fileService.add(new FileElement({ name: 'File 1', isFolder: false, parent: 'root' }));
    this.fileService.add(new FileElement({ name: 'File 2', isFolder: false, parent: 'root' }));

    this.updateFileElementQuery();
  }

  addFile(file: { name: string }) {
    this.fileService.add(new FileElement({
      isFolder: false,
      name: file.name,
      parent: this.currentRoot ? this.currentRoot.id : 'root'
    }));
    this.updateFileElementQuery();
  }

  addFolder(folder: { name: string }) {
    this.fileService.add(new FileElement({
      isFolder: true,
      name: folder.name,
      parent: this.currentRoot ? this.currentRoot.id : 'root'
    }));
    this.updateFileElementQuery();
  }

  removeElement(element: FileElement) {
    this.fileService.delete(element.id);
    this.updateFileElementQuery();
  }

  navigateToFolder(element: FileElement) {
    this.currentRoot = element;
    this.updateFileElementQuery();
    this.currentPath = this.pushToPath(this.currentPath, element.name);
    this.canNavigateUp = true;
  }

  navigateUp() {
    if (this.currentRoot && this.currentRoot.parent === 'root') {
      this.currentRoot = null;
      this.canNavigateUp = false;
      this.updateFileElementQuery();
    } else {
      this.currentRoot = this.fileService.get(this.currentRoot.parent);
      this.updateFileElementQuery();
    }
    this.currentPath = this.popFromPath(this.currentPath);
  }

  moveElement(event: { element: FileElement; moveTo: FileElement }) {
    if (event.element.parent !== event.moveTo.id) {
      this.fileService.update(event.element.id, { parent: event.moveTo.id });
      this.updateFileElementQuery();
    }
  }

  renameElement(element: FileElement) {
    this.fileService.update(element.id, { name: element.name });
    this.updateFileElementQuery();
  }

  updateFileElementQuery() {
    this.fileElements = this.fileService.queryInFolder(this.currentRoot ? this.currentRoot.id : 'root');
    console.log(this.fileElements);
  }

  pushToPath(path: string, folderName: string) {
    let p = path ? path : '';
    p += `${folderName}/`;
    return p;
  }

  popFromPath(path: string) {
    let p = path ? path : '';
    const split = p.split('/');
    split.splice(split.length - 2, 1);
    p = split.join('/');
    return p;
  }
}
