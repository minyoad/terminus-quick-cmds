import { Injectable } from '@angular/core'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { HotkeysService, ToolbarButtonProvider, IToolbarButton, ConfigService, AppService, BaseTabComponent, SplitTabComponent } from 'tabby-core'
import { BaseTerminalTabComponent } from 'tabby-terminal';
import { QuickCmds } from './api'

@Injectable()
export class ButtonProvider extends ToolbarButtonProvider {

    constructor (
        private ngbModal: NgbModal,
        private hotkeys: HotkeysService,
        private config: ConfigService,
        private app: AppService,
    ) {
        super()

        this.config.ready$.toPromise().then(() => {
            this.reload_hotkey()
        })
        // Listen for hotkey matches
        this.hotkeys.hotkey$.subscribe(async (hotkey_id) => {
            await this.executeCommandByShortcut(hotkey_id)
        })
    }

    async executeCommandByShortcut(hotkey_id: string) {
        if (this.config.store.reload) {
            this.reload_hotkey()
        }

        const commands = this.config.store.qc.cmds
        const matchedCommand = commands.find(cmd => cmd.id === hotkey_id)
        // console.log("[quick-cmd] hotkey_id:", hotkey_id)
        // console.log("[quick-cmd] commands:", commands)
        // console.log("[quick-cmd] match:", matchedCommand)

        if (matchedCommand) {
            await this._send(this.app.activeTab, matchedCommand)
        }
    }

    async _send (tab: BaseTabComponent, quick_cmd: QuickCmds) {
        if (tab instanceof SplitTabComponent) {
            return this._send((tab as SplitTabComponent).getFocusedTab(), quick_cmd)
        }
        if (tab instanceof BaseTerminalTabComponent) {
            let cmd = quick_cmd.text

            if (cmd.startsWith('\\x')) {
                cmd = cmd.replace(/\\x([0-9a-f]{2})/ig, function(_, pair) { return String.fromCharCode(parseInt(pair, 16)) })
            }

            let currentTab = tab as BaseTerminalTabComponent<any>
            await currentTab.sendInput(cmd)
            return true
        }
        return false
    }

    reload_hotkey () {
        console.log("111 reload hotkeys")
        let hotkeyNamePrefix = "Quick Cmd: "
        // Cleanup Quick Cmd hotkeys
        for (const key of Object.keys(this.config.store.hotkeys)) {
            if (key.startsWith(hotkeyNamePrefix)) {
                delete this.config.store.hotkeys[key]
            }
        }
        // Add new Quick Cmd hotkeys
        let hotkey_id: string
        for (let cmd of this.config.store.qc.cmds) {
            hotkey_id = hotkeyNamePrefix + cmd.name
            this.config.store.hotkeys[hotkey_id] = [cmd.shortcut.replace(/\+/g, '-')]
            cmd.id = hotkey_id
        }
        this.config.store.reload = false
    }

    provide (): IToolbarButton[] {
        return [{
            icon: require('./icons/keyboard.svg'),
            weight: 5,
            title: 'Quick commands',
            touchBarNSImage: 'NSTouchBarComposeTemplate',
        }]
    }
}
