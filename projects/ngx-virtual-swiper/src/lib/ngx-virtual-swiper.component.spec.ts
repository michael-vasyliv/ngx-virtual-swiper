import { of, Subscription } from 'rxjs';
import { NgxVirtualSwiperOptions } from './constants';
import { NgxVirtualSwiperDirective } from './ngx-virtual-swiper.directive';

describe('NgxVirtualSwiperDirective', () => {

    let directive: NgxVirtualSwiperDirective;

    const clickEvent = { clientX: 100, clientY: 200, preventDefault: () => { } };
    const scrollEvent = { target: { scrollLeft: 100, scrollTop: 200 } };
    const mockCdk = {
        get scrolledIndexChange() { return null; },
        scrollToOffset: () => { },
        measureScrollOffset: () => { },
        scrollToIndex: () => { }
    };

    beforeEach(() => {
        directive = new NgxVirtualSwiperDirective();
    });

    describe('checks', () => {
        it('has subscription', () => {
            expect(directive.subscription instanceof Subscription).toEqual(true);
        });
    });

    describe('methods', () => {
        describe('without cdk', () => {
            it('ngOnChanges, should have default values', () => {
                directive.itemSize = 100;
                directive.ngOnChanges();
                expect(directive.options).toEqual(NgxVirtualSwiperOptions);
                expect(directive._halfItemSize).toEqual(50);
            });
            it('ngOnInit, should be the error', () => {
                expect(() => directive.ngOnInit()).toThrow(new Error('CdkVirtualScrollViewport is not present.'));
            });
            it('ngOnDestroy, should call unsubscribe', () => {
                spyOn(directive.subscription, 'unsubscribe');
                spyOn(window, "clearTimeout");
                directive.ngOnDestroy();
                expect(directive.subscription.unsubscribe).toHaveBeenCalled();
                expect(window.clearTimeout).toHaveBeenCalledWith(directive._scrollTimer);
            });
        });
        describe('with cdk', () => {
            beforeEach(() => {
                Object.defineProperty(directive, 'cdk', { get: () => mockCdk });
                directive.options = NgxVirtualSwiperOptions;
            });
            it('ngOnInit, should subscribe on index change and set the _index', () => {
                const index = 1;
                spyOn(directive.subscription, 'add');
                spyOnProperty(directive.cdk, 'scrolledIndexChange', 'get').and.returnValue(of(index));
                directive.ngOnInit();
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
                spyOn(directive.cdk, 'measureScrollOffset').and.returnValue(offset);
                spyOn(directive.cdk, 'scrollToOffset');
                directive._clientX = _clientX;
                directive._mousemoveX(clickEvent);
                expect(directive.cdk.measureScrollOffset).toHaveBeenCalledWith(directive.options.offsetXFrom);
                expect(directive.cdk.scrollToOffset).toHaveBeenCalledWith(offset - clickEvent.clientX + _clientX);
                expect(directive._clientX).toEqual(clickEvent.clientX);
            });
            it('_mousemoveY, should move to offset and set _clientY', () => {
                const offset = 1000;
                const _clientY = 0;
                spyOn(directive.cdk, 'measureScrollOffset').and.returnValue(offset);
                spyOn(directive.cdk, 'scrollToOffset');
                directive._clientY = _clientY;
                directive._mousemoveY(clickEvent);
                expect(directive.cdk.measureScrollOffset).toHaveBeenCalledWith(directive.options.offsetYFrom);
                expect(directive.cdk.scrollToOffset).toHaveBeenCalledWith(offset - clickEvent.clientY + _clientY);
                expect(directive._clientY).toEqual(clickEvent.clientY);
            });
            describe('mousemove', () => {
                it('shoould call _mousemoveX', () => {
                    spyOn(directive, '_mousemoveX');
                    directive._isSwiped = true;
                    directive.cdk.orientation = 'horizontal';
                    directive.mousemove(clickEvent);
                    expect(directive._mousemoveX).toHaveBeenCalledWith(clickEvent);
                });
                it('shoould call _mousemoveY', () => {
                    spyOn(directive, '_mousemoveY');
                    directive._isSwiped = true;
                    directive.cdk.orientation = 'vertical';
                    directive.mousemove(clickEvent);
                    expect(directive._mousemoveY).toHaveBeenCalledWith(clickEvent);
                });
            });
            it('mousedown, should save position of cursor and call preventDefault', () => {
                spyOn(directive, 'toggleSwiped');
                spyOn(clickEvent, 'preventDefault');
                directive.mousedown(clickEvent);
                expect(directive.toggleSwiped).toHaveBeenCalledWith(true);
                expect(directive._clientX).toEqual(clickEvent.clientX);
                expect(directive._clientY).toEqual(clickEvent.clientY);
                expect(directive._prevClientX).toEqual(clickEvent.clientX);
                expect(directive._prevClientY).toEqual(clickEvent.clientY);
                expect(clickEvent.preventDefault).toHaveBeenCalled();
            });
            it('click, should call preventDefault', () => {
                spyOn(clickEvent, 'preventDefault');
                Object.defineProperty(directive, 'changed', { get: () => true });
                directive.click(clickEvent);
                expect(clickEvent.preventDefault).toHaveBeenCalled();
            });
            it('mouseup, should call toggleSwiped', () => {
                spyOn(directive, 'toggleSwiped');
                directive._isSwiped = true;
                directive.mouseup();
                expect(directive.toggleSwiped).toHaveBeenCalledWith(false);
            });
            it('scroll, should set scroll variables and call finalize', () => {
                spyOn(directive, 'finalize');
                directive.scroll(scrollEvent);
                expect(directive._scrollLeft).toEqual(scrollEvent.target.scrollLeft);
                expect(directive._scrollTop).toEqual(scrollEvent.target.scrollTop);
                expect(directive.finalize).toHaveBeenCalled();
            });
            it('toggleSwiped, should set a value to _isSwiped', () => {
                const value = true;
                directive.toggleSwiped(value);
                expect(directive._isSwiped).toEqual(value);
            });
            it('finalize', () => {
                spyOn(window, "clearTimeout");
                spyOn(window, "setTimeout");
                directive.finalize();
                expect(window.clearTimeout).toHaveBeenCalledWith(directive._scrollTimer);
                expect(window.setTimeout).toHaveBeenCalledWith(directive.scrollToNearestIndex, directive.options.finalizeTime);
            })
            describe('scrollToNearestIndex, should call scrollToIndex', () => {
                beforeEach(() => {
                    spyOn(directive.cdk, 'scrollToIndex');
                    directive._halfItemSize = 25;
                });
                it('horizontal', () => {
                    directive.cdk.orientation = 'horizontal';
                    directive._scrollLeft = scrollEvent.target.scrollLeft;
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
});
