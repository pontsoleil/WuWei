import { Directive, Input, ElementRef, OnInit } from '@angular/core';
import { D3Service } from '../d3.service';

@Directive({
    selector: '[forceZoomableOf]'
})
export class ForceZoomableDirective implements OnInit {
    @Input('forceZoomableOf')
    zoomableForceOf: ElementRef;

    constructor(
        private d3Service: D3Service,
        private _element: ElementRef
    ) { }

    ngOnInit() {
        this.d3Service.applyForceZoomableBehaviour(
            this.zoomableForceOf,
            this._element.nativeElement
        );
    }
}
