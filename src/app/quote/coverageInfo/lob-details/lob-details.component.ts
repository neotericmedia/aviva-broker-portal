import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { TranslateService } from 'ng2-translate';

import { BaseNavComponent } from '../../../base';
import {
  CoverageRelationship,
  LobCoverage
} from '../../models';
import { NumberRangeValidator } from '../../../shared/validation/numberRangeValidator.ts';
import { CoverageInfoUtils } from '../coverageInfo.utils';
import { CoverageInputValidator, CoverageInputValue } from '../coverage-input/';
import { LobDetailsValidator } from './lob-details.validator';
import { LobDetailsService } from './lob-details.service';

@Component({
  selector: 'lob-details',
  styleUrls: ['./lob-details.component.scss'],
  templateUrl: './lob-details.component.html',
  providers: [LobDetailsService]
})
export class LobDetailsComponent extends BaseNavComponent implements OnInit {
  @Input() private lobCode: string;
  @Input() private parentForm: FormGroup;
  @Input() private lobCoverages: LobCoverage[];
  private isReady: boolean = false;
  private lobDetailsForm: FormGroup = this.formBuilder.group({});
  private showLimitHeader: boolean = false;
  private showDeductibleHeader: boolean = false;

  /**
   * Various maps for ease of access
   */
  // Coverage map <pseudoId, coverage>
  private lobCoverageMap: Map<string, LobCoverage> = new Map<string, LobCoverage>();
  // Coverage input value map <pseudoId, coverage values>
  private lobCoverageValueMap: Map<string, CoverageInputValue> = new Map<string, CoverageInputValue>();
  // Hash of pseudoId to each form control of coverage; used by coverage-input to get errors
  private formControlHash: any = {};

  constructor(
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private relationshipService: LobDetailsService
  ) {
    super();
  }

  public ngOnInit() {
    const coverages = this.lobCoverages;
    if (!coverages.length) {
      return;
    }

    // Start coverages' initialization
    let hasLimit: boolean = false;
    let hasDeductible: boolean = false;
    coverages.forEach((cvg, index) => {
      cvg.id = index;

      // Initialize each coverage
      const controlId = CoverageInfoUtils.getPseudoId(cvg);
      this.lobCoverageMap.set(controlId, cvg);
      const value: CoverageInputValue = new CoverageInputValue();
      if (CoverageInfoUtils.isSupportedLimitType(cvg)) {
        const limit = cvg.Limit || cvg.DefaultLimit;
        if (limit) {
          cvg.Limit = limit;
          value.limit = limit;
        } else {
          value.limit = '';
        }
        hasLimit = true;
      }
      if (CoverageInfoUtils.hasDeductible(cvg)) {
        const deductible1 = cvg.Deductible1 || cvg.Deductible1Default;
        if (deductible1) {
          cvg.Deductible1 = deductible1;
          value.deductible1 = deductible1;
        } else {
          value.deductible1 = '';
        }
        hasDeductible = true;
      }
      if (CoverageInfoUtils.hasTwoDeductibles(cvg)) {
        const deductible2 = cvg.Deductible2 || cvg.Deductible2Default;
        if (deductible2) {
          cvg.Deductible2 = deductible2;
          value.deductible2 = deductible2;
        } else {
          value.deductible2 = '';
        }
      }
      value.selected = cvg.isSelected;
      this.lobCoverageValueMap.set(controlId, value);
      const formControl = new FormControl(value, [CoverageInputValidator(cvg)]);
      this.formControlHash[controlId] = formControl;
      this.safeSubscribe(formControl.valueChanges)
        .subscribe(data => this.onCoverageChanged(controlId, cvg, data));
      this.lobDetailsForm.addControl(controlId, formControl);
    });

    this.showLimitHeader = hasLimit;
    this.showDeductibleHeader = hasDeductible;
    this.parentForm.addControl(this.lobCode, this.lobDetailsForm);

    this.relationshipService.reset(coverages);

    // Set form-level coverage relationship validators
    this.lobDetailsForm.setValidators([
      LobDetailsValidator.CMGroupValidator(this.relationshipService.get(CoverageRelationship.CM)),
      LobDetailsValidator.CDGroupValidator(this.relationshipService.get(CoverageRelationship.CD)),
      LobDetailsValidator.CEGroupValidator(this.relationshipService.get(CoverageRelationship.CE)),
      LobDetailsValidator.MEGroupValidator(this.relationshipService.get(CoverageRelationship.ME)),
      LobDetailsValidator.ParentGroupValidator(
        this.relationshipService.get(CoverageRelationship.PP), this.lobCoverageMap),
      LobDetailsValidator.NonEmptyValidator(this.relationshipService.get(CoverageRelationship.AA))
    ]);
    this.isReady = true;
  }

