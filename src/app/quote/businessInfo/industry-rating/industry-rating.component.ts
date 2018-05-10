import { Observable } from 'rxjs/Observable';
import { IndustrySearchService } from '../industry-search/industry-search.service';
import { BaseFormComponent } from '../../../base';
import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { TranslateService } from 'ng2-translate';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IndustryRating } from './industry-rating.model';
import { BusinessInfoService } from '../businessInfo.service';

@Component({
  selector: 'industry-rating',
  templateUrl: './industry-rating.component.html',
  providers: [
    BusinessInfoService,
    IndustrySearchService
  ]
})
export class IndustryRatingComponent extends BaseFormComponent implements OnInit, AfterViewInit {
  @Input() public onUpdateIndustryRatingInfo: Function;
  @Input() public industryRatingInfo: IndustryRating;
  @Input() public parentForm: FormGroup;
  @Input() public showErrors: boolean;

  private isReady: boolean = false;
  private industryRatingForm: FormGroup;
  private industryCodeControl: FormControl;
  private industryInfoDS: Observable<any>;
  private industryInfoText: string;
  private industryInfoLoading: boolean;
  private industryInfoNoMatch: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private businessInfoService: BusinessInfoService,
    private industrySearchService: IndustrySearchService,
    protected translate: TranslateService
  ) {
    super(translate);
    this.industryInfoDS = Observable
      .create((observer: any) => {
        // Runs on every search
        observer.next(this.industryInfoText);
      })
      .mergeMap((token: string) => this.industrySearchService.search(token));
  }

  public ngOnInit() {
    // Create form
    this.industryCodeControl =
      new FormControl(this.industryRatingInfo.industryCode, Validators.required);
    this.industryRatingForm = this.formBuilder.group({
      industryCode: this.industryCodeControl
    });
    this.parentForm.addControl('industryRating', this.industryRatingForm);
    this.isReady = true;
  }

  public ngAfterViewInit() {
    if (this.industryRatingInfo && this.industryRatingInfo.industryCode) {
      this.safeSubscribe(
        this.industrySearchService.searchByCode(this.industryRatingInfo.industryCode)
      ).subscribe(industryInfo => {
        if (industryInfo) {
          const item = this.industrySearchService.getAutocompleteItem(industryInfo);
          this.industryInfoText = item.title;
          this.updateIndustry({
            item: industryInfo
          });
        }
      });
    }
  }

  private updateIndustry(event) {
    if (event && event.item) {
      this.industryRatingInfo.industryCode = event.item.IndustryCode;
      this.industryRatingInfo.industryCodeDescription = event.item.Locale.Description;
      const ratingBasis = event.item.RatingBasis;
      this.industryRatingInfo.ratingBasis = ratingBasis;
      this.onUpdateIndustryRatingInfo(ratingBasis);
    }
  }

  private setIndustryLoading(isLoading: boolean) {
    this.industryInfoLoading = isLoading;
    this.industryInfoNoMatch = false;
  }

  private setIndustryNoMatch(isNoMatch: boolean) {
    this.industryInfoNoMatch = isNoMatch;
    this.industryInfoLoading = false;
  }

  private onBlurIndustry() {
    if (this.industryInfoNoMatch) {
      this.industryCodeControl.reset();
    }
  }
}
