import { Injectable } from '@angular/core'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { HotkeysService, ToolbarButtonProvider, IToolbarButton, ConfigService, AppService, BaseTabComponent, SplitTabComponent } from 'tabby-core'
import { QuickCmdsModalComponent } from './components/quickCmdsModal.component'
import { BaseTerminalTabComponent } from 'tabby-terminal';
import { QuickCmds } from './api'
import { altKeyName, metaKeyName, getKeyName, KeyEventData } from "./service"
// import { altKeyName, metaKeyName, getKeyName, KeyEventData } from "tabby-core"

@Injectable()
export class ButtonProvider extends ToolbarButtonProvider {
    private usageCount: Record<string, number> = {}

    constructor (
        private ngbModal: NgbModal,
        private hotkeys: HotkeysService,
        private config: ConfigService,
        private app: AppService,
    ) {
        super()

        // Listen for hotkey matches
        this.hotkeys.hotkey$.subscribe(async (hotkey) => {
            if (hotkey === 'qc') {
                this.activate()
            }
        })

        // Also listen for document keydown events to capture all shortcuts
        // Use capture phase to ensure we get the event before other handlers
        document.addEventListener('keydown', this.handleDocumentKeyDown.bind(this), true)
    }

    private handleDocumentKeyDown(event: KeyboardEvent) {
        // Skip if the key is being repeated (holding down a key)
        if (event.repeat) {
            return
        }

        const eventData: KeyEventData = {
            ctrlKey: event.ctrlKey,
            metaKey: event.metaKey,
            altKey: event.altKey,
            shiftKey: event.shiftKey,
            code: event.code,
            key: event.key,
            eventName: "keydown",
            time: event.timeStamp,
            registrationTime: performance.now(),
        }
        const keyName = getKeyName(eventData)
        // Skip if the user is typing in an input field
        // const target = event.target as HTMLElement
        // if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        //     return
        // }

        // Build the shortcut string from the event
        const modifiers: string[] = []

        if (eventData.ctrlKey) {
            modifiers.push('Ctrl')
        }
        if (eventData.metaKey) {
            modifiers.push(metaKeyName)
        }
        if (eventData.altKey) {
            modifiers.push(altKeyName)
        }
        if (eventData.shiftKey) {
            modifiers.push('Shift')
        }

        // Sort modifiers to ensure consistent ordering
        modifiers.sort()

        // Add modifiers to shortcut string
        let shortcut = ''
        if (modifiers.length > 0) {
            shortcut = modifiers.join('+') + '+'
        }

        // console.log("222 eventData.ctrlKey", eventData.ctrlKey)
        // console.log("222 eventData.metaKey", eventData.metaKey)
        // console.log("222 eventData.shiftKey", eventData.shiftKey)
        // console.log("222 eventData.altKey", eventData.altKey)
        // console.log("222 eventData.key", eventData.key)
        // console.log("222 keyName", keyName)
        // console.log("222 altKeyName", altKeyName)
        // Only process if we have a valid main key (not just modifiers)
        if (!['Control', altKeyName, 'Shift', metaKeyName].includes(keyName)) {
            shortcut += keyName
            // Check if this shortcut matches any command
            this.executeCommandByShortcut(event, shortcut)
        }
    }

    async executeCommandByShortcut(event, hotkey: string) {
        const commands = this.config.store.qc.cmds
        const matchedCommand = commands.find(cmd => cmd.shortcut === hotkey)

        if (matchedCommand) {
            // Use count +1 and persist
            this.usageCount[matchedCommand.text] = (this.usageCount[matchedCommand.text] || 0) + 1
            localStorage.setItem('qcUsageCount', JSON.stringify(this.usageCount))

            if (await this._send(this.app.activeTab, matchedCommand)) {
                // console.log("event:", event)
                event.preventDefault()
                event.stopPropagation()
            }
        }
    }

    async _send (tab: BaseTabComponent, quick_cmd: QuickCmds) {
        if (tab instanceof SplitTabComponent) {
            return this._send((tab as SplitTabComponent).getFocusedTab(), quick_cmd)
        }
        if (tab instanceof BaseTerminalTabComponent) {
            let currentTab = tab as BaseTerminalTabComponent<any>

            let terminator = "\n"
            let lineContinuation = "\\"
            let cmdDelimiter = "&&"

            // Set different command delimiters and line continuations based on terminal type
            if (currentTab.title.includes('cmd.exe')) {
                terminator = "\r\n"
                lineContinuation = "^"
                cmdDelimiter="&"
            } else if (currentTab.title.includes('powershell')) {
                terminator = "\r\n"
                lineContinuation = "`"
                cmdDelimiter=";"
            }

            let cmd_text=quick_cmd.text
            let cmds=cmd_text.split(/(?:\r\n|\r|\n)/)
            let new_cmds=[]

            for(let cmd of cmds) {
                if(cmd===''){
                    continue
                }

                if(cmd.startsWith('\\s')){
                    // Handle commands starting with \s
                    if(!quick_cmd.appendCR){
                        continue
                    }
                    cmd=cmd.replace('\\s','')
                    let sleepTime=parseInt(cmd)
                    await this.sleep(sleepTime)
                    continue
                }

                if(cmd.startsWith('\\x')){
                    cmd = cmd.replace(/\\x([0-9a-f]{2})/ig, function(_, pair) {
                            return String.fromCharCode(parseInt(pair, 16))
                        })
                }

                if(!quick_cmd.appendCR){
                    new_cmds.push(cmd)
                    continue
                }

                await currentTab.sendInput(cmd)
                await this.sleep(50) // Add a small delay to ensure command is sent
                await currentTab.sendInput(terminator)
            }

            if (new_cmds.length > 0) {
                let new_cmd_text
                if (currentTab.title.includes('powershell')) {
                    // Special handling for PowerShell: use semicolon to join commands, no line continuation at the end
                    new_cmd_text = new_cmds.join(" ; ")
                } else {
                    new_cmd_text = new_cmds.join(" "+cmdDelimiter + lineContinuation + terminator)
                }
                await currentTab.sendInput(new_cmd_text)
            }
            return true
        }
        return false
    }

    sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    activate () {
        this.ngbModal.open(QuickCmdsModalComponent)
    }

    provide (): IToolbarButton[] {
        return [{
            icon: require('./icons/keyboard.svg'),
            weight: 5,
            title: 'Quick commands',
            touchBarNSImage: 'NSTouchBarComposeTemplate',
            click: async () => {
                this.activate()
            }
        }]
    }
}
