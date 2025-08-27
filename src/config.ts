import { ConfigProvider } from 'terminus-core'

export class QuickCmdsConfigProvider extends ConfigProvider {
    defaults = {
        qc: {
            cmds: [],
            webdav: {
                url: '',
                username: '',
                password: ''
            }
        },
        hotkeys: {
            'qc': [
                'Alt-Q',
            ],
        },
    }

    platformDefaults = { }
}
