import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { TranslateService } from 'ng2-translate';
import { QuoteSearchService } from '../../quote/search/quote-search.service';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import * as moment from 'moment';

import { Timeline } from './timeline.model';
import { QuoteTimelineResponse } from '../../quote/models/QuoteTimelineResponse.model';

@Component({
  selector: 'timeline-view',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
  providers: [QuoteSearchService]
})

/**
 * Timeline Component to handle retrieving
 * data from service and populating the timeline.modal
 */
export class TimelineComponent implements OnChanges {

  protected items: Timeline[] = new Array();

  @Input()
  protected quoteNum: string;

  @Output()
  protected backButtonClicked = new EventEmitter();

  private versionHistoryTitle: string;

  constructor(protected translate: TranslateService,
    private quoteSearchService: QuoteSearchService,
    private toastr: ToastsManager) {
  }

  /**
   * Called when @input(quoteNum) changes.
   */
  public ngOnChanges(changes: SimpleChanges) {
    let selectedQuoteNum = changes['quoteNum'].currentValue;
    this.versionHistoryTitle = this.translate.instant('version.history', { quoteNumber: selectedQuoteNum });

    if (selectedQuoteNum) {
      this.items.length = 0;
      this.quoteSearchService.getQuoteTimelineByQuoteNum(selectedQuoteNum).then(timelines => {
        timelines.forEach(timelineResponse => {
          let timeline: Timeline = new Timeline();
          timeline.body = timelineResponse.userName;
          timeline.timestamp = moment(timelineResponse.createdDate).fromNow();
          timeline.title = timelineResponse.status;

          this.items.push(timeline);
        });
      }).catch((error) => {
        this.handleError(error);
      });
    }
  }

  private handleError(error) {
    this.toastr.error(this.translate.instant('version.notFound'));
  }

  /**
   * Function to notify parent component
   * that back button was clicked
   */
  private backBtnClicked() {
    this.backButtonClicked.emit();

  }
}
