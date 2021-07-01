import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class NgxVirtualSwiperOptions {

    /** returns to actual integer index */
    public finalize = true;
    /**
     * It's required by links, the library should know is it real swipe or fake.
     * A value in px. If "touch distance" will be lower than this value then swiper will not move.
     */
    public threshold = 20;
    /** prevent all type of clicks (e.g. links, Angular`s click) */
    public preventClicks = true;

    constructor() { }
}
