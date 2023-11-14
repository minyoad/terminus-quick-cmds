import { ConfigProvider, ToolbarButtonProvider } from "terminus-core";

import { ButtonProvider } from "./buttonProvider";
import { CommonModule } from "@angular/common";
import { EditCommandModalComponent } from "./components/editCommandModal.component";
import { FormsModule } from "@angular/forms";
import { NgModule } from "@angular/core";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { PromptModalComponent } from "./components/promptModal.component";
import { QuickCmdsConfigProvider } from "./config";
import { QuickCmdsModalComponent } from "./components/quickCmdsModal.component";
import { QuickCmdsSettingsTabComponent } from "./components/quickCmdsSettingsTab.component";
import { QuickCmdsSettingsTabProvider } from "./settings";
import { SettingsTabProvider } from "terminus-settings";
import TerminusCoreModule from "terminus-core";

@NgModule({
  imports: [NgbModule, CommonModule, FormsModule, TerminusCoreModule],
  providers: [
    { provide: ToolbarButtonProvider, useClass: ButtonProvider, multi: true },
    { provide: ConfigProvider, useClass: QuickCmdsConfigProvider, multi: true },
    {
      provide: SettingsTabProvider,
      useClass: QuickCmdsSettingsTabProvider,
      multi: true,
    },
  ],
  entryComponents: [
    PromptModalComponent,
    EditCommandModalComponent,
    QuickCmdsModalComponent,
    QuickCmdsSettingsTabComponent,
  ],
  declarations: [
    PromptModalComponent,
    EditCommandModalComponent,
    QuickCmdsModalComponent,
    QuickCmdsSettingsTabComponent,
  ],
})
export default class QuickCmdsModule {}
