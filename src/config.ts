import { ConfigProvider } from 'tabby-core'

export class QuickCmdsConfigProvider extends ConfigProvider {
    defaults = {
        qc: {
            cmds: []
        },
        reload: true,
        hotkeys: {
            'qc': ['Alt-Q', '⌥-Q'],
        },
    }

    platformDefaults = { }
}
