export enum CoverageRelationship {
  // Product model based relationships
  ME = <any>'ME',
  CD = <any>'CD',
  CM = <any>'CM',
  CE = <any>'CE',
  /**
   *  Custom relationships
   */
  // When PossibleParentForms is present per coverage
  // at least one of parents should be selected.
  PP = <any>'PP',
  // At least one of the coverages per LOB should be selected.
  AA = <any>'AA'
}
