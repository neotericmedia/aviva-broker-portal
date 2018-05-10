import { Component } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from 'ng2-translate';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { BaseFormComponent } from '../../base';
import { IndustrySearchService } from '../../quote/businessInfo/industry-search/industry-search.service';
import { IndustryInfoAutocompleteItem } from '../../quote/businessInfo/industry-search/industry-search.model';
import { IndustryCodeCondition } from '../../quote/models/IndustryCodeCondition.model';
import { DeactivateGuardInterface } from '../../routing/authentication/deactivate-guard.interface';
import { Observable, Subject } from 'rxjs';

@Component({
  selector: 'industrycodesearch',
  styleUrls: ['./industrycodesearch.component.scss'],
  templateUrl: './industrycodesearch.component.html',
  providers: [IndustrySearchService]
})
export class IndustryCodeSearchComponent extends BaseFormComponent {

  /**
   * Observable to hold typeahead for Industry keyword search.
   */
  private keywordSearchDS: Observable<any>;
  private industryInfoText: string;

  private showPolicyRestrictions: boolean;

  private items: IndustryInfoAutocompleteItem[];
  private industryCodeConditions: IndustryCodeCondition[] = [];

  private selectedIndustryCodeDescription: string;
  private selectedIndustryCodeKeyword: string;
  private selectedIndustryCode: string;

  constructor(
    protected router: Router,
    protected translate: TranslateService,
    protected industrySearchService: IndustrySearchService
  ) {
    super(translate, router);

    this.keywordSearchDS = Observable
      .create((observer: any) => {
        // Runs on every search
        observer.next(this.industryInfoText);
      })
      .mergeMap((token: string) => this.industrySearchService.searchByKeyword(token));
  }

  public getIndustryCodeCondition(): IndustryCodeCondition[] {
    return this.industryCodeConditions;
  }

  private hidePolicyRestrictions() {
    this.showPolicyRestrictions = false;
    this.industryInfoText = '';
  }

  /**
   * Function called when user selects
   * an industry code from autocomplete
   */
  private updateIndustryCode(event) {
    if (event && event.item && event.item.IndustryCode) {
      this.selectedIndustryCodeDescription = event.item.Locale.Description;
      this.selectedIndustryCodeKeyword = event.item.Keywords.en;
      this.selectedIndustryCode = event.item.IndustryCode;
      this.industrySearchService.retrieveIndustryCodeCondition(event.item.IndustryCode).then((data) => {
        this.industryCodeConditions = data;
        if (this.industryCodeConditions.length > 0) {
          this.showPolicyRestrictions = true;
        } else {
          this.showPolicyRestrictions = false;
        }
      }).catch(error => {
        this.showPolicyRestrictions = false;
      });
      this.industryInfoText = '';
    }
  }

  private startQuote() {
    this.router.navigate(['/broker/businessInfo'], {
      queryParams: { industryCode: this.selectedIndustryCode }
    });
  }
}
