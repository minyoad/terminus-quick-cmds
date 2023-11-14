import { Injectable } from "@angular/core";
import { QuickCmdsSettingsTabComponent } from "./components/quickCmdsSettingsTab.component";
import { SettingsTabProvider } from "terminus-settings";

@Injectable()
export class QuickCmdsSettingsTabProvider extends SettingsTabProvider {
  id = "qc";
  title = "Quick Commands";

  getComponentType(): any {
    return QuickCmdsSettingsTabComponent;
  }
}