  /**
   * Propagate the logic to get pseudo id to template
   * @param cvg - Coverage object.
   */
  private getPseudoId(cvg: LobCoverage) {
    return CoverageInfoUtils.getPseudoId(cvg);
  }

  /**
   * This function is the handler of form control's value change subscription. When each
   * coverage input is changed, this function is notified. It performs the following steps:
   * 1. sync coverage model with associated form control.
   * 2. enforce relationship rules that can be easily auto-corrected by application, e.g. a group
   *    requires at least one coverage to be selected and user is about to deselect the only coverage that
   *    is being selected at the moment. The logic overrides user's will and re-select the coverage.
   * 3. enforce stand alone/associated coverage relationship.
   * @param controlId - ID of form control representing the coverage being notified with change.
   * @param cvg - Coverage object
   * @param data - Coverage input value
   */
  private onCoverageChanged(controlId: string, cvg: LobCoverage, data: CoverageInputValue) {
    // Step 1: update coverage's selection status, limit, deductibles based on formControl values combined
    this.lobCoverageValueMap.set(controlId, data);
    if (data.limit !== undefined) {
      cvg.Limit = data.limit;
    }
    if (data.deductible1 !== undefined) {
      cvg.Deductible1 = data.deductible1;
    }
    if (data.deductible2 !== undefined) {
      cvg.Deductible2 = data.deductible2;
    }

    if (cvg.isSelected !== data.selected) {
      cvg.isSelected = data.selected;
      // Step 2: enforce relationship rules among coverages in the same coverage group
      this.enforceRelationshipRules(cvg);
      // Step 3: enforce relationship rules among coverages with the same formNumber
      this.processAssociatedCoverages(cvg);
    }
  }

  /**
   * Select or deselect other coverages within the same coverage group
   * based on coverage relationship, and update page validity
   * @param cvg Coverage whose selection is just changed
   */
  private enforceRelationshipRules(cvg: LobCoverage) {
    const relationship = cvg.CoverageRelationship;
    if (!relationship) {
      return;
    }
    /*
      The idea of relationship enforcement is to find one enforcement at a time to avoid
      flooding of messages, e.g. not toggling selection of all applicable coverages all at once.
      All fields will be eventually enforced as along rounds of field's valueChanges.
    */
    const enumRelatioship = CoverageRelationship[relationship];
    switch (enumRelatioship) {
      case CoverageRelationship.ME: {
        /*
          Relationship: Mutually Exclusive (No more than one of the coverages in the group can be selected)
          Deselect all other coverages within same coverage group if one is selected.
        */
        if (cvg.isSelected) {
          // Assumption is there should be maximum only one other coverage is selected prior
          // to coming to this logic.
          // Deselect the other coverage that might have been selected earlier.
          this.findOneInGroupAndDeselect(enumRelatioship, cvg);
        }
        // When unselecting, there is no need to enforce anything as the rule is zero or one.
        // Let final validation before submission catch it.
        break;
      }
      case CoverageRelationship.CD: {
        /*
          Relationship: Co-dependant (All coverages in the group must be either selected or
          de-selected at the same time).
          Select or deselect all coverages at the same time.
        */
        const targetSelectionValue = cvg.isSelected;
        this.traverseGroupCoverages(enumRelatioship, cvg.CoverageGroup, (cvgInSameGroup: LobCoverage) => {
          // By the rule of CD, all coverages must be selected or deselected altogether.
          // If cvgInSameGroup which belongs to the same group as cvg but does not have the same
          // selection value as cvg, make it the same.
          if (!this.isSameCoverage(cvg, cvgInSameGroup) && Boolean(cvg.isSelected) !== Boolean(cvgInSameGroup.isSelected)) {
            this.toggleCoverageSelection(cvgInSameGroup, targetSelectionValue);
            // Stop checking relationship here
            return true;
          }
          return false;
        });
        break;
      }
      case CoverageRelationship.CM: {
        /*
          Relationship: Conditionally Mandatory (At least one of the coverages in the group
          must be selected, but more than one can be selected).
          Update CM groups of lob model, invalidate page if no coverage in group is selected.
        */
        if (!cvg.isSelected) {
          this.reselectIfLastInGroup(enumRelatioship, cvg);
        }
        break;
      }
      case CoverageRelationship.CE: {
        /*
          Relationship: Conditionally Exclusive (One of the coverages in the group must be
          selected, but only one can be selected at one time).
          CE = ME + mandatory condition.
        */
        if (cvg.isSelected) {
          this.findOneInGroupAndDeselect(enumRelatioship, cvg);
        } else {
          this.reselectIfLastInGroup(enumRelatioship, cvg);
        }
        break;
      }
      default:
        break;
    }
  }

