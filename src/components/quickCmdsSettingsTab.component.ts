import { Component, OnInit, OnDestroy } from '@angular/core'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { ConfigService } from 'terminus-core'
import { QuickCmds, ICmdGroup } from '../api'
import { EditCommandModalComponent } from './editCommandModal.component'
import { PromptModalComponent } from './promptModal.component'
import { CommandUpdateService } from '../services/command-update.service'
import { Subscription } from 'rxjs'

@Component({
    template: require('./quickCmdsSettingsTab.component.pug'),
})
export class QuickCmdsSettingsTabComponent implements OnInit, OnDestroy {
    private subscription: Subscription
    quickCmd: string
    commands: QuickCmds[]
    childGroups: ICmdGroup[]
    groupCollapsed: {[id: string]: boolean} = {}

    constructor (
        public config: ConfigService,
        private ngbModal: NgbModal,
        private commandUpdateService: CommandUpdateService,
    ) {
        this.commands = this.config.store.qc.cmds
        this.refresh()
    }

    ngOnInit() {
        // 订阅命令更新
        this.subscription = this.commandUpdateService.commands$.subscribe(commands => {
            console.log('收到命令更新，刷新命令列表')
            
            if (commands && commands.length > 0) {
                console.log(`使用新的 ${commands.length} 条命令`)
                // 使用新的命令列表，而不是从 config.store 获取
                this.commands = commands
                
                // 更新配置但不保存（避免应用重启）
                if (this.config.store.qc) {
                    this.config.store.qc.cmds = commands
                }
            } else {
                // 如果没有新的命令，则从 config.store 获取
                this.commands = this.config.store.qc.cmds
            }
            
            // 刷新UI
            this.refresh()
        })
    }

    ngOnDestroy() {
        // 取消订阅，防止内存泄漏
        if (this.subscription) {
            this.subscription.unsubscribe()
        }
    }

    createCommand () {
        let command: QuickCmds = {
            name: '',
            text: '',
            appendCR: true,
        }

        // 增加延迟时间，确保模态框正确打开并设置焦点
        setTimeout(() => {
            let modal = this.ngbModal.open(EditCommandModalComponent)
            modal.componentInstance.command = command
            
            // 确保模态框完全打开后再设置结果处理
            setTimeout(() => {
                modal.result.then(result => {
                    this.commands.push(result)
                    this.config.store.qc.cmds = this.commands
                    this.config.save()
                    this.refresh()
                }).catch(() => {
                    // 处理模态框被取消的情况
                })
            }, 100)
        }, 300)
    }

    editCommand (command: QuickCmds) {
        // 增加延迟，确保模态框正确打开
        setTimeout(() => {
            let modal = this.ngbModal.open(EditCommandModalComponent)
            modal.componentInstance.command = Object.assign({}, command)
            
            // 确保模态框完全打开后再设置结果处理
            setTimeout(() => {
                modal.result.then(result => {
                    Object.assign(command, result)
                    this.config.save()
                    this.refresh()
                }).catch(() => {
                    // 处理模态框被取消的情况
                })
            }, 100)
        }, 300)
    }

    deleteCommand (command: QuickCmds) {
        if (confirm(`确定要删除"${command.name}"吗？`)) {
            this.commands = this.commands.filter(x => x !== command)
            this.config.store.qc.cmds = this.commands
            this.config.save()
            this.refresh()
        }
    }

    editGroup (group: ICmdGroup) {
        let modal = this.ngbModal.open(PromptModalComponent)
        modal.componentInstance.prompt = '请输入新的分组名称'
        modal.componentInstance.value = group.name
        modal.result.then(result => {
            if (result) {
                for (let connection of this.commands.filter(x => x.group === group.name)) {
                    connection.group = result
                }
                this.config.save()
                this.refresh()
            }
        })
    }

    deleteGroup (group: ICmdGroup) {
        if (confirm(`确定要删除分组"${group.name || '未分组'}"吗？`)) {
            for (let command of this.commands.filter(x => x.group === group.name)) {
                command.group = null
            }
            this.config.save()
            this.refresh()
        }
    }

    cancelFilter(){
        this.quickCmd=''
        this.refresh()
    }

    refresh () {
        this.childGroups = []

        let cmds = this.commands
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
    }
   
}
