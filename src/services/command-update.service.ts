import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'

@Injectable()
export class CommandUpdateService {
    // 使用 BehaviorSubject 存储命令列表
    private commandsSource = new BehaviorSubject<any[]>([])
    
    // 公开一个可观察对象
    commands$ = this.commandsSource.asObservable()
    
    // 更新命令列表
    updateCommands(commands: any[]): void {
        this.commandsSource.next(commands)
    }
    
    // 获取当前命令列表
    getCurrentCommands(): any[] {
        return this.commandsSource.getValue()
    }
}
