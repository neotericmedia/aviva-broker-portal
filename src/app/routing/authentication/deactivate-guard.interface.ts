export interface DeactivateGuardInterface {
  canDeactivate: () => Promise<boolean>;
}
