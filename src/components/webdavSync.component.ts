import { Component } from '@angular/core'
import { ConfigService, NotificationsService } from 'terminus-core'
import { WebDAVService } from '../services/webdav.service'
import { CommandUpdateService } from '../services/command-update.service'

interface WebDAVConfig {
    url: string
    username: string
    password: string
    lastUploadTime?: string
    lastDownloadTime?: string
}

@Component({
    selector: 'app-webdav-sync',
    template: require('./webdavSync.component.pug'),
})
export class WebDAVSyncComponent {
    webdavConfig: WebDAVConfig
    isSyncing = false
    isTesting = false

    constructor(
        private config: ConfigService,
        private webdavService: WebDAVService,
        private notifications: NotificationsService,
        private commandUpdateService: CommandUpdateService,
    ) {
        // 初始化配置
        const qc = this.config.store.qc || {}
        const webdav = qc.webdav || {}
        
        this.webdavConfig = {
            url: webdav.url || '',
            username: webdav.username || '',
            password: webdav.password || '',
            lastUploadTime: webdav.lastUploadTime,
            lastDownloadTime: webdav.lastDownloadTime
        }
    }

    /**
     * 保存WebDAV配置
     */
    /**
     * 格式化日期时间
     */
    private formatDateTime(date: Date): string {
        const pad = (num: number) => num.toString().padStart(2, '0');
        
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        const seconds = pad(date.getSeconds());
        
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    /**
     * 保存WebDAV配置
     */
    saveConfig(): void {
        try {
            // 获取当前配置
            const qc = this.config.store.qc || {}
            
            // 创建新的配置对象
            const newQc = {
                ...qc,
                webdav: {
                    url: this.webdavConfig.url,
                    username: this.webdavConfig.username,
                    password: this.webdavConfig.password,
                    lastUploadTime: this.webdavConfig.lastUploadTime,
                    lastDownloadTime: this.webdavConfig.lastDownloadTime
                }
            }
            
            // 使用 ConfigService 的方法更新配置
            this.updateConfig(newQc)
            this.notifications.info('保存成功')
        } catch (error) {
            console.error('保存配置错误:', error)
            this.notifications.error(`保存配置错误: ${error.message}`)
        }
    }
    
    /**
     * 更新配置的辅助方法
     * @param newQc 新的配置对象
     * @param saveConfig 是否保存配置（默认为 true）
     */
    private updateConfig(newQc: any, saveConfig: boolean = true): void {
        // 使用正确的方式更新配置
        // 不直接设置 config.store.qc，而是更新其内部属性
        if (this.config.store.qc) {
            // 更新 webdav 配置
            if (!this.config.store.qc.webdav) {
                this.config.store.qc.webdav = {}
            }
            
            // 更新 webdav 属性
            if (newQc.webdav) {
                this.config.store.qc.webdav.url = newQc.webdav.url
                this.config.store.qc.webdav.username = newQc.webdav.username
                this.config.store.qc.webdav.password = newQc.webdav.password
                this.config.store.qc.webdav.lastUploadTime = newQc.webdav.lastUploadTime
                this.config.store.qc.webdav.lastDownloadTime = newQc.webdav.lastDownloadTime
            }
            
            // 如果有 cmds 属性，也更新它
            if (newQc.cmds) {
                this.config.store.qc.cmds = newQc.cmds
            }
        }
        
        // 使用 ConfigService 的 save 方法保存（如果需要）
        if (saveConfig) {
            this.config.save()
        }
    }

    /**
     * 测试WebDAV连接
     */
    async testConnection(): Promise<void> {
        this.isTesting = true
        try {
            const success = await this.webdavService.testConnection(
                this.webdavConfig.url,
                this.webdavConfig.username,
                this.webdavConfig.password
            )
            
            if (success) {
                this.notifications.info('WebDAV连接测试成功')
            } else {
                this.notifications.error('WebDAV连接测试失败')
            }
        } catch (error) {
            this.notifications.error(`WebDAV连接测试错误: ${error.message}`)
        } finally {
            this.isTesting = false
        }
    }

    /**
     * 上传配置到WebDAV
     */
    async uploadConfig(): Promise<void> {
        this.isSyncing = true
        try {
            const success = await this.webdavService.uploadConfig(
                this.webdavConfig.url,
                this.webdavConfig.username,
                this.webdavConfig.password
            )
            
            if (success) {
                try {
                    // 更新上传时间
                    this.webdavConfig.lastUploadTime = this.formatDateTime(new Date())
                    
                    // 获取当前配置
                    const qc = this.config.store.qc || {}
                    
                    // 创建新的配置对象
                    const newQc = {
                        ...qc,
                        webdav: {
                            url: this.webdavConfig.url,
                            username: this.webdavConfig.username,
                            password: this.webdavConfig.password,
                            lastUploadTime: this.webdavConfig.lastUploadTime,
                            lastDownloadTime: this.webdavConfig.lastDownloadTime
                        }
                    }
                    
                    // 使用辅助方法更新配置，但不保存配置（避免应用重启）
                    this.updateConfig(newQc, false)
                    this.notifications.info('配置已成功上传到WebDAV')
                } catch (error) {
                    console.error('保存上传时间错误:', error)
                    this.notifications.error(`保存上传时间错误: ${error.message}`)
                }
            } else {
                this.notifications.error('上传配置到WebDAV失败')
            }
        } catch (error) {
            this.notifications.error(`上传配置错误: ${error.message}`)
        } finally {
            this.isSyncing = false
        }
    }

    /**
     * 从WebDAV下载配置
     */
    async downloadConfig(): Promise<void> {
        this.isSyncing = true
        try {
            const result = await this.webdavService.downloadConfig(
                this.webdavConfig.url,
                this.webdavConfig.username,
                this.webdavConfig.password
            )
            
            if (result.success) {
                try {
                    // 更新下载时间
                    this.webdavConfig.lastDownloadTime = this.formatDateTime(new Date())
                    
                    // 获取当前配置
                    const qc = this.config.store.qc || {}
                    
                    // 创建新的配置对象
                    const newQc = {
                        ...qc,
                        webdav: {
                            url: this.webdavConfig.url,
                            username: this.webdavConfig.username,
                            password: this.webdavConfig.password,
                            lastUploadTime: this.webdavConfig.lastUploadTime,
                            lastDownloadTime: this.webdavConfig.lastDownloadTime
                        }
                    }
                    
                    // 使用辅助方法更新配置
                    this.updateConfig(newQc)
                    
                    // 强制刷新命令列表
                    if (result.cmds) {
                        // 不直接修改 config.store，避免触发应用重启
                        // 通知用户
                        this.notifications.info(`配置已成功从WebDAV下载，共 ${result.cmds.length} 条命令`)
                        
                        // 使用新的 API 更新命令列表
                        console.log('使用新的 API 更新命令列表')
                        this.commandUpdateService.updateCommands(result.cmds)
                    } else {
                        this.notifications.info('配置已成功从WebDAV下载')
                    }
                } catch (error) {
                    console.error('保存下载时间错误:', error)
                    this.notifications.error(`保存下载时间错误: ${error.message}`)
                }
            } else {
                this.notifications.error('从WebDAV下载配置失败')
            }
        } catch (error) {
            this.notifications.error(`下载配置错误: ${error.message}`)
        } finally {
            this.isSyncing = false
        }
    }
}