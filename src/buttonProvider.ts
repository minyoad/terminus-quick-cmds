import {
  HotkeysService,
  IToolbarButton,
  ToolbarButtonProvider,
} from "terminus-core";

import { Injectable } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { QuickCmdsModalComponent } from "./components/quickCmdsModal.component";

@Injectable()
export class ButtonProvider extends ToolbarButtonProvider {
  constructor(private ngbModal: NgbModal, hotkeys: HotkeysService) {
    super();
    hotkeys.matchedHotkey.subscribe(async (hotkey) => {
      if (hotkey === "qc") {
        this.activate();
      }
    });
  }

  activate() {
    this.ngbModal.open(QuickCmdsModalComponent);
  }

  provide(): IToolbarButton[] {
    return [
      {
        icon: require("./icons/keyboard.svg"),
        weight: 5,
        title: "Quick commands",
        touchBarNSImage: "NSTouchBarComposeTemplate",
        click: async () => {
          this.activate();
        },
      },
    ];
  }
}
