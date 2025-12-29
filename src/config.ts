import { ConfigProvider } from 'tabby-core'
import {QuickCmds} from "./api";

export class QuickCmdsConfigProvider extends ConfigProvider {
    defaults = {
        qc: {
            cmds: [] as QuickCmds[],
        },
        reload: true,
        hotkeys: {},
    }

    platformDefaults = { }
}
