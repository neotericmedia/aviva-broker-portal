import { Component, Input, ViewChild, EventEmitter, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { EmailValidator } from '../validation/emailValidator';

@Component({
  selector: 'email-modal',
  templateUrl: './email-modal.component.html',
  styleUrls: ['./email-modal.component.scss']
})
export class EmailModalComponent implements OnInit {
  @Input('subject') protected subject;
  @Input('recipient') protected recipient;
  @Input('message') protected message;
  @Input('sendButtonTitle') protected sendButtonTitle;
  @Input('onSend') protected onSend: Function;
  @ViewChild('sendEmailModal') protected sendEmailModal;

  private sender: string;
  private emailInfoForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder
  ) { }

  public ngOnInit() {
    this.emailInfoForm = this.formBuilder.group({
      subject: [this.subject, [Validators.required]],
      sender: [this.sender, [EmailValidator]],
      recipient: [this.recipient, [EmailValidator]],
      message: [this.message, [Validators.required]]
    });
  }

  public show(): void {
    this.sendEmailModal.setSpinner(false);
    this.sendEmailModal.show();
  }

  public hide(): void {
    this.sendEmailModal.setSpinner(false);
    this.sendEmailModal.hide();
  }

  public setRecipient(recipient: string): void {
    this.emailInfoForm.controls.recipient.setValue(recipient);
  }

  public setSubject(subject: string): void {
    this.emailInfoForm.controls.subject.setValue(subject);
  }

  public setMessage(message: string): void {
    this.emailInfoForm.controls.message.setValue(message);
  }

  protected send(event: any): void {
    this.sendEmailModal.setSpinner(true);
    const formValue = this.emailInfoForm.value;
    this.onSend({
      subject: formValue.subject,
      sender: formValue.sender,
      recipients: [formValue.recipient],
      message: formValue.message
    });
  }
}
