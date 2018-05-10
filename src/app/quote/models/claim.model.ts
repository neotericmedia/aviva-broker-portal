import { Skip } from 'serializer.ts/Decorators';
import { Option } from './DropdownOption.model';

export class Claim {
  public lineOfBusiness: string = '';
  public lineOfBusinessId: number;
  public lossDate: Date;
  public lossType: string = '';
  public lossTypeId: number;
  public status: string = '';
  public statusId: number;

  constructor(copy?: Claim) {
    if (copy) {
      this.lineOfBusiness = copy.lineOfBusiness;
      this.lineOfBusinessId = copy.lineOfBusinessId;
      this.lossDate = new Date(copy.lossDate);
      this.lossType = copy.lossType;
      this.lossTypeId = copy.lossTypeId;
      this.status = copy.status;
      this.statusId = copy.statusId;
    }
  }
}

export class LossTypes {
  public Casualty: Option[];
  public Property: Option[];
}