  private toggleCoverageSelection(cvg: LobCoverage, isSelected: boolean) {
    const id = CoverageInfoUtils.getPseudoId(cvg);
    const value = this.lobCoverageValueMap.get(id);
    // force selection status on the field
    value.selected = isSelected;
    this.lobDetailsForm.get(id).setValue(value);
  }

  /**
   * In ME or CE relationship, only one coverage within the same group can be selected at all time.
   * This function is a common unit logic that deselects the others within the same group that has
   * been selected.
   * In the majority of cases, what happens is there is one coverage being selected and user selects
   * another coverage. In this case, the logic just needs to find the existing selected one and
   * deselect it.
   * In rare cases where there are more than one coverages being selected (data corruption cases) and
   * user is selecting a coverage. It is a very bad idea to try to be smart and auto-correct
   * everything.
   * This case should be left to coverage relationship validation mechanism to let user know what is
   * wrong.
   * Hence, the function only takes care of non corrupt data case to avoid complexity which is
   * avoided by relying on basic Form value change native logic.
   * @param relationship - Coverage relationship.
   * @param cvg - Coverage object
   */
  private findOneInGroupAndDeselect(relationship: CoverageRelationship, cvg: LobCoverage) {
    this.traverseGroupCoverages(relationship, cvg.CoverageGroup, (cvgInSameGroup: LobCoverage) => {
      if (!this.isSameCoverage(cvg, cvgInSameGroup) && cvgInSameGroup.isSelected) {
        this.toggleCoverageSelection(cvgInSameGroup, !cvgInSameGroup.isSelected);
        // Stop checking relationship here
        return true;
      }
      return false;
    });
  }

  /**
   * In CM or CE relationship, at least one coverage within the same group has to be selected.
   * This is a common unit logic where the application overrides user's action trying to deselect
   * the only selected item of the group. It reselect the coverage.
   * @param relationship - Coverage relationship type
   * @param cvg - Coverage object.
   */
  private reselectIfLastInGroup(relationship: CoverageRelationship, cvg: LobCoverage) {
    let noneIsSelected: boolean = true;
    this.traverseGroupCoverages(relationship, cvg.CoverageGroup, (cvgInSameGroup: LobCoverage) => {
      // Search if there is any other in the group being selected.
      if (!this.isSameCoverage(cvg, cvgInSameGroup) && cvgInSameGroup.isSelected) {
        noneIsSelected = false;
        // Stop checking relationship here.
        return true;
      }
      return false;
    });
    if (noneIsSelected) {
      // Since it's mandatory, unselect this one which is the only selected is disallowed.
      this.toggleCoverageSelection(cvg, true);
    }
  }

  /**
   * Check if two coverages are the same coverage.
   * @param cvg1 - First coverage
   * @param cvg2 - Second coverage
   */
  private isSameCoverage(cvg1: LobCoverage, cvg2: LobCoverage): boolean {
    return cvg1.id === cvg2.id;
  }

