import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ContentChild, Directive, HostListener, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { isNumber } from 'util';
import { NgxVirtualSwiperOptions } from './constants';
import { INgxVirtualSwiperOptions, IPositionEvent } from './interfaces';
import { getPositions } from './utils';

@Directive({
    selector: '[ngxVirtualSwiper]'
})
export class NgxVirtualSwiperDirective implements OnChanges, OnInit, OnDestroy {

    /** to lean more see https://material.angular.io/cdk/scrolling/api */
    @ContentChild(CdkVirtualScrollViewport) readonly cdk: CdkVirtualScrollViewport;
    @Input('ngxVirtualSwiper') options: Partial<INgxVirtualSwiperOptions>;
    @Input() itemSize: number;
    readonly subscription = new Subscription();
    _index: number;
    _halfItemSize: number;
    _isSwiped: boolean;
    _clientX: number;
    _clientY: number;
    _prevClientX: number;
    _prevClientY: number;
    /** Absolute scrolling by Y axis */
    _scrollTop: number;
    /** Absolute scrolling by X axis */
    _scrollLeft: number;

    constructor() { }

    ngOnChanges(): void {
        this.options = { ...NgxVirtualSwiperOptions, ...this.options };
        this._halfItemSize = this.itemSize / 2;
    }

    ngOnInit(): void {
        if (!this.cdk) {
            throw new Error('CdkVirtualScrollViewport is not present.');
        }
        this.addEventListener();
        this.subscription.add(this.cdk.scrolledIndexChange.subscribe(i => this._index = i));
    }

    ngOnDestroy(): void {
        this.removeEventListener();
        this.subscription.unsubscribe();
    }

    @HostListener('mousedown', ['$event']) mousedown = (e): void => this.start(getPositions(e));

    @HostListener('touchstart', ['$event']) touchstart = (e): void => this.start(getPositions(e));

    @HostListener('mousemove', ['$event']) mousemove = (e): void => this.move(getPositions(e));

    @HostListener('touchmove', ['$event']) touchmove = (e): void => this.move(getPositions(e));

    @HostListener('document:mouseup') mouseup = (): void => this.finish();

    @HostListener('touchend') touchend = (): void => this.finish();

    @HostListener('scroll', ['$event']) scroll = (e): void => {
        this._scrollLeft = e.target.scrollLeft;
        this._scrollTop = e.target.scrollTop;
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

    _mousemoveX = (e: IPositionEvent): void => {
        if (e) {
            const offset = this.cdk.measureScrollOffset();
            const value = offset - e.clientX + this._clientX;
            this.cdk.scrollToOffset(value);
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
        if (this._isSwiped) {
            if (this.cdk.orientation === 'horizontal') {
                this._mousemoveX(e);
            }
            else if (this.cdk.orientation === 'vertical') {
                this._mousemoveY(e);
            }
        }
    }

    finish = (): void => {
        if (this._isSwiped) {
            this.toggleSwiped(false);
            this.finalize();
        }
    }

    toggleSwiped = (value: boolean): void => {
        this._isSwiped = value;
    }

    finalize = (): void => {
        if (this.options.finalize) {
            this.scrollToNearestIndex();
        }
    }

    scrollToNearestIndex = (): void => {
        const scrolledAbs = this.cdk.orientation === 'horizontal' ? this._scrollLeft :
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
