import { Component, forwardRef, Input, AfterViewInit } from '@angular/core';
import { ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslateService } from 'ng2-translate';

import { BaseValueAccessor } from '../../../base';
import { BusinessInfoService } from '../businessInfo.service';
import { LOB, OfferingAndLobCodes } from '../../models';

@Component({
  selector: 'coverage-choices',
  styleUrls: ['./coverage-choices.component.scss'],
  templateUrl: './coverage-choices.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    // tslint:disable-next-line:no-forward-ref
    useExisting: forwardRef(() => CoverageChoicesComponent),
    multi: true
  }]
})
export class CoverageChoicesComponent extends BaseValueAccessor implements AfterViewInit {
  @Input()
  public set industryCode(value: string) {
    this._industryCode = value;
    // In edit mode, avoid calling the reloadLobs() before this.offeringAndLobCodes
    // is initialized, otherwise the saved LOBs cannot be recalled.
    if (this.isAfterViewInit) {
      this.reloadLobs();
    }
  }
  public get industryCode() {
    return this._industryCode;
  }
  private isAfterViewInit: boolean = false;
  private _industryCode: string;
  private offeringAndLobCodes: OfferingAndLobCodes = new OfferingAndLobCodes();
  private lobs: any;
  private mandatoryTitle: string = '';
  private isValueInitd = false;

  constructor(private translate: TranslateService, private businessInfoService: BusinessInfoService) {
    super();
    this.lobs = this.getNewLobs();
  }

  public ngAfterViewInit() {
    this.isAfterViewInit = true;
  }

  // Control Accessor Method Override
  public writeValue(value) {
    this.offeringAndLobCodes = value;
    this.reloadLobs(true);
  }

  private onClickLob(lobCode) {
    this.lobs.optional.some(cvg => {
      if (cvg.LOBCode === lobCode) {
        cvg.selected = !cvg.selected;
        let index = this.offeringAndLobCodes.lobCodes.indexOf(lobCode);
        if (cvg.selected) {
          if (index < 0) {
            this.offeringAndLobCodes.lobCodes.push(cvg.LOBCode);
          }
        } else {
          if (index > -1) {
            this.offeringAndLobCodes.lobCodes.splice(index, 1);
          }
        }
        return true;
      }
    });
    this.onInputChange();
  }

  private getNewLobs() {
    return {
      mandatory: [],
      optional: []
    };
  }

  private reloadLobs(useExisting?: boolean) {
    this.businessInfoService.getLOBs(this._industryCode).then(offeringLobs => {
      this.mandatoryTitle = offeringLobs.Product.Locale.Title;
      this.offeringAndLobCodes.offeringCode = offeringLobs.OfferingCode;
      const lobs = offeringLobs.LOBList;
      const existingLobCodes = this.offeringAndLobCodes.lobCodes;
      const newLobCodes = [];
      const newLobs = this.getNewLobs();
      if (Array.isArray(lobs)) {
        lobs.forEach(lob => {
          if (lob.LOBExistence === 'M') {
            lob.selected = true;
            newLobs.mandatory.push(lob);
            newLobCodes.push(lob.LOBCode);
          } else if (lob.LOBExistence === 'O') {
            lob.selected = false;
            if (useExisting) {
              existingLobCodes.some((lobCode) => {
                if (lobCode === lob.LOBCode) {
                  lob.selected = true;
                  newLobCodes.push(lob.LOBCode);
                  return true;
                }
              });
            }
            newLobs.optional.push(lob);
          }
        });
        this.offeringAndLobCodes.lobCodes = newLobCodes;
      } else {
        console.log('No lobs returned.');
      }
      newLobs.mandatory.sort(this.sortByLOBSequence);
      newLobs.optional.sort(this.sortByLOBSequence);
      this.lobs = newLobs;
    }).catch(e => {
      console.log('Error in getting lobs');
    });
  }

  /**
   * Function to sort the LOB based on LOBSequence
   */
  private sortByLOBSequence(Lob1: LOB, Lob2: LOB): number {
    if (Lob1.LOBSequence > Lob2.LOBSequence) {
      return 1;
    }
    if (Lob1.LOBSequence < Lob2.LOBSequence) {
      return -1;
    }
    return 0;
  }

  private onInputChange() {
    this.onChange(this.offeringAndLobCodes);
    this.onTouched();
  }
}
