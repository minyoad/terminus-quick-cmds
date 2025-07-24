import { Component } from '@angular/core'
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { ConfigService, AppService, BaseTabComponent, SplitTabComponent } from 'terminus-core'
import { QuickCmds, ICmdGroup } from '../api'
import { EditCommandModalComponent } from './editCommandModal.component'
import { BaseTerminalTabComponent as TerminalTabComponent } from 'terminus-terminal';


interface FlattenedItem {
    type: 'group' | 'cmd';
    group?: ICmdGroup;
    cmd?: QuickCmds;
}

@Component({
    template: require('./quickCmdsModal.component.pug'),
    styles: [require('./quickCmdsModal.component.scss')],
    host: {
        '(keydown)': 'handleKeyDown($event)'
    }
})
export class QuickCmdsModalComponent {
    cmds: QuickCmds[]
    quickCmd: string
    appendCR: boolean
    childGroups: ICmdGroup[]
    groupCollapsed: {[id: string]: boolean} = {}
    expandedGroups: { [id: string]: boolean } = {}
    private flattenedItems: FlattenedItem[] = []
    private selectedGroupIndex: number = 0
    private selectedCmdIndex: number = -1

    constructor (
        public modalInstance: NgbActiveModal,
        private ngbModal: NgbModal,
        private config: ConfigService,
        private app: AppService,
    ) { }

    ngOnInit () {
        this.cmds = this.config.store.qc.cmds
        this.appendCR = true
        this.refresh()
        this.childGroups.forEach(group => {
            this.expandedGroups[group.name] = false
        })
        // 初始化时不设置搜索框焦点
    }

    quickSend () {
        let command: QuickCmds = {
            name: '',
            text: this.quickCmd,
            appendCR: true,
        }
        this._send(this.app.activeTab, command)
        this.close()
    }

