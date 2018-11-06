/** app-draw */
import {
    Directive,
    Input,
    ElementRef,
    OnInit
} from '@angular/core';
import { MessageService } from '../../../services';
import { Link } from '../../../model';
import { DrawService } from '../draw.service';

@Directive({
    selector: '[selectableLink]'
})
export class SelectableLinkDirective implements OnInit {

    @Input('selectableLink')
    selectableLink: Link;

    constructor(
        private messageService: MessageService,
        private drawService: DrawService,
        private _element: ElementRef
    ) { }

    ngOnInit() {
        this.drawService.applySelectableBehaviour(
            this._element.nativeElement,
            this.selectableLink
        );
    }
}
