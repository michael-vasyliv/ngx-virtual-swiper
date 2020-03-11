import { Directionality } from '@angular/cdk/bidi';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ContentChild, Directive, HostListener, Inject, Input, OnChanges, OnDestroy, OnInit, Optional } from '@angular/core';
import { Subscription } from 'rxjs';
import { NgxVirtualSwiperOptions } from './options';
import { IPositionEvent } from './position-event';
import { getClickPositions, getTouchPositions, isNumber } from './utils';

@Directive({
    selector: '[ngxVirtualSwiper]'
})
export class NgxVirtualSwiperDirective implements OnChanges, OnInit, OnDestroy {

    @Input() itemSize: number;
    readonly subscription = new Subscription();
    _index: number;
    _halfItemSize: number;
    _swiped: boolean;
    _clientX: number;
    _clientY: number;
    _prevClientX: number;
    _prevClientY: number;
    /** Absolute scrolling by Y axis */
    _scrollTop: number;
    /** Absolute scrolling by X axis */
    _scrollX: number;

    constructor(
        @Optional() @Inject(Directionality) private dir: Directionality,
        @Inject(NgxVirtualSwiperOptions) private options: NgxVirtualSwiperOptions,
        /** to lean more see https://material.angular.io/cdk/scrolling/api */
        @Inject(CdkVirtualScrollViewport) private cdk: CdkVirtualScrollViewport
    ) { }

    ngOnChanges(): void {
        this._halfItemSize = this.itemSize / 2;
    }

    ngOnInit(): void {
        this.addEventListener();
        this.subscription.add(this.cdk.scrolledIndexChange.subscribe(i => this._index = i));
    }

    ngOnDestroy(): void {
        this.removeEventListener();
        this.subscription.unsubscribe();
    }

    @HostListener('mousedown', ['$event']) mousedown = (e) => this.start(getClickPositions(e));

    @HostListener('touchstart', ['$event']) touchstart = (e) => this.start(getTouchPositions(e));

    @HostListener('mousemove', ['$event']) mousemove = (e) => this.move(getClickPositions(e));

    @HostListener('touchmove', ['$event']) touchmove = (e) => this.move(getTouchPositions(e));

    @HostListener('scroll', ['$event']) scroll = (e): void => {
        this._scrollX = this.rtl ? e.target.scrollWidth - e.target.scrollLeft - this.cdk.getViewportSize() : e.target.scrollLeft;
        this._scrollTop = e.target.scrollTop;
    }

    @HostListener('document:mouseup')
    @HostListener('touchend') finish = (): void => {
        if (this._swiped) {
            this.toggleSwiped(false);
            this.finalize();
        }
    }

    /** the bug-fix to prevent dragging images while swiping */
    @HostListener('document:dragstart', ['$event']) dragstart = (e): void => e.preventDefault();

    get changed(): boolean {
        let result = false;
        if (isNumber(this._prevClientX) && isNumber(this.options.threshold)) {
            const deltaX = Math.abs(this._prevClientX - this._clientX);
            result = deltaX >= this.options.threshold;
        }
        if (isNumber(this._prevClientY) && isNumber(this.options.threshold)) {
            const deltaY = Math.abs(this._prevClientY - this._clientY);
            result = result || deltaY >= this.options.threshold;
        }
        return result;
    }

    get rtl() {
        return this.dir?.value === 'rtl';
    }

    _mousemoveX = (e: IPositionEvent): void => {
        if (e) {
            const offset = this.cdk.measureScrollOffset();
            const c = this.rtl ? -1 : 1;
            const delta = (this._clientX - e.clientX) * c;
            const value = offset + delta;
            this.cdk.scrollToOffset(Math.abs(value));
            this._clientX = e.clientX;
        }
    }

    _mousemoveY = (e: IPositionEvent): void => {
        if (e) {
            const offset = this.cdk.measureScrollOffset();
            const value = offset - e.clientY + this._clientY;
            this.cdk.scrollToOffset(value);
            this._clientY = e.clientY;
        }
    }

    start = (e: IPositionEvent): void => {
        this.toggleSwiped(true);
        this._clientX = e.clientX;
        this._clientY = e.clientY;
        this._prevClientX = e.clientX;
        this._prevClientY = e.clientY;
    }

    move = (e: IPositionEvent): void => {
        if (this._swiped) {
            if (this.cdk.orientation === 'horizontal') {
                this._mousemoveX(e);
            }
            else if (this.cdk.orientation === 'vertical') {
                this._mousemoveY(e);
            }
        }
    }

    toggleSwiped = (value: boolean): void => {
        this._swiped = value;
    }

    finalize = (): void => {
        if (this.options.finalize) {
            this.scrollToNearestIndex();
        }
    }

    scrollToNearestIndex = (): void => {
        const scrolledAbs = this.cdk.orientation === 'horizontal' ? this._scrollX :
            this.cdk.orientation === 'vertical' ? this._scrollTop :
                null;
        if (isNumber(scrolledAbs) && isNumber(this._halfItemSize)) {
            const scrolled = scrolledAbs - this.itemSize * this._index;
            const index = scrolled > this._halfItemSize ? this._index + 1 : this._index;
            this.cdk.scrollToIndex(index, 'smooth');
        }
    }

    addEventListener = (): void => {
        this.cdk.elementRef.nativeElement.addEventListener('click', this.preventClicks, true);
    }

    removeEventListener = (): void => {
        this.cdk.elementRef.nativeElement.removeEventListener('click', this.preventClicks, true);
    }

    /** prevent all type of clicks (e.g. click on links, Angular`s click) */
    preventClicks = (e): void => {
        if (this.changed && this.options.preventClicks) {
            e.stopPropagation();
            e.preventDefault();
            e.stopImmediatePropagation();
        }
    }
}
