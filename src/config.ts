import { ConfigProvider } from "terminus-core";

export class QuickCmdsConfigProvider extends ConfigProvider {
  defaults = {
    qc: {
      cmds: [],
    },
    hotkeys: {
      qc: ["Alt-Q"],
    },
  };

  platformDefaults = {};
}
