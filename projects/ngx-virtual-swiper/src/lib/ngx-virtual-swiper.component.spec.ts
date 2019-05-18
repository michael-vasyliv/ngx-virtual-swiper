import { Directionality } from '@angular/cdk/bidi';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { of, Subscription } from 'rxjs';
import { NgxVirtualSwiperDirective } from './ngx-virtual-swiper.directive';
import { NgxVirtualSwiperOptions } from './options';
import { IPositionEvent } from './position-event';

describe('NgxVirtualSwiperDirective', () => {

    let directive: NgxVirtualSwiperDirective;

    let event: IPositionEvent;
    const scrollEvent = { target: { scrollLeft: 100, scrollTop: 200 } };
    let cdk: jasmine.SpyObj<CdkVirtualScrollViewport>;
    let dir: Directionality;
    let options = new NgxVirtualSwiperOptions();

    beforeEach(() => {
        event = { clientX: 100, clientY: 200 };
        cdk = jasmine.createSpyObj<CdkVirtualScrollViewport>('CdkVirtualScrollViewport', [
            'scrollToOffset',
            'measureScrollOffset',
            'scrollToIndex'
        ])
        directive = new NgxVirtualSwiperDirective(dir, options);
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
        it('ngOnInit, should be the error', () => {
            expect(() => directive.ngOnInit()).toThrow(new Error('CdkVirtualScrollViewport is not present.'));
        });
        it('ngOnDestroy, should call unsubscribe', () => {
            spyOn(directive, 'removeEventListener');
            directive.ngOnDestroy();
            expect(directive.subscription.closed).toEqual(true);
            expect(directive.removeEventListener).toHaveBeenCalled();
        });
    });

    describe('with cdk', () => {

        let scrolledIndexChangeSpy = jasmine.createSpy('scrolledIndexChange', () => of(null));

        beforeEach(() => {
            Object.defineProperty(cdk, 'scrolledIndexChange', { get: () => scrolledIndexChangeSpy })
            Object.defineProperty(directive, 'cdk', { get: () => cdk });
        });

        it('ngOnInit, should subscribe on index change and set the _index', () => {
            const index = 1;
            spyOn(directive.subscription, 'add');
            spyOn(directive, 'addEventListener');
            spyOnProperty(directive.cdk, 'scrolledIndexChange', 'get').and.returnValue(of(index));
            directive.ngOnInit();
            expect(directive.addEventListener).toHaveBeenCalled();
            expect(directive.subscription.add).toHaveBeenCalled();
            expect(directive._index).toEqual(index);
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

        it('_mousemoveX, should move to offset and set _clientX', () => {
            const offset = 1000;
            const _clientX = 0;
            cdk.measureScrollOffset.and.returnValue(offset);
            directive._clientX = _clientX;
            directive._mousemoveX(event);
            expect(directive.cdk.measureScrollOffset).toHaveBeenCalled();
            expect(directive.cdk.scrollToOffset).toHaveBeenCalledWith(offset - event.clientX + _clientX);
            expect(directive._clientX).toEqual(event.clientX);
        });
        it('_mousemoveY, should move to offset and set _clientY', () => {
            const offset = 1000;
            const _clientY = 0;
            cdk.measureScrollOffset.and.returnValue(offset);
            directive._clientY = _clientY;
            directive._mousemoveY(event);
            expect(directive.cdk.measureScrollOffset).toHaveBeenCalled();
            expect(directive.cdk.scrollToOffset).toHaveBeenCalledWith(offset - event.clientY + _clientY);
            expect(directive._clientY).toEqual(event.clientY);
        });

        describe('mousemove', () => {

            it('shoould call _mousemoveX', () => {
                spyOn(directive, '_mousemoveX');
                directive._swiped = true;
                directive.cdk.orientation = 'horizontal';
                directive.move(event);
                expect(directive._mousemoveX).toHaveBeenCalledWith(event);
            });
            it('shoould call _mousemoveY', () => {
                spyOn(directive, '_mousemoveY');
                directive._swiped = true;
                directive.cdk.orientation = 'vertical';
                directive.move(event);
                expect(directive._mousemoveY).toHaveBeenCalledWith(event);
            });
        });

        it('mousedown, should save position of cursor and call preventDefault', () => {
            spyOn(directive, 'toggleSwiped');
            directive.start(event);
            expect(directive.toggleSwiped).toHaveBeenCalledWith(true);
            expect(directive._clientX).toEqual(event.clientX);
            expect(directive._clientY).toEqual(event.clientY);
            expect(directive._prevClientX).toEqual(event.clientX);
            expect(directive._prevClientY).toEqual(event.clientY);
        });
        it('mouseup, should call toggleSwiped', () => {
            spyOn(directive, 'toggleSwiped');
            directive._swiped = true;
            directive.finish();
            expect(directive.toggleSwiped).toHaveBeenCalledWith(false);
        });
        it('scroll, should set scroll variables', () => {
            directive.scroll(scrollEvent);
            expect(directive._scrollX).toEqual(scrollEvent.target.scrollLeft);
            expect(directive._scrollTop).toEqual(scrollEvent.target.scrollTop);
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
                directive.cdk.orientation = 'horizontal';
                directive._scrollX = scrollEvent.target.scrollLeft;
                directive.scrollToNearestIndex();
                expect(directive.cdk.scrollToIndex).toHaveBeenCalledWith(directive._index, 'smooth');
            });
            it('vertical', () => {
                directive.cdk.orientation = 'vertical';
                directive._scrollTop = scrollEvent.target.scrollTop;
                directive.scrollToNearestIndex();
                expect(directive.cdk.scrollToIndex).toHaveBeenCalledWith(directive._index, 'smooth');
            });
            it('null', () => {
                directive.scrollToNearestIndex();
                expect(directive.cdk.scrollToIndex).not.toHaveBeenCalled();
            });
            it('_scrollTop === null', () => {
                directive.cdk.orientation = 'vertical';
                directive._scrollTop = scrollEvent.target.scrollTop;
                directive._halfItemSize = null;
                directive.scrollToNearestIndex();
                expect(directive.cdk.scrollToIndex).not.toHaveBeenCalled();
            });
        });
    });
});
