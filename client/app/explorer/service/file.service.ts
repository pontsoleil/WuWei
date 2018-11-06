import { Injectable } from '@angular/core';
import * as uuid from 'uuid';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { FileElement } from '../file-explorer/model/element';

export interface IFileService {
  add(fileElement: FileElement);
  delete(id: string);
  update(id: string, update: Partial<FileElement>);
  queryInFolder(folderId: string): Observable<FileElement[]>;
  get(id: string): FileElement;
}

@Injectable()
export class FileService implements IFileService {
  private map = new Map<string, FileElement>();
  private querySubject: BehaviorSubject<FileElement[]>;
  private folderSubject: BehaviorSubject<FileElement[]>;

  private _rootElement: FileElement = new FileElement({ id: 'root', name: '..', isFolder: true, parent: '' });
  public get rootElement(): FileElement {
    return this._rootElement;
  }
  public set rootElement(theRootElement: FileElement) {
      this._rootElement = theRootElement;
  }

  constructor() {
    this.add(this.rootElement);
  }

  getParentFolder(folderId: string) {
    if ('root' === folderId) {
      return null;
    }
    const folderElement: FileElement = this.get(folderId);
    if ('' === folderElement.parent) {
      return null;
    }
    let parentFolder: FileElement;
    if ('root' === folderElement.parent) {
      parentFolder  = this.rootElement;
    } else {
      parentFolder = this.clone(this.get(folderElement.parent));
      parentFolder.isParent = true;
    }
    return parentFolder;
  }

  add(fileElement: FileElement) {
    fileElement.id = fileElement.id || uuid.v4();
    this.map.set(fileElement.id, this.clone(fileElement));
    return fileElement;
  }

  delete(id: string) {
    this.map.delete(id);
  }

  update(id: string, update: Partial<FileElement>) {
    let element = this.map.get(id);
    element = Object.assign(element, update);
    this.map.set(element.id, element);
  }

  queryInFolder(folderId: string) {
    const result: FileElement[] = [];

    function compare(a: FileElement, b: FileElement) {
      if (a.isFolder && !b.isFolder) {
        return -1;
      }
      if (!a.isFolder && b.isFolder) {
        return 1;
      }
      if (a.isFolder === b.isFolder) {
        if (a.name < b.name) {
          return -1;
        }
        if (a.name > b.name) {
          return 1;
        }
      }
      return 0;
    }

    if ('root' !== folderId) {
      const currentFolder: FileElement = this.clone(this.get(folderId));
      const parentFolder: FileElement = this.clone(this.get(currentFolder.parent));
      parentFolder.name = '..';
      result.push(parentFolder);
    }

    this.map.forEach(element => {
      if (element.parent === folderId) {
        result.push(this.clone(element));
      }
    });

    result.sort(compare);

    if (!this.querySubject) {
      this.querySubject = new BehaviorSubject(result);
    } else {
      this.querySubject.next(result);
    }
    return this.querySubject.asObservable();
  }

  get(id: string) {
    return this.map.get(id);
  }

  clone(element: FileElement) {
    return JSON.parse(JSON.stringify(element));
  }
}
