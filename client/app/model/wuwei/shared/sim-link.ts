export class SimLink {
  id: any;
  /** d3 */
  source?: any;
  target?: any;
  opacity?: number;
  visible?: boolean;
  // expired?: boolean;
  constructor(param: {
    id: any,
    source: any,
    target: any
  }) {
    this.id = param.id;
    this.source = param.source;
    this.target = param.target;
  }
}
