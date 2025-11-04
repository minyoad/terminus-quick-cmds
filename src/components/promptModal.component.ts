import { Component, Input, ViewChild, ElementRef } from '@angular/core'
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap'

@Component({
    template: require('./promptModal.component.pug'),
})
export class PromptModalComponent {
    @Input() value: string
    @Input() password: boolean
    @ViewChild('input') input: ElementRef

    // 新增：记录命令使用频率
    private frequencyMap: Record<string, number> = {}

    constructor (
        private modalInstance: NgbActiveModal,
    ) { }

    ngOnInit () {
        // 从 localStorage 读取历史频率
        try {
            const raw = localStorage.getItem('quickCmdFrequency')
            if (raw) this.frequencyMap = JSON.parse(raw)
        } catch {}
        this.input.nativeElement.focus()
    }

    ok () {
        // 确认时把当前命令计数 +1 并持久化
        if (this.value) {
            this.frequencyMap[this.value] = (this.frequencyMap[this.value] || 0) + 1
            localStorage.setItem('quickCmdFrequency', JSON.stringify(this.frequencyMap))
        }
        this.modalInstance.close(this.value)
    }

    cancel () {
        this.modalInstance.close('')
    }

    // 新增：供外部获取按频率排序后的命令列表
    getSortedHistory (): string[] {
        return Object.entries(this.frequencyMap)
            .sort((a, b) => b[1] - a[1]) // 频率高的在前
            .map(([cmd]) => cmd)
    }
}
