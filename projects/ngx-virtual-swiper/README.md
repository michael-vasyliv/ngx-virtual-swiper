# NgxVirtualSwiper

<p align="center">
  <a href="https://www.npmjs.com/package/ngx-virtual-swiper">
    <img alt="npm version" src="https://img.shields.io/npm/v/ngx-virtual-swiper.svg">
  </a>
  <a href="https://www.npmjs.com/package/ngx-virtual-swiper">
    <img alt="npm" src="https://img.shields.io/npm/dm/ngx-virtual-swiper.svg">
  </a>
  <a href="https://github.com/vasyliv/ngx-virtual-swiper/blob/master/LICENSE">
    <img alt="licence" src="https://img.shields.io/npm/l/ngx-virtual-swiper.svg">
  </a>
</p>

## Getting Started

### Installation

Install via Package managers such as [npm][npm] or [yarn][yarn]

```bash
npm install ngx-virtual-swiper --save
# or
yarn add ngx-virtual-swiper
```

### Usage

Import `ngx-virtual-swiper` module

```typescript
import { NgxVirtualSwiperModule } from 'ngx-virtual-swiper';
import { ScrollingModule } from '@angular/cdk/scrolling';

@NgModule({
  imports: [ 
    ...
    ScrollingModule,
    NgxVirtualSwiperModule,
    ...
  ]
})
```

#### PeerDependencies

`ngx-virtual-swiper` depeneds on the following libraries to work.

* [@angular/material](https://material.angular.io/cdk/scrolling/api)
