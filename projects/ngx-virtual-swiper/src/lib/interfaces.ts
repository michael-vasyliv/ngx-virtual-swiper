export type OffsetFrom = 'top' | 'left' | 'right' | 'bottom' | 'start' | 'end';

export interface INgxVirtualSwiperOptions {
    offsetXFrom: OffsetFrom;
    offsetYFrom: OffsetFrom;
    /**
     * the property returns to actual integer index
     * */
    finalize: boolean;
    /**
     * the property disable the library
     * */
    disabled: boolean;
    /**
     * the property is required by links, the library should know is it real swipe or fake
     * */
    threshold: number;
    /**
     * the property prevent default last click
     * */
    preventDefaultClick: boolean;
}
