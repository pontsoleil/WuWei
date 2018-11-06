/** app-draw */
import { Component, Input } from '@angular/core';
import { Link } from '../../../../model';

@Component({
  selector: '[linkDraw]',
  templateUrl: './link-draw.component.html',
  styleUrls: ['./link-draw.component.scss']
})
export class LinkDrawComponent {
  @Input('linkDraw') link: Link;
}
