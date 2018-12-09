import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

export class MyDataSource extends DataSource<string | undefined> {

    private length = 100000;
    private pageSize = 20;
    private cachedData = Array.from<string>({ length: this.length });
    private fetchedPages = new Set<number>();
    private dataStream = new BehaviorSubject<(string | undefined)[]>(this.cachedData);
    private subscription = new Subscription();

    constructor() {
        super();
        console.clear();
    }

    connect(item: CollectionViewer): Observable<(string | undefined)[]> {
        this.subscription.add(item.viewChange.subscribe(range => {
            const startPage = this.getPageForIndex(range.start);
            const endPage = this.getPageForIndex(range.end - 1);
            for (let i = startPage; i <= endPage; i++) {
                this.fetchPage(i);
            }
        }));
        return this.dataStream;
    }

    disconnect(): void {
        this.subscription.unsubscribe();
    }

    private getPageForIndex(index: number): number {
        return Math.floor(index / this.pageSize);
    }

    private fetchPage(page: number) {
        if (this.fetchedPages.has(page)) {
            return;
        }
        this.fetchedPages.add(page);

        setTimeout(() => {
            const items = [...Array.from({ length: this.pageSize }).map((_, i) => `Item #${page * this.pageSize + i}`)];
            this.cachedData.splice(page * this.pageSize, this.pageSize, ...items);
            this.dataStream.next(this.cachedData);
        }, Math.random() * 3000 + 200);
    }
}

@Component({
    selector: 'ngx-source',
    styleUrls: ['ngx-data-source.css'],
    templateUrl: 'ngx-data-source.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxDataSourceComponent {

    items = new MyDataSource();
}
