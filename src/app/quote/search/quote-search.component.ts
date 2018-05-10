import { OnInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Ng2SmartTableModule, LocalDataSource } from 'ng2-smart-table';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { deserialize } from 'serializer.ts/Serializer';
import { BaseFormComponent } from '../../base';
import { QuoteService } from '../../quote/shared/quote.service';
import { QuoteSearchService } from './quote-search.service';
import { TranslateService } from 'ng2-translate';
import { Quote } from '../models';

@Component({
  selector: 'quote-search',
  styleUrls: ['./quote-search.component.scss'],
  templateUrl: './quote-search.component.html',
  providers: [QuoteSearchService]
})
export class QuoteSearchComponent extends BaseFormComponent implements OnInit {

  private source: LocalDataSource;
  private hasStatusMap: boolean = false;
  private quoteStatusMap = {};
  private settings;
  private quoteSearch: SearchResult[];
  private ifShowSpinner: boolean = false;
  private tableInitIsReady: boolean = false;
  private quoteSearchForm: FormGroup;

  private maxFromDate: Date = this.moment(new Date()).add(1, 'year').toDate();
  private maxToDate: Date = this.moment(new Date()).add(1, 'year').toDate();
  private minToDate: Date = new Date();

  private sidebarOpened:boolean = false;
  private sidebarPosition = 'right';
  // Quote number selected for version history
  private versionHistoryQuoteNum: string;

  constructor(
    protected router: Router,
    protected toastr: ToastsManager,
    protected translate: TranslateService,
    private formBuilder: FormBuilder,
    private quoteSearchService: QuoteSearchService,
    private quoteService: QuoteService
  ) {
    super(translate, router);
    this.source = new LocalDataSource(this.quoteSearch);
    // Need to wait to make sure translation is properly initialized.
    this.safeSubscribe(this.translate.get('quoteSearch.date')).subscribe((res: string) => {
      const copyString = this.translate.instant('quoteSearch.copy');
      const editString = this.translate.instant('quoteSearch.edit');
      const historyString = this.translate.instant('quoteSearch.history');
      this.settings = {
        hideSubHeader: true,
        noDataMessage: this.translate.instant('quoteSearch.notFound'),
        attr: {
          class: 'table table-striped table-hover'
        },
        actions: {
          columnTitle: this.translate.instant('quoteSearch.actions'),
          add: false,
          edit: false,
          delete: false,
          custom: [{
            name: 'copy',
            title: `
              <div class="quote-action">
                <span>
                  <i class="fa fa-files-o" aria-hidden="true" title="` + copyString + `"></i>
                </span>
              </div>
            `
          }, {
            name: 'edit',
            title: `
              <div class="quote-action">
                <span>
                  <i class="fa fa-pencil" aria-hidden="true" title="` + editString + `"></i>
                </span>
              </div>
            `
          },{
            name: 'history',
            title: `
              <div class="quote-action">
                <span>
                  <i class="fa fa-history" aria-hidden="true" title="` + historyString + `"></i>
                </span>
              </div>
            `
          }]
        },
        columns: {
          effectiveDate: {
            title: res,
            sort: true,
            sortDirection: 'asc',
            filter: false,
            valuePrepareFunction: (cell) => {
              return this.formatDateTime(cell);
            }
          },
          _id: {
            title: this.translate.instant('quoteSearch.quoteNumber'),
            sort: true,
            filter: false
          },
          namedInsured: {
            title: this.translate.instant('quoteSearch.companyName'),
            sort: true,
            filter: false
          },
          brokerName: {
            title: this.translate.instant('quoteSearch.broker'),
            sort: true,
            filter: false
          },
          deviatedTotalPremium: {
            title: this.translate.instant('quoteSearch.premium'),
            sort: true,
            filter: false
          },
          statusValue: {
            title: this.translate.instant('quoteSearch.status'),
            sort: true,
            filter: false
          }
        }
      };
      this.tableInitIsReady = true;
    });
  }

  public ngOnInit() {
    this.quoteSearchForm = this.formBuilder.group({
      searchNumber: new FormControl(),
      fromDate: new FormControl(new Date()),
      toDate: new FormControl(new Date())
    });
    this.getStatusMap();
    this.findQuoteByDates();
  }

