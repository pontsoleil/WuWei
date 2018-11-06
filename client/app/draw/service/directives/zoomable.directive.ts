/** app-draw */
import { Directive, Input, ElementRef, OnInit } from '@angular/core';
import { DrawService } from '../draw.service';

@Directive({
    selector: '[zoomableOf]'
})
export class ZoomableDirective implements OnInit {
    @Input('zoomableOf')
    zoomableOf: ElementRef;

    constructor(
        private drawService: DrawService,
        private _element: ElementRef
    ) { }

    ngOnInit() {
        this.drawService.applyZoomableBehaviour(
            this.zoomableOf,
            this._element.nativeElement
        );
    }
}
