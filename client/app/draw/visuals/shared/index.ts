export * from './node-draw/node-draw.component';
export * from './link-draw/link-draw.component';

import { NodeDrawComponent } from './node-draw/node-draw.component';
import { LinkDrawComponent } from './link-draw/link-draw.component';

export const SHARED_DRAWS = [
    NodeDrawComponent,
    LinkDrawComponent
];
