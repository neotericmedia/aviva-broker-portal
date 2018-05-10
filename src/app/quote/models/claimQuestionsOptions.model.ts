import { Option } from './DropdownOption.model';

export class ClaimQuestionsOptions {
    public LOB: Option[];
    public LossType: LossType;
    public Status: Option[];
}

class LossType {
    public Property: Option[];
    public Casualty: Option[];
}
