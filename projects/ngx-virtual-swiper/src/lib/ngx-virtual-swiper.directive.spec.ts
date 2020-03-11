import { Directionality } from '@angular/cdk/bidi';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ElementRef } from '@angular/core';
import { of, Subscription } from 'rxjs';
import { NgxVirtualSwiperDirective } from './ngx-virtual-swiper.directive';
import { NgxVirtualSwiperOptions } from './options';
import { IPositionEvent } from './position-event';

describe('NgxVirtualSwiperDirective', () => {

    let directive: NgxVirtualSwiperDirective;

    let event: IPositionEvent;
    const scrollEvent = { target: { scrollLeft: 100, scrollTop: 200 } };
    let cdk: jasmine.SpyObj<CdkVirtualScrollViewport>;
    const options = new NgxVirtualSwiperOptions();

    beforeEach(() => {
        event = { clientX: 100, clientY: 200 };
        cdk = jasmine.createSpyObj<CdkVirtualScrollViewport>('CdkVirtualScrollViewport', [
            'scrollToOffset',
            'measureScrollOffset',
            'scrollToIndex'
        ]);

        directive = new NgxVirtualSwiperDirective(null, options, cdk);
    });

    it('has subscription', () => {
        expect(directive.subscription instanceof Subscription).toEqual(true);
    });

    describe('without cdk', () => {

        it('ngOnChanges, should have default values', () => {
            directive.itemSize = 100;
            directive.ngOnChanges();
            expect(directive._halfItemSize).toEqual(50);
        });
        it('ngOnDestroy, should call unsubscribe', () => {
            spyOn(directive, 'removeEventListener');
            directive.ngOnDestroy();
            expect(directive.subscription.closed).toEqual(true);
            expect(directive.removeEventListener).toHaveBeenCalled();
        });
    });

    describe('with cdk', () => {

        it('ngOnInit, should subscribe on index change and set the _index', () => {
            const index = 1;
            spyOn(directive.subscription, 'add');
            spyOn(directive, 'addEventListener');
            Object.defineProperty(cdk, 'scrolledIndexChange', { get() { return of(index) } });
            directive.ngOnInit();
            expect(directive.addEventListener).toHaveBeenCalled();
            expect(directive.subscription.add).toHaveBeenCalled();
            expect(directive._index).toEqual(index);
        });
        it('mousedown', () => {
            spyOn(directive, 'start');
            directive.mousedown(event);
            expect(directive.start).toHaveBeenCalledWith(event);
        });
        it('touchstart', () => {
            spyOn(directive, 'start');
            directive.touchstart({ touches: [event] });
            expect(directive.start).toHaveBeenCalledWith(event);
        });
        it('mousemove', () => {
            spyOn(directive, 'move');
            directive.mousemove(event);
            expect(directive.move).toHaveBeenCalledWith(event);
        });
        it('touchmove', () => {
            spyOn(directive, 'move');
            directive.touchmove({ touches: [event] });
            expect(directive.move).toHaveBeenCalledWith(event);
        });
        it('scroll, should set scroll variables', () => {
            directive.scroll(scrollEvent);
            expect(directive._scrollX).toEqual(scrollEvent.target.scrollLeft);
            expect(directive._scrollTop).toEqual(scrollEvent.target.scrollTop);
        });
        it('finish, should call toggleSwiped, finalize', () => {
            spyOn(directive, 'toggleSwiped');
            spyOn(directive, 'finalize');
            directive._swiped = true;
            directive.finish();
            expect(directive.toggleSwiped).toHaveBeenCalledWith(false);
            expect(directive.finalize).toHaveBeenCalled();
        });
        it('dragstart', () => {
            const preventDefault = jasmine.createSpy();
            directive.dragstart({ preventDefault });
            expect(preventDefault).toHaveBeenCalled();
        });

        describe('changed', () => {

            it('deltaX should be more than threshold', () => {
                directive._prevClientX = 100;
                directive._clientX = 300;
                expect(directive.changed).toEqual(true);
            });
            it('deltaY should be more than threshold', () => {
                directive._prevClientY = 100;
                directive._clientY = 300;
                expect(directive.changed).toEqual(true);
            });
        });

        describe('rtl', () => {

            it('undefined', () => {
                expect(directive.rtl).toEqual(false);
            });
            it('true', () => {
                directive = new NgxVirtualSwiperDirective({ value: 'rtl' } as Directionality, options, cdk);
                expect(directive.rtl).toEqual(true);
            });
        });

        it('_mousemoveX, should move to offset and set _clientX', () => {
            const offset = 1000;
            const _clientX = 0;
            cdk.measureScrollOffset.and.returnValue(offset);
            directive._clientX = _clientX;
            directive._mousemoveX(event);
            expect(cdk.measureScrollOffset).toHaveBeenCalled();
            expect(cdk.scrollToOffset).toHaveBeenCalledWith(offset - event.clientX + _clientX);
            expect(directive._clientX).toEqual(event.clientX);
        });
        it('_mousemoveY, should move to offset and set _clientY', () => {
            const offset = 1000;
            const _clientY = 0;
            cdk.measureScrollOffset.and.returnValue(offset);
            directive._clientY = _clientY;
            directive._mousemoveY(event);
            expect(cdk.measureScrollOffset).toHaveBeenCalled();
            expect(cdk.scrollToOffset).toHaveBeenCalledWith(offset - event.clientY + _clientY);
            expect(directive._clientY).toEqual(event.clientY);
        });
        it('start', () => {
            spyOn(directive, 'toggleSwiped');
            directive.start(event);
            expect(directive.toggleSwiped).toHaveBeenCalledWith(true);
            expect(directive._clientX).toEqual(event.clientX);
            expect(directive._clientY).toEqual(event.clientY);
            expect(directive._prevClientX).toEqual(event.clientX);
            expect(directive._prevClientY).toEqual(event.clientY);
        });

        describe('move', () => {

            it('shoould call _mousemoveX', () => {
                spyOn(directive, '_mousemoveX');
                directive._swiped = true;
                cdk.orientation = 'horizontal';
                directive.move(event);
                expect(directive._mousemoveX).toHaveBeenCalledWith(event);
            });
            it('shoould call _mousemoveY', () => {
                spyOn(directive, '_mousemoveY');
                directive._swiped = true;
                cdk.orientation = 'vertical';
                directive.move(event);
                expect(directive._mousemoveY).toHaveBeenCalledWith(event);
            });
        });

        it('toggleSwiped, should set a value to _isSwiped', () => {
            const value = true;
            directive.toggleSwiped(value);
            expect(directive._swiped).toEqual(value);
        });
        it('finalize', () => {
            spyOn(directive, 'scrollToNearestIndex');
            directive.finalize();
            expect(directive.scrollToNearestIndex).toHaveBeenCalled();
        });

        describe('scrollToNearestIndex, should call scrollToIndex', () => {

            beforeEach(() => {
                directive._halfItemSize = 25;
            });

            it('horizontal', () => {
                cdk.orientation = 'horizontal';
                directive._scrollX = scrollEvent.target.scrollLeft;
                directive.scrollToNearestIndex();
                expect(cdk.scrollToIndex).toHaveBeenCalledWith(directive._index, 'smooth');
            });
            it('vertical', () => {
                cdk.orientation = 'vertical';
                directive._scrollTop = scrollEvent.target.scrollTop;
                directive.scrollToNearestIndex();
                expect(cdk.scrollToIndex).toHaveBeenCalledWith(directive._index, 'smooth');
            });
            it('null', () => {
                directive.scrollToNearestIndex();
                expect(cdk.scrollToIndex).not.toHaveBeenCalled();
            });
            it('_scrollTop === null', () => {
                cdk.orientation = 'vertical';
                directive._scrollTop = scrollEvent.target.scrollTop;
                directive._halfItemSize = null;
                directive.scrollToNearestIndex();
                expect(cdk.scrollToIndex).not.toHaveBeenCalled();
            });
        });

        describe('set up nativeElement', () => {

            let element: jasmine.SpyObj<Document>;

            beforeEach(() => {
                element = jasmine.createSpyObj<Document>('Document', ['addEventListener', 'removeEventListener']);
                Object.defineProperty(cdk, 'elementRef', { get: () => new ElementRef(element) });
            });

            it('addEventListener', () => {
                directive.addEventListener();
                expect(element.addEventListener).toHaveBeenCalledWith('click', directive.preventClicks, true);
            });
            it('removeEventListener', () => {
                directive.removeEventListener();
                expect(element.removeEventListener).toHaveBeenCalledWith('click', directive.preventClicks, true);
            });
        });
    });

    it('preventClicks', () => {
        const e = jasmine.createSpyObj<MouseEvent>('MouseEvent', ['stopPropagation', 'preventDefault', 'stopImmediatePropagation']);
        Object.defineProperty(directive, 'changed', { get: () => true });
        directive.preventClicks(e);
        expect(e.stopPropagation).toHaveBeenCalled();
        expect(e.preventDefault).toHaveBeenCalled();
        expect(e.stopImmediatePropagation).toHaveBeenCalled();
    });
});
