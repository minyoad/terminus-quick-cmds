import { Component, ElementRef, Input, ViewChild } from "@angular/core";

import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  template: require("./promptModal.component.pug"),
})
export class PromptModalComponent {
  @Input() value: string;
  @Input() password: boolean;
  @ViewChild("input") input: ElementRef;

  constructor(private modalInstance: NgbActiveModal) {}

  ngOnInit() {
    this.input.nativeElement.focus();
  }

  ok() {
    this.modalInstance.close(this.value);
  }

  cancel() {
    this.modalInstance.close("");
  }
}
