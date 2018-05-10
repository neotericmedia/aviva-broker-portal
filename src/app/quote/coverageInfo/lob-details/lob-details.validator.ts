import { ValidatorFn, FormGroup } from '@angular/forms';
import { CoverageRelationship, LobCoverage } from '../../models';
import { CoverageInfoUtils } from '../coverageInfo.utils';
import { CoverageInputValue } from './coverage-input.value';

export class LobDetailsValidator {
  /**
   * CM - Conditionally Mandatory. Must select at least one. More than one ok.
   * @param groups - CM groups hash; name of group is key
   */
  public static CMGroupValidator(
    groups: Map<string, LobCoverage[]>
  ): ValidatorFn {
    const groupsArray = Array.from(groups.entries());
    return (formGroup: FormGroup): { [key: string]: any } => {
      let result = null;
      for (let entry of groupsArray) {
        const groupName = entry[0];
        const coverages = entry[1];
        let isValid = false;
        coverages.some(cvg => {
          // if found at least one in the group that is selected
          const id = CoverageInfoUtils.getPseudoId(cvg);
          const value = formGroup.get(id).value;
          if (value.selected) {
            isValid = true;
            return true;
          }
        });
        if (!isValid) {
          result = LobDetailsValidator.setErrors(
            'cmGroupsFailure',
            groupName,
            formGroup,
            coverages
          );
        } else {
          LobDetailsValidator.resetErrors(
            'cmGroupsFailure',
            groupName,
            formGroup,
            coverages
          );
        }
      }
      return result;
    };
  }

  /**
   * CE - Conditionally Exclusive. Must select one. And only one must be selected.
   * @param groups - CE groups hash; name of group is key
   */
  public static CEGroupValidator(
    groups: Map<string, LobCoverage[]>
  ): ValidatorFn {
    const groupsArray = Array.from(groups.entries());
    return (formGroup: FormGroup): { [key: string]: any } => {
      let result = null;
      for (let entry of groupsArray) {
        const groupName = entry[0];
        const coverages = entry[1];
        let isValid = false;
        let selectionCount = 0;
        coverages.some(cvg => {
          // if found at least one in the group that is selected
          if (cvg.isSelected) {
            selectionCount++;
            if (selectionCount === 1) {
              isValid = true;
            } else {
              isValid = false;
              return true;
            }
          }
        });
        if (!isValid) {
          result = LobDetailsValidator.setErrors(
            'ceGroupsFailure',
            groupName,
            formGroup,
            coverages
          );
        } else {
          LobDetailsValidator.resetErrors(
            'ceGroupsFailure',
            groupName,
            formGroup,
            coverages
          );
        }
      }
      return result;
    };
  }

  /**
   * CD - Co-dependent. All covs in this group must be selected or deselected together.
   * @param groups - CD groups hash; name of group is key
   */
  public static CDGroupValidator(
    groups: Map<string, LobCoverage[]>
  ): ValidatorFn {
    const groupsArray = Array.from(groups.entries());
    return (formGroup: FormGroup): { [key: string]: any } => {
      let result = null;
      for (let entry of groupsArray) {
        const groupName = entry[0];
        const coverages = entry[1];
        let selectionCount = 0;
        coverages.forEach(cvg => {
          if (cvg.isSelected) {
            selectionCount++;
          }
        });
        if (selectionCount === 0 || selectionCount === coverages.length) {
          LobDetailsValidator.resetErrors(
            'cdGroupsFailure',
            groupName,
            formGroup,
            coverages
          );
        } else {
          result = LobDetailsValidator.setErrors(
            'cdGroupsFailure',
            groupName,
            formGroup,
            coverages
          );
        }
      }
      return result;
    };
  }

  /**
   * ME - Mutually Exclusive. No more than one can be selected. That is, selecting none or only one are ok.
   * @param groups - ME groups hash; name of group is key
   */
  public static MEGroupValidator(
    groups: Map<string, LobCoverage[]>
  ): ValidatorFn {
    const groupsArray = Array.from(groups.entries());
    return (formGroup: FormGroup): { [key: string]: any } => {
      let result = null;
      for (let entry of groupsArray) {
        const groupName = entry[0];
        const coverages = entry[1];
        let isValid = true;
        let selectionCount = 0;
        coverages.some(cvg => {
          if (cvg.isSelected) {
            selectionCount++;
            if (selectionCount > 1) {
              isValid = false;
              return true;
            }
          }
        });
        if (!isValid) {
          result = LobDetailsValidator.setErrors(
            'meGroupsFailure',
            groupName,
            formGroup,
            coverages
          );
        } else {
          LobDetailsValidator.resetErrors(
            'meGroupsFailure',
            groupName,
            formGroup,
            coverages
          );
        }
      }
      return result;
    };
  }

