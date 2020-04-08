import { ScrollingModule } from '@angular/cdk/scrolling';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxVirtualSwiperModule } from '../../projects/ngx-virtual-swiper/src/public-api';
import { AppComponent } from './app.component';
import { NgxDataSourceComponent } from './demos/data.source/ngx-data-source';
import { NgxHorizontalComponent } from './demos/horizontal/ngx-horizontal';

@NgModule({
    declarations: [
        AppComponent,
        NgxDataSourceComponent,
        NgxHorizontalComponent
    ],
    imports: [
        BrowserModule,
        NgxVirtualSwiperModule,
        ScrollingModule
    ],
    providers: [],
    entryComponents: [
        NgxDataSourceComponent,
        NgxHorizontalComponent
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
