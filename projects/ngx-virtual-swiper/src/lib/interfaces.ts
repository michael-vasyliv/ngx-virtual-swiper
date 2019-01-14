export interface INgxVirtualSwiperOptions {
    /** returns to actual integer index */
    finalize: boolean;
    /** the time when the {@link finalize} will be called after scroll event */
    finalizeTime: number;
    /** is required by links, the library should know is it real swipe or fake */
    threshold: number;
    /** prevent all type of clicks (e.g. links, Angular`s click) */
    preventClicks: boolean;
}

/** prevent bugs at SSR */
export interface IPositionEvent {
    clientX: number;
    clientY: number;
    originalEvent: any;
}