  private traverseGroupCoverages(
    relationship: CoverageRelationship,
    targetGroup: string,
    callback: (cvgInSameGroup: LobCoverage) => boolean
  ) {
    const group = this.relationshipService.get(relationship);
    const groupArray = Array.from(group.entries());
    for (let entry of groupArray) {
      const groupName = entry[0];
      if (groupName !== targetGroup) {
        continue;
      }
      const coverages = entry[1];
      coverages.some(callback);
      // when the group is found, break
      break;
    }
  }

  /**
   * Enforce stand alone/associated relationship among coverages with the same formNumber
   * whenever the selection status of a coverage in group is changed.
   * For example, if there are 3 selected associated coverages (with coverageOptionality
   * 'M', 'O' or 'T') when the last selected stand alone coverage is deselected, this
   * function is executed 3 times to deselect those 3 associated coverages one by one.
   * @param targetCvg The coverage in group which selection status is changed
   */
  private processAssociatedCoverages(targetCvg: LobCoverage) {
    const cvgsWithSameFormNum: LobCoverage[] = this.relationshipService.getCvgsWithSameFormNum(targetCvg.FormNumber);
    if (Array.isArray(cvgsWithSameFormNum) && cvgsWithSameFormNum.length) {
      let numOfSelectedStandaloneCvgs: number = 0;
      // Calulate number of selected stand alone coverages
      cvgsWithSameFormNum.forEach(cvg => {
        if (CoverageInfoUtils.isOptionalityStandAlone(cvg) && cvg.isSelected) {
          numOfSelectedStandaloneCvgs++;
        }
      });
      let _id: string;
      let _value: CoverageInputValue;
      if (numOfSelectedStandaloneCvgs === 0) {
        // if no stand alone coverage is selected, find a selected associated coverage
        const selectedCoverageIndex = cvgsWithSameFormNum.findIndex(cvg => {
          _id = CoverageInfoUtils.getPseudoId(cvg);
          _value = this.lobCoverageValueMap.get(_id);
          return _value.selected;
        });
        if (selectedCoverageIndex > -1) {
          // if found, unselect
          const selectedCoverage = cvgsWithSameFormNum[selectedCoverageIndex];
          _value.selected = false;
          // setValue() notify the subscriber, which calls onCoverageChanged()
          // that calls this function again to further process coverages in group
          this.lobDetailsForm.get(_id).setValue(_value);
        } else {
          // if not found, disable all associated coverages(CoverageOptionality T, M, O etc.)
          this.disableAssociatedCoverages(cvgsWithSameFormNum);
        }
      } else {
        // if there is(are) selected stand alone coverage(s), first ensure all associated
        // coverages are enabled
        this.enableAssociatedCoverages(cvgsWithSameFormNum);
        // find a mandatory or title coverage
        const unselectedCoverageIndex = cvgsWithSameFormNum.findIndex(cvg => {
          if (CoverageInfoUtils.isOptionalityMandatory(cvg) || CoverageInfoUtils.isTitle(cvg)) {
            _id = CoverageInfoUtils.getPseudoId(cvg);
            _value = this.lobCoverageValueMap.get(_id);
            return !_value.selected;
          }
        });
        if (unselectedCoverageIndex > -1) {
          // if found, select
          _value.selected = true;
          // setValue() notify the subscriber, which calls onCoverageChanged()
          // that calls this function again to further process coverages in group
          this.lobDetailsForm.get(_id).setValue(_value);
        }
      }
    }
  }

  // To disabled all associated coverages (CoverageOptionality M, O, T etc.)
  private disableAssociatedCoverages(cvgsWithSameFormNum: LobCoverage[]) {
    cvgsWithSameFormNum.forEach(cvg => {
      if (!CoverageInfoUtils.isOptionalityStandAlone(cvg)) {
        const id = CoverageInfoUtils.getPseudoId(cvg);
        this.lobDetailsForm.get(id).disable();
      }
    });
  }

  // To enable all coverages in the group with same formNumber
  private enableAssociatedCoverages(cvgsWithSameFormNum: LobCoverage[]) {
    cvgsWithSameFormNum.forEach(cvg => {
      const id = CoverageInfoUtils.getPseudoId(cvg);
      const cvgControl = this.lobDetailsForm.get(id);
      if (cvgControl.disabled) {
        cvgControl.enable();
      }
    });
  }
}
