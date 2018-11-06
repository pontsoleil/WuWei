
/** app-draw */
import {
    Directive,
    Input,
    ElementRef,
    OnInit
} from '@angular/core';
import { MessageService } from '../../../services';
import { Node } from '../../../model';
import { DrawService } from '../draw.service';

@Directive({
    selector: '[draggableNode]'
})
export class DraggableNodeDirective implements OnInit {

    @Input('draggableNode')
    draggableNode: Node;

    constructor(
        private messageService: MessageService,
        private drawService: DrawService,
        private _element: ElementRef
    ) { }

    ngOnInit() {
        this.drawService.applyDraggableBehaviour(
            this._element.nativeElement,
            this.draggableNode
            // this.draggableInGraph
        );
    }
}
