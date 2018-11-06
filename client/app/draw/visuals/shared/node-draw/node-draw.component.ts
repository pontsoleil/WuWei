/** app-draw */
import { Component, Input } from '@angular/core';
import { Node } from '../../../../model/wuwei';
import { Resource } from '../../../../model';

@Component({
  selector: '[nodeDraw]',
  templateUrl: './node-draw.component.html',
  styleUrls: ['./node-draw.component.scss']
})
export class NodeDrawComponent {
  @Input('nodeDraw') node: Node;
}
