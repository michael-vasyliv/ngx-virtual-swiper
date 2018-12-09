import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ContentChild, Directive, HostListener, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { isNumber } from 'util';
import { NgxVirtualSwiperOptions } from './constants';
import { INgxVirtualSwiperOptions } from './interfaces';

@Directive({
    selector: '[ngxVirtualSwiper]'
})
export class NgxVirtualSwiperDirective implements OnChanges, OnInit, OnDestroy {

    /**
     * to lean more see https://material.angular.io/cdk/scrolling/api
     * */
    @ContentChild(CdkVirtualScrollViewport) readonly cdk: CdkVirtualScrollViewport;
    @Input('ngxVirtualSwiper') options: Partial<INgxVirtualSwiperOptions>;
    readonly subscription = new Subscription();
    _isSwiped: boolean;
    _clientX: number;
    _clientY: number;
    _prevClientX: number;
    _prevClientY: number;
    _index: number;

    constructor() { }

    ngOnChanges(): void {
        this.options = { ...NgxVirtualSwiperOptions, ...this.options };
    }

    ngOnInit(): void {
        if (!this.cdk) {
            throw new Error('CdkVirtualScrollViewport is not present.');
        }
        this.subscription.add(this.cdk.scrolledIndexChange.subscribe(i => this._index = i));
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

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

    _mousemoveX = (e): void => {
        if (e) {
            const offset = this.cdk.measureScrollOffset(this.options.offsetXFrom);
            const value = offset - e.clientX + this._clientX;
            this.cdk.scrollToOffset(value);
            this._clientX = e.clientX;
        }
    }

    _mousemoveY = (e): void => {
        if (e) {
            const offset = this.cdk.measureScrollOffset(this.options.offsetYFrom);
            const value = offset - e.clientY + this._clientY;
            this.cdk.scrollToOffset(value);
            this._clientY = e.clientY;
        }
    }

    @HostListener('mousemove', ['$event']) mousemove = (e): void => {
        if (this._isSwiped && !this.options.disabled) {
            if (this.cdk.orientation === 'horizontal') {
                this._mousemoveX(e);
            }
            else if (this.cdk.orientation === 'vertical') {
                this._mousemoveY(e);
            }
        }
    }

    @HostListener('mousedown', ['$event']) mousedown = (e): void => {
        if (!this.options.disabled) {
            this.toggleSwiped(true);
            this._clientX = e.clientX;
            this._clientY = e.clientY;
            this._prevClientX = e.clientX;
            this._prevClientY = e.clientY;
            e.preventDefault();
        }
    }

    @HostListener('click', ['$event']) click = (e): void => {
        if (this.changed && this.options.preventDefaultClick) {
            e.preventDefault();
        }
    }

    @HostListener('document:mouseup') mouseup = (): void => {
        if (this._isSwiped && !this.options.disabled) {
            this.toggleSwiped(false);
            this.finalize();
        }
    }

    toggleSwiped = (value: boolean): void => {
        this._isSwiped = value;
    }

    finalize = (): void => this.options.finalize && this.cdk.scrollToIndex(this._index, 'smooth');
}
