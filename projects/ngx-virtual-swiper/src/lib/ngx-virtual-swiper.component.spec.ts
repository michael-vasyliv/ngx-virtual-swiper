import { of, Subscription } from 'rxjs';
import { NgxVirtualSwiperOptions } from './constants';
import { NgxVirtualSwiperDirective } from './ngx-virtual-swiper.directive';

describe('NgxVirtualSwiperDirective', () => {

    let directive: NgxVirtualSwiperDirective;

    const e = {
        clientX: 100,
        clientY: 200,
        preventDefault: () => { }
    };
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
                directive.ngOnChanges();
                expect(directive.options).toEqual(NgxVirtualSwiperOptions);
            });
            it('ngOnInit, should be the error', () => {
                expect(() => directive.ngOnInit()).toThrow(Error('CdkVirtualScrollViewport is not present.'));
            });
            it('ngOnDestroy, should call unsubscribe', () => {
                spyOn(directive.subscription, 'unsubscribe');
                directive.ngOnDestroy();
                expect(directive.subscription.unsubscribe).toHaveBeenCalled();
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
                directive._mousemoveX(e);
                expect(directive.cdk.measureScrollOffset).toHaveBeenCalledWith(directive.options.offsetXFrom);
                expect(directive.cdk.scrollToOffset).toHaveBeenCalledWith(offset - e.clientX + _clientX);
                expect(directive._clientX).toEqual(e.clientX);
            });
            it('_mousemoveY, should move to offset and set _clientY', () => {
                const offset = 1000;
                const _clientY = 0;
                spyOn(directive.cdk, 'measureScrollOffset').and.returnValue(offset);
                spyOn(directive.cdk, 'scrollToOffset');
                directive._clientY = _clientY;
                directive._mousemoveY(e);
                expect(directive.cdk.measureScrollOffset).toHaveBeenCalledWith(directive.options.offsetYFrom);
                expect(directive.cdk.scrollToOffset).toHaveBeenCalledWith(offset - e.clientY + _clientY);
                expect(directive._clientY).toEqual(e.clientY);
            });
            describe('mousemove', () => {
                it('shoould call _mousemoveX', () => {
                    spyOn(directive, '_mousemoveX');
                    directive._isSwiped = true;
                    directive.cdk.orientation = 'horizontal';
                    directive.mousemove(e);
                    expect(directive._mousemoveX).toHaveBeenCalledWith(e);
                });
                it('shoould call _mousemoveY', () => {
                    spyOn(directive, '_mousemoveY');
                    directive._isSwiped = true;
                    directive.cdk.orientation = 'vertical';
                    directive.mousemove(e);
                    expect(directive._mousemoveY).toHaveBeenCalledWith(e);
                });
            });
            it('mousedown, should save position of cursor and call preventDefault', () => {
                spyOn(directive, 'toggleSwiped');
                spyOn(e, 'preventDefault');
                directive.mousedown(e);
                expect(directive.toggleSwiped).toHaveBeenCalledWith(true);
                expect(directive._clientX).toEqual(e.clientX);
                expect(directive._clientY).toEqual(e.clientY);
                expect(directive._prevClientX).toEqual(e.clientX);
                expect(directive._prevClientY).toEqual(e.clientY);
                expect(e.preventDefault).toHaveBeenCalled();
            });
            it('click, should call preventDefault', () => {
                spyOn(e, 'preventDefault');
                Object.defineProperty(directive, 'changed', { get: () => true });
                directive.click(e);
                expect(e.preventDefault).toHaveBeenCalled();
            });
            it('mouseup, should call toggleSwiped and finalize', () => {
                spyOn(directive, 'toggleSwiped');
                spyOn(directive, 'finalize');
                directive._isSwiped = true;
                directive.mouseup();
                expect(directive.toggleSwiped).toHaveBeenCalledWith(false);
                expect(directive.finalize).toHaveBeenCalled();
            });
            it('toggleSwiped, should set a value to _isSwiped', () => {
                const value = true;
                directive.toggleSwiped(value);
                expect(directive._isSwiped).toEqual(value);
            });
            it('finalize, should call scrollToIndex', () => {
                spyOn(directive.cdk, 'scrollToIndex');
                directive.finalize();
                expect(directive.cdk.scrollToIndex).toHaveBeenCalledWith(directive._index, 'smooth');
            });
        });
    });
});