  /**
   * Parent Group - If a child has been selected and has parents, at least one of the parent must be selected.
   * @param groups - Parent groups hash; id of child coverage is key
   */
  public static ParentGroupValidator(
    groups: Map<string, LobCoverage[]>,
    coveragesMap: Map<string, LobCoverage>
  ): ValidatorFn {
    const groupsArray = Array.from(groups.entries());
    return (formGroup: FormGroup): { [key: string]: any } => {
      let result = null;
      for (let entry of groupsArray) {
        const groupName = entry[0];
        const parentCoverages: LobCoverage[] = entry[1];
        const childCoverage = formGroup.get(groupName);
        const childValue = childCoverage.value;
        let isValid = false;
        // If the child is not selected, no point to check parents
        if (childValue.selected) {
          parentCoverages.some(cvg => {
            // if found at least one in the group that is selected
            const id = CoverageInfoUtils.getPseudoId(cvg);
            const value = formGroup.get(id).value;
            if (value.selected) {
              isValid = true;
              return true;
            }
          });
        } else {
          isValid = true;
        }
        if (!isValid) {
          result = LobDetailsValidator.setParentErrors(
            groupName,
            formGroup,
            parentCoverages,
            coveragesMap
          );
        } else {
          LobDetailsValidator.resetErrors(
            'ppGroupsFailure',
            groupName,
            formGroup,
            parentCoverages
          );
        }
      }
      return result;
    };
  }

  /**
   * At least one coverage must be selected per LOB
   * @param coverages - all coverages within this LOB
   */
  public static NonEmptyValidator(
    coverageGroups: Map<string, LobCoverage[]>
  ): ValidatorFn {
    const groupsArray = Array.from(coverageGroups.entries());
    return (formGroup: FormGroup): { [key: string]: any } => {
      let result = null;
      let isValid = false;
      // There should be only one coverage group because this is all coverages
      for (let entry of groupsArray) {
        const coverages: LobCoverage[] = entry[1];
        coverages.some(cvg => {
          if (cvg.isSelected) {
            isValid = true;
            return true;
          }
        });
        if (!isValid) {
          result = LobDetailsValidator.setErrors(
            'nonEmptyGroupsFailure',
            String(CoverageRelationship.AA),
            formGroup,
            coverages
          );
        } else {
          LobDetailsValidator.resetErrors(
            'nonEmptyGroupsFailure',
            String(CoverageRelationship.AA),
            formGroup,
            coverages
          );
        }
      }
      return result;
    };
  }

  private static setErrors(
    type: string,
    groupName: string,
    formGroup,
    coverages
  ): any {
    // set error to each field about failed relationship validation.
    const allGroupNames = coverages.map(cvg => cvg.Locale.Title);
    const result = {};
    result[groupName] = {
      type,
      groups: allGroupNames
    };
    coverages.forEach(cvg => {
      const id = CoverageInfoUtils.getPseudoId(cvg);
      const formControl = formGroup.get(id);
      if (formControl.valid) {
        formControl.setErrors(result);
      }
    });
    return result;
  }

  private static setParentErrors(
    groupName: string,
    formGroup,
    parentCoverages,
    coveragesMap: Map<string, LobCoverage>
  ): any {
    // set error to each field about failed relationship validation.
    const allGroupNames = parentCoverages.map(cvg => cvg.Locale.Title);
    const result = {};
    const childCvg = coveragesMap.get(groupName);
    result[groupName] = {
      type: 'ppGroupsFailure',
      childName: childCvg.Locale.Title,
      groups: allGroupNames
    };
    parentCoverages.forEach(cvg => {
      const id = CoverageInfoUtils.getPseudoId(cvg);
      const formControl = formGroup.get(id);
      // Only set more error when the form is valid, e.g. show one error at a time.
      if (formControl.valid) {
        formControl.setErrors(result);
      }
    });
    return result;
  }

  private static resetErrors(type, groupName, formGroup, coverages) {
    coverages.forEach(cvg => {
      const id = CoverageInfoUtils.getPseudoId(cvg);
      const formControl = formGroup.get(id);
      const currentErrors = Object.assign({}, formControl._errors);
      // When there is no error left, it is important to set error to NULL so the field
      // becomes VALID, e.g. empty object will not work.
      let newErrors = null;
      // Opposite of setting errors, clearing error should only do on its own error;
      // otherwise, one validator will clear error from another validator.
      if (currentErrors) {
        const currentError = currentErrors[groupName];
        if (currentError && currentError.type && currentError.type === type) {
          delete currentErrors[groupName];
        }
        if (Object.keys(currentErrors).length) {
          newErrors = currentErrors;
        }
      }
      formControl.setErrors(newErrors);
    });
  }
}