  private onUpdateFromDate(selectedDate) {
    this.quoteSearchForm.controls.fromDate.setValue(selectedDate);
    this.minToDate = selectedDate;
    const toDateControl = this.quoteSearchForm.controls.toDate;
    if (selectedDate > toDateControl.value) {
      toDateControl.setValue(selectedDate);
    }
  }

  private findQuoteNumber(event) {
    const quoteNumber = this.quoteSearchForm.controls.searchNumber.value.trim();
    if (quoteNumber) {
      this.quoteSearchService.findByQuoteNumber(quoteNumber).then(response => {
        this.quoteSearch = this.processResponse([response]);
      }).catch((error) => {
        this.toastr.error(error.message);
      });
    }
  }

  private getStatusMap() {
    this.quoteService.getStatusMap().then(response => {
      if (Object.keys(response).length) {
        this.hasStatusMap = true;
        this.quoteStatusMap = response;
      }
    }).catch(e => {
      this.toastr.error(this.translate.instant('generic.error'));
    });
  }

  private findQuoteByDates() {
    this.toggleSpinner();
    const from = this.moment(this.quoteSearchForm.value.fromDate).format('YYYY-MM-DD');
    // Add 1 day to 'To' date to return quotes created at 'To' date
    const to = this.moment(this.quoteSearchForm.value.toDate).add(1, 'day').format('YYYY-MM-DD');
    this.quoteSearchService.getQuotesByDates(from, to).then(response => {
      const quotes: Quote[] = deserialize<Quote[]>(Quote, response) || [];
      this.quoteSearch = this.processResponse(quotes);
      this.quoteSearchForm.controls.searchNumber.reset();
      this.toggleSpinner();
    }).catch(e => {
      this.toastr.error(this.translate.instant('quoteSearch.error.noData'));
      this.toggleSpinner();
    });
  }

  private onCustomAction(event) {
    const quote = event.data;
    const quoteNumber = quote && quote._id;
    if (event.action === 'copy') {
      this.navigateTo(['/quote/' + quoteNumber + '/copy']);
    } else if (event.action === 'edit') {
      const quoteStatus = quote.status;
      if (this.hasStatusMap) {
        if (this.quoteStatusMap['SUMMARIZED'] === quoteStatus
          || this.quoteStatusMap['QUOTED'] === quoteStatus) {
          this.navigateTo(['/summary/' + quoteNumber]);
        } else if (this.quoteStatusMap['DRAFT'] === quoteStatus
          || this.quoteStatusMap['UW_RULES_1'] === quoteStatus) {
          this.navigateTo(['/quote/' + quoteNumber]);
        } else if (this.quoteStatusMap['DRAFT_2'] === quoteStatus
          || this.quoteStatusMap['UW_RULES_2'] === quoteStatus) {
          this.navigateTo(['/coverageInfo/' + quoteNumber]);
        } else if (this.quoteStatusMap['BOUND'] === quoteStatus) {
          this.navigateTo(['/bind/' + quoteNumber]);
        }
      } else {
        this.toastr.error(this.translate.instant('generic.error'));
      }
    } else if(event.action === 'history') {
      this.sidebarOpened = !this.sidebarOpened;
      this.versionHistoryQuoteNum = quoteNumber;
    }
  }

  private processResponse(quotes: Quote[]): SearchResult[] {
    return quotes.map(res => {
      const result = new SearchResult();
      result.effectiveDate = res.getBusinessInfo.effectiveDate;
      result._id = res.getQuoteId;
      result.namedInsured = res.getBusinessInfo.namedInsured;
      result.brokerName = res.getBusinessInfo.brokerName;
      result.deviatedTotalPremium = res.getDeviatedTotalPremium;
      result.status = res.getStatus;
      result.statusValue = res.getStatusValue;
      return result;
    });
  }

  private toggleSpinner() {
    this.ifShowSpinner = !this.ifShowSpinner;
  }

  private handleTimelineBackButtonClicked() {
    this.sidebarOpened = !this.sidebarOpened;
  }
}

class SearchResult {
  public effectiveDate: Date;
  public _id: string;
  public namedInsured: string;
  public brokerName: string;
  public deviatedTotalPremium: number;
  public status: number;
  public statusValue: string;
}
