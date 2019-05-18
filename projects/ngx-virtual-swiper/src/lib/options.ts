import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class NgxVirtualSwiperOptions {

    /** returns to actual integer index */
    finalize = true;
    /** is required by links, the library should know is it real swipe or fake */
    threshold = 20;
    /** prevent all type of clicks (e.g. links, Angular`s click) */
    preventClicks = true;

    constructor() { }
}
