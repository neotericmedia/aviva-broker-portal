import { Address } from '../../models';

export enum BindType {
  LOSS_PAYEE = 0,
  FIRST_MORTGAGEE = 1,
  SECOND_MORTGAGEE = 2,
  THIRD_MORTGAGEE = 3
}

export class BindForm {
  public name: string;
  public address: Address = new Address();
  public type: BindType;
  public value: string;
}
