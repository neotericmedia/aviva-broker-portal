import { OnInit, Component, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BaseFormComponent } from '../../../base/base-form.component';
import { PremiumDetails } from './premium-details.model';
import { TranslateService } from 'ng2-translate';
import { InfoCard } from '../info-card/info-card.model';

@Component({
  selector: 'premium-details',
  templateUrl: './premium-details.component.html',
  styleUrls: ['./premium-details.component.scss']
})
export class PremiumDetailsComponent extends BaseFormComponent implements OnInit {

  private quoteDatesForm: FormGroup;
  private minEffectiveDate: Date;
  private maxEffectiveDate: Date;
  private initEffectiveDate: Date;
  @Input() private parentForm: FormGroup;
  @Input() private data: PremiumDetails;
  @Input() private businessInfoData: InfoCard;

  constructor(
    private formBuilder: FormBuilder,
    protected translate: TranslateService
  ) {
    super(translate);
  }

  public async ngOnInit() {
    this.initEffectiveDate = this.data.effectiveDate;
    this.minEffectiveDate = new Date();
    this.maxEffectiveDate = this.moment(this.minEffectiveDate).add(3, 'months').toDate();

    this.quoteDatesForm = this.formBuilder.group({
      effectiveDt: [new Date(this.data.effectiveDate), Validators.required],
      expiryDt: [new Date(this.data.expiryDate), Validators.required]
    });

    this.parentForm.addControl('quoteDates', this.quoteDatesForm);
  }

  private onUpdateEffectiveDate(value) {
    this.quoteDatesForm.controls.expiryDt.setValue(this.moment(value).add(1, 'year').toDate());
  }
}