    quickSendAll() {
        let command: QuickCmds = {
            name: '',
            text: this.quickCmd,
            appendCR: true,
        }
        this._sendAll(command)
        this.close()
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async _send (tab: BaseTabComponent, quick_cmd: QuickCmds) {    
        
        if (tab instanceof SplitTabComponent) {
            this._send((tab as SplitTabComponent).getFocusedTab(), quick_cmd)
        }
        if (tab instanceof TerminalTabComponent) {
            let currentTab = tab as TerminalTabComponent

            console.log("Current title:", currentTab.title);

            let terminator = "\n";
            let lineContinuation = "\\";
            let cmdDelimiter = "&&";
            
            // 根据终端类型设置不同的命令分隔符和续行符
            if (currentTab.title.includes('cmd.exe')) {
                terminator = "\r\n";
                lineContinuation = "^";
                cmdDelimiter="&"
            } else if (currentTab.title.includes('powershell')) {
                terminator = "\r\n";
                lineContinuation = "`";
                cmdDelimiter=";"
            }
            
            let cmd_text=quick_cmd.text

            let cmds=cmd_text.split(/(?:\r\n|\r|\n)/)

            let new_cmds=[];

            for(let cmd of cmds) {
                console.log("Sending " + cmd);

                if(cmd===''){
                    continue;
                }

                if(cmd.startsWith('\\s')){
                    // 处理以 \s 开头的命令
                    console.log('Processing sleep command');
                    if(!quick_cmd.appendCR){
                        continue;
                    }
                    cmd=cmd.replace('\\s','');
                    let sleepTime=parseInt(cmd);
                    await this.sleep(sleepTime);
                    console.log('sleep time: ' + sleepTime);
                    continue;
                }

                if(cmd.startsWith('\\x')){
                    cmd = cmd.replace(/\\x([0-9a-f]{2})/ig, function(_, pair) {
                            return String.fromCharCode(parseInt(pair, 16));
                        });
                }
            
                if(!quick_cmd.appendCR){
                    new_cmds.push(cmd);
                    continue;
                }

                await currentTab.sendInput(cmd);
                await this.sleep(50); // 添加小延迟确保命令发送完成
                await currentTab.sendInput(terminator);                
            }

            if (new_cmds.length > 0) {
                let new_cmd_text;
                if (currentTab.title.includes('powershell')) {
                    // PowerShell特殊处理：使用分号连接命令，最后一个命令后不加续行符
                    new_cmd_text = new_cmds.join(" ; ");
                } else {
                    new_cmd_text = new_cmds.join(" "+cmdDelimiter + lineContinuation + terminator);
                }
                console.log("New command text:", new_cmd_text);
                await currentTab.sendInput(new_cmd_text);
                // await currentTab.sendInput(terminator);
            }
        }
    }

    _sendAll (cmd: QuickCmds) {
        for (let tab of this.app.tabs) {
            if (tab instanceof SplitTabComponent) {
                for (let subtab of (tab as SplitTabComponent).getAllTabs()) {
                    this._send(subtab, cmd)
                }
            } else {
                this._send(tab, cmd)
            }
        }
    }

    close () {
        this.modalInstance.close()
        this.app.activeTab.emitFocused()
    }

    send (cmd: QuickCmds, event: MouseEvent) {
        if (event.ctrlKey) {
            this._sendAll(cmd)
        }
        else {
            this._send(this.app.activeTab, cmd)
        }
        this.close()
    }

    edit (command?: QuickCmds) {
        const modal = this.ngbModal.open(EditCommandModalComponent)
        modal.componentInstance.allGroups = Array.from(new Set(this.cmds.map(x => x.group || ''))).filter(x => x)
        if (command) {
            modal.componentInstance.command = Object.assign({}, command)
        } else {
            modal.componentInstance.command = {
                name: '',
                text: '',
                appendCR: true,
            }
        }
        modal.result.then(result => {
            if (command) {
                Object.assign(command, result)
            } else {
                this.cmds.push(result)
            }
            this.config.save()
            this.refresh()
        }, () => null)
    }

    clickGroup (group: ICmdGroup, event: MouseEvent) {
        if (event.shiftKey) {
            if (event.ctrlKey) {
                for (let cmd of group.cmds) {
                    this._sendAll(cmd)
                }
            }
            else {
                for (let cmd of group.cmds) {
                    this._send(this.app.activeTab, cmd)
                }
            }
        }
        else {
            this.groupCollapsed[group.name] = !this.groupCollapsed[group.name]
        }
    }

    refresh () {
        this.childGroups = []
        this.flattenedItems = []

        let cmds = this.cmds
        if (this.quickCmd) {
            cmds = cmds.filter(cmd => (cmd.name + cmd.group + cmd.text).toLowerCase().includes(this.quickCmd))
        }

        for (let cmd of cmds) {
            cmd.group = cmd.group || null
            let group = this.childGroups.find(x => x.name === cmd.group)
            if (!group) {
                group = {
                    name: cmd.group,
                    cmds: [],
                }
                this.childGroups.push(group)
            }
            group.cmds.push(cmd)
        }

        this.updateFlattenedItems()
        this.selectedGroupIndex = 0
        this.selectedCmdIndex = -1

        if(this.quickCmd &&cmds.length>0){
            this.selectedCmdIndex = 0
        }
    }

    private updateFlattenedItems() {
        this.flattenedItems = []
        for (let group of this.childGroups) {
            this.flattenedItems.push({type: 'group', group})
            if (!this.groupCollapsed[group.name]) {
                for (let cmd of group.cmds) {
                    this.flattenedItems.push({type: 'cmd', cmd})
                }
            }
        }
    }

    copyCommand(cmd: QuickCmds, event: MouseEvent) {
        event.preventDefault();
        navigator.clipboard.writeText(cmd.text).then(() => {
            console.log('Command text copied to clipboard');
            this.showCopySuccessMessage();
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    }

    private showCopySuccessMessage() {
        const message = document.createElement('div');
        message.textContent = 'Copied successfully';
        message.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background-color: rgba(0, 0, 0, 0.8); color: white; padding: 8px 16px; border-radius: 4px; z-index: 9999;';
        document.body.appendChild(message);
        setTimeout(() => {
            message.style.opacity = '0';
            message.style.transition = 'opacity 0.3s';
            setTimeout(() => document.body.removeChild(message), 300);
        }, 1500);
    }

    handleKeyDown(event: KeyboardEvent) {
        console.log('KeyDown event:', {
            key: event.key,
            type: event.type,
            target: event.target,
            activeElement: document.activeElement
        });

        if (event.ctrlKey && event.key === 'c') {
            event.preventDefault();
            const selectedItem = this.getSelectedItem();
            if (selectedItem && selectedItem.type === 'cmd') {
                navigator.clipboard.writeText(selectedItem.cmd.text).then(() => {
                    console.log('Command text copied to clipboard');
                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                });
            }
            return;
        }

        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            event.preventDefault()
            const direction = event.key === 'ArrowUp' ? -1 : 1
            const currentIndex = this.getSelectedIndex()
            
            const findNextVisibleItem = (startIndex: number, direction: number): number => {
                let index = startIndex + direction
                while (index >= 0 && index < this.flattenedItems.length) {
                    const item = this.flattenedItems[index]
                    if (item.type === 'group') {
                        return index
                    }
                    if (item.type === 'cmd') {
                        const group = this.childGroups.find(g => g.cmds.includes(item.cmd))
                        if (!this.groupCollapsed[group.name]) {
                            return index
                        }
                    }
                    index += direction
                }
                return -1
            }

            const newIndex = findNextVisibleItem(currentIndex, direction)
            if (newIndex >= 0) {
                const item = this.flattenedItems[newIndex]
                if (item.type === 'group') {
                    this.selectedGroupIndex = this.childGroups.indexOf(item.group)
                    this.selectedCmdIndex = -1
                } else {
                    const group = this.childGroups.find(g => g.cmds.includes(item.cmd))
                    this.selectedGroupIndex = this.childGroups.indexOf(group)
                    this.selectedCmdIndex = group.cmds.indexOf(item.cmd)
                }

                requestAnimationFrame(() => {
                    const element = document.querySelector('.list-group-item.active')
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                    }
                })
            }
        } else if (event.key === 'Escape') {
            const searchInput = document.querySelector('.quickCmd') as HTMLElement
            if (searchInput) {
                console.log('Focusing search input on Escape');
                searchInput.focus()
                this.selectedGroupIndex = 0
                this.selectedCmdIndex = -1
                // 清空搜索框
                this.quickCmd = ''
                this.refresh()
            }
        } else if (event.key === ' ') {
            const searchInput = document.querySelector('.quickCmd') as HTMLElement
            const isSearchFocused = document.activeElement === searchInput
            
            // 如果搜索框没有输入内容，空格键应该用于展开/折叠分组
            if (!this.quickCmd || !isSearchFocused) {
                event.preventDefault()
                const selectedItem = this.getSelectedItem()
                if (selectedItem && selectedItem.type === 'group') {
                    this.groupCollapsed[selectedItem.group.name] = !this.groupCollapsed[selectedItem.group.name]
                    this.updateFlattenedItems()
                    this.selectedCmdIndex = -1
                }
            }
        } else if (event.key === 'Enter') {
            event.preventDefault()
            const selectedItem = this.getSelectedItem()
            if (selectedItem && selectedItem.type === 'cmd') {
                this.send(selectedItem.cmd, new MouseEvent('click'))
            }
        }
    }

    private getSelectedIndex(): number {
        for (let i = 0; i < this.flattenedItems.length; i++) {
            const item = this.flattenedItems[i]
            if (item.type === 'group') {
                if (this.childGroups.indexOf(item.group) === this.selectedGroupIndex && this.selectedCmdIndex === -1) {
                    return i
                }
            } else {
                const group = this.childGroups.find(g => g.cmds.includes(item.cmd))
                if (group && this.childGroups.indexOf(group) === this.selectedGroupIndex && 
                    group.cmds.indexOf(item.cmd) === this.selectedCmdIndex) {
                    return i
                }
            }
        }
        return -1
    }

    private getSelectedItem() {
        return this.flattenedItems[this.getSelectedIndex()]
    }
}
