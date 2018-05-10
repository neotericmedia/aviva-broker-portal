import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'choice-scroller',
  templateUrl: './choice-scroller.component.html',
  styleUrls: ['./choice-scroller.component.scss']
})
export class ChoiceScrollerComponent implements OnInit {
  @Input() public choiceList: any = [];
  @Input() public onChange;
  public selected: any;

  public ngOnInit() {}

  public select(item) {
    this.selected = item;
  }
}
