import { ScrollingModule } from '@angular/cdk/scrolling';
import { async, TestBed } from '@angular/core/testing';
import { NgxVirtualSwiperModule } from 'projects/ngx-virtual-swiper/src/public_api';
import { AppComponent } from './app.component';
import { NgxDataSourceComponent } from './demos/data.source/ngx-data-source';
import { NgxHorizontalComponent } from './demos/horizontal/ngx-horizontal';

describe('AppComponent', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                AppComponent,
                NgxDataSourceComponent,
                NgxHorizontalComponent
            ],
            imports: [
                NgxVirtualSwiperModule,
                ScrollingModule
            ]
        }).compileComponents();
    }));

    it('should create the app', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.debugElement.componentInstance;
        expect(app).toBeTruthy();
    });

    it(`should have as title 'ngx-virtual-swiper-demo'`, () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.debugElement.componentInstance;
        expect(app.title).toEqual('ngx-virtual-swiper-demo');
    });
});
