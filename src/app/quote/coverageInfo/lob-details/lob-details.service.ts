import { Injectable } from '@angular/core';
import {
  CoverageRelationship,
  LobCoverage
} from '../../models';
import { CoverageInfoUtils } from '../coverageInfo.utils';

/**
 * Manage all metadata services related to lob section. Currently metadata includes
 * tracking what coverages belong to the same relationship group and the same form number.
 */
@Injectable()
export class LobDetailsService {
  // Relationship group map <relationship type, <group name, coverages>>
  private groupRelationshipsMap: Map<CoverageRelationship, Map<string, LobCoverage[]>> =
    new Map<CoverageRelationship, Map<string, LobCoverage[]>>();
  // Map of all coverages belonging to the same form number <form number, coverages>
  private sameFormNumberMap: Map<string, LobCoverage[]>;

  constructor() {
    Object.keys(CoverageRelationship).forEach((relationship) => {
      const enumRelatioship = CoverageRelationship[relationship];
      this.groupRelationshipsMap.set(enumRelatioship, new Map<string, LobCoverage[]>());
    });
    this.sameFormNumberMap = new Map<string, LobCoverage[]>();
  }

  public reset(coverages: LobCoverage[]) {
    Object.keys(CoverageRelationship).forEach((relationship) => {
      const enumRelatioship = CoverageRelationship[relationship];
      this.groupRelationshipsMap.get(enumRelatioship).clear();
    });
    this.sameFormNumberMap.clear();

    // Track non-empty LOB validation
    const allMap = this.groupRelationshipsMap.get(CoverageRelationship.AA);
    allMap.set(String(CoverageRelationship.AA), coverages);

    // Pre-initialization
    coverages.forEach((cvg) => {
      // Build form number map
      const hasFormNumber = this.sameFormNumberMap.has(cvg.FormNumber);
      let formNumCvgs;
      if (!hasFormNumber) {
        formNumCvgs = [] as LobCoverage[];
        this.sameFormNumberMap.set(cvg.FormNumber, formNumCvgs);
      } else {
        formNumCvgs = this.sameFormNumberMap.get(cvg.FormNumber);
      }
      formNumCvgs.push(cvg);

      // Track sibling relationships among all coverages
      const relationship = cvg.CoverageRelationship;
      const group = this.groupRelationshipsMap.get(CoverageRelationship[relationship]);
      const groupName = cvg.CoverageGroup;
      if (!group || !groupName) {
        return;
      }
      if (group.has(groupName)) {
        const groups = group.get(groupName);
        groups.push(cvg);
      } else {
        group.set(groupName, [cvg]);
      }
    });

    // Run another round to track parent relationships which relies on
    // sameFormNumberMap
    coverages.forEach((cvg) => {
      // Track parent relationships among all coverages
      const parentForms: string[] = cvg.PossibleParentForms;
      const parentGroup = this.groupRelationshipsMap.get(CoverageRelationship.PP);
      const coverageId = CoverageInfoUtils.getPseudoId(cvg);
      if (Array.isArray(parentForms) && parentForms.length) {
        let parents: LobCoverage[] = [] as LobCoverage[];
        // putting all coverages that match one of these form number into dependencies
        parentForms.forEach(formNumber => {
          const cvgsOfFormNumber: LobCoverage[] = this.sameFormNumberMap.get(formNumber);
          if (Array.isArray(cvgsOfFormNumber) && cvgsOfFormNumber.length) {
            parents = parents.concat(cvgsOfFormNumber);
          }
        });
        parentGroup.set(coverageId, parents);
      }
    });
  }

  public get(relationship: CoverageRelationship) {
    return this.groupRelationshipsMap.get(relationship);
  }

  public getCvgsWithSameFormNum(formNum: string): LobCoverage[] {
    return this.sameFormNumberMap.get(formNum);
  }
}
