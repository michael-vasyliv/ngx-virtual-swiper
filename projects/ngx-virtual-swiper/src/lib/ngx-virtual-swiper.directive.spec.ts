import { Directionality } from '@angular/cdk/bidi';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ElementRef } from '@angular/core';
import { of, Subscription } from 'rxjs';
import { NgxVirtualSwiperDirective } from './ngx-virtual-swiper.directive';
import { NgxVirtualSwiperOptions } from './options';
import { IPositionEvent } from './position-event';

describe('NgxVirtualSwiperDirective', () => {

    let directive: NgxVirtualSwiperDirective;

    const scrollEvent = { target: { scrollLeft: 100, scrollTop: 200 } };
    const options = new NgxVirtualSwiperOptions();
    let event: IPositionEvent;
    let cdk: jasmine.SpyObj<CdkVirtualScrollViewport>;

    beforeEach(() => {
        event = { clientX: 100, clientY: 200 };
        cdk = jasmine.createSpyObj<CdkVirtualScrollViewport>('CdkVirtualScrollViewport', [
            'scrollToOffset',
            'measureScrollOffset',
            'scrollToIndex',
            'getDataLength'
        ]);
        cdk.getDataLength.and.returnValue(10);

        directive = new NgxVirtualSwiperDirective(null, options, cdk);
        directive.itemSize = 100;
    });

    it('has subscription', () => {
        expect(directive.subscription instanceof Subscription).toEqual(true);
    });

    describe('without cdk', () => {

        it('ngOnDestroy, should call unsubscribe', () => {
            spyOn(directive, 'removeEventListener');
            directive.ngOnDestroy();
            expect(directive.subscription.closed).toEqual(true);
            expect(directive.removeEventListener).toHaveBeenCalled();
        });
    });

    describe('with cdk', () => {

        it('ngOnInit, should subscribe on index change and set the index', () => {
            const index = 1;
            spyOn(directive.subscription, 'add');
            spyOn(directive, 'addEventListener');
            Object.defineProperty(cdk, 'scrolledIndexChange', { get() { return of(index); } });
            directive.ngOnInit();
            expect(directive.addEventListener).toHaveBeenCalled();
            expect(directive.subscription.add).toHaveBeenCalled();
            expect(directive.index).toEqual(index);
        });
        it('onMousedown', () => {
            spyOn(directive, 'start');
            directive.onMousedown(event);
            expect(directive.start).toHaveBeenCalledWith(event);
        });
        it('onMouchstart', () => {
            spyOn(directive, 'start');
            directive.onTouchstart({ touches: [event] });
            expect(directive.start).toHaveBeenCalledWith(event);
        });
        it('onMousemove', () => {
            spyOn(directive, 'move');
            directive.onMousemove(event);
            expect(directive.move).toHaveBeenCalledWith(event);
        });
        it('onTouchmove', () => {
            spyOn(directive, 'move');
            directive.onTouchmove({ touches: [event] });
            expect(directive.move).toHaveBeenCalledWith(event);
        });
        it('onFinish, should call toggleSwiped, finalize', () => {
            spyOn(directive, 'toggleSwiped');
            spyOn(directive, 'finalize');
            directive.swiped = true;
            directive.onFinish();
            expect(directive.toggleSwiped).toHaveBeenCalledWith(false);
            expect(directive.finalize).toHaveBeenCalled();
        });
        it('onDragstart', () => {
            const preventDefault = jasmine.createSpy();
            directive.onDragstart({ preventDefault });
            expect(preventDefault).toHaveBeenCalled();
        });

        describe('changed', () => {

            it('deltaX should be more than threshold', () => {
                directive.prevClientX = 100;
                directive.clientX = 300;
                expect(directive.changed).toEqual(true);
            });
            it('deltaY should be more than threshold', () => {
                directive.prevClientY = 100;
                directive.clientY = 300;
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

        it('mousemoveX, should move to offset and set clientX', () => {
            const offset = 1000;
            const clientX = 0;
            cdk.measureScrollOffset.and.returnValue(offset);
            directive.clientX = clientX;
            directive.mousemoveX(event);
            expect(cdk.measureScrollOffset).toHaveBeenCalled();
            expect(cdk.scrollToOffset).toHaveBeenCalledWith(offset - event.clientX + clientX);
            expect(directive.clientX).toEqual(event.clientX);
        });
        it('mousemoveY, should move to offset and set clientY', () => {
            const offset = 1000;
            const clientY = 0;
            cdk.measureScrollOffset.and.returnValue(offset);
            directive.clientY = clientY;
            directive.mousemoveY(event);
            expect(cdk.measureScrollOffset).toHaveBeenCalled();
            expect(cdk.scrollToOffset).toHaveBeenCalledWith(offset - event.clientY + clientY);
            expect(directive.clientY).toEqual(event.clientY);
        });
        it('start', () => {
            spyOn(directive, 'toggleSwiped');
            directive.start(event);
            expect(directive.toggleSwiped).toHaveBeenCalledWith(true);
            expect(directive.clientX).toEqual(event.clientX);
            expect(directive.clientY).toEqual(event.clientY);
            expect(directive.prevClientX).toEqual(event.clientX);
            expect(directive.prevClientY).toEqual(event.clientY);
        });

        describe('move', () => {

            it('shoould call mousemoveX', () => {
                spyOn(directive, 'mousemoveX');
                directive.swiped = true;
                cdk.orientation = 'horizontal';
                directive.move(event);
                expect(directive.mousemoveX).toHaveBeenCalledWith(event);
            });
            it('shoould call mousemoveY', () => {
                spyOn(directive, 'mousemoveY');
                directive.swiped = true;
                cdk.orientation = 'vertical';
                directive.move(event);
                expect(directive.mousemoveY).toHaveBeenCalledWith(event);
            });
        });

        it('toggleSwiped, should set a value to isSwiped', () => {
            const value = true;
            directive.toggleSwiped(value);
            expect(directive.swiped).toEqual(value);
        });
        it('finalize', () => {
            spyOn(directive, 'scrollToNearestIndex');
            directive.finalize();
            expect(directive.scrollToNearestIndex).toHaveBeenCalled();
        });

        describe('scrollToNearestIndex, should call scrollToIndex', () => {

            const threshold = 30;

            beforeEach(() => {

                directive.index = 1;
            });

            it('horizontal the same index', () => {
                cdk.orientation = 'horizontal';
                directive.clientX = scrollEvent.target.scrollLeft;
                directive.prevClientX = scrollEvent.target.scrollLeft - threshold;
                directive.scrollToNearestIndex();
                expect(cdk.scrollToIndex).toHaveBeenCalledWith(1, 'smooth');
            });
            it('horizontal next index', () => {
                cdk.orientation = 'horizontal';
                directive.clientX = scrollEvent.target.scrollLeft;
                directive.prevClientX = scrollEvent.target.scrollLeft + threshold;
                directive.scrollToNearestIndex();
                expect(cdk.scrollToIndex).toHaveBeenCalledWith(2, 'smooth');
            });
            it('vertical the same index', () => {
                cdk.orientation = 'vertical';
                directive.clientY = scrollEvent.target.scrollTop;
                directive.prevClientY = scrollEvent.target.scrollTop - threshold;
                directive.scrollToNearestIndex();
                expect(cdk.scrollToIndex).toHaveBeenCalledWith(1, 'smooth');
            });
            it('vertical next index', () => {
                cdk.orientation = 'vertical';
                directive.clientY = scrollEvent.target.scrollTop;
                directive.prevClientY = scrollEvent.target.scrollTop + threshold;
                directive.scrollToNearestIndex();
                expect(cdk.scrollToIndex).toHaveBeenCalledWith(2, 'smooth');
            });
            it('null', () => {
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
