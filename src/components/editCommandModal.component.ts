import { Component, OnInit, ViewChild, ElementRef } from '@angular/core'
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap'
import { QuickCmds } from '../api'

@Component({
    template: require('./editCommandModal.component.pug'),
})
export class EditCommandModalComponent implements OnInit {
    command: QuickCmds
    @ViewChild('nameInput') nameInput: ElementRef

    constructor (
        private modalInstance: NgbActiveModal,
    ) {
    }

    ngOnInit() {
        // 确保命令对象已初始化
        if (!this.command) {
            this.command = {
                name: '',
                text: '',
                appendCR: true,
            }
        }
        
        // 延迟设置焦点，确保模态框完全打开
        // 增加延迟时间，确保模态框完全渲染
        setTimeout(() => {
            const inputs = document.querySelectorAll('.modal-body input')
            if (inputs && inputs.length > 0) {
                const firstInput = inputs[0] as HTMLInputElement
                firstInput.focus()
                // 尝试多次设置焦点，解决某些情况下焦点无法设置的问题
                setTimeout(() => {
                    firstInput.focus()
                }, 200)
            }
        }, 300)
    }

    save () {
        this.modalInstance.close(this.command)
    }

    cancel () {
        this.modalInstance.dismiss()
    }
}
