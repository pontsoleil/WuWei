export class FileElement {
  id?: string;
  isFolder: boolean;
  name: string;
  parent: string;
  isParent?: boolean;
  constructor(map) {
    if (map.id) {
      this.id = map.id;
    }
    this.isFolder = map.isFolder;
    this.name = map.name;
    this.parent = map.parent;
    if (map.isParent) {
      this.isParent = map.isParent;
    }
  }
}
