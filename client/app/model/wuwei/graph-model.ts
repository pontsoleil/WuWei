import {
  Link,
  Node
} from './shared';

export class GraphModel {

  public nodes: Node[] = [];
  public links: Link[] = [];

  constructor(
    nodes: Node[],
    links: Link[],
    options: { width, height }
  ) {
    this.nodes = nodes;
    this.links = links;
  }
}
