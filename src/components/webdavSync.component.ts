import { Component } from '@angular/core'
import { ConfigService, NotificationsService } from 'terminus-core'
import { WebDAVService } from '../services/webdav.service'
import { WebDAVService } from '../services/webdav.service'

interface WebDAVConfig {
    url: string
    username: string
    password: string
}

@Component({
    selector: 'app-webdav-sync',
    template: require('./webdavSync.component.pug'),
})
export class WebDAVSyncComponent {
    webdavConfig: WebDAVConfig
    isSyncing = false

    constructor(
        private config: ConfigService,
        private webdavService: WebDAVService,
        private notifications: NotificationsService,
    ) {
        // 初始化WebDAV配置
        this.webdavConfig = this.config.store.qc.webdav || {
            url: '',
            username: '',
            password: ''
        }
    }

    /**
     * 保存WebDAV配置
     */
    saveConfig(): void {
        this.config.store.qc.webdav = this.webdavConfig
        this.config.save()
        this.notifications.info('WebDAV配置已保存')
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
                this.notifications.success('配置已成功上传到WebDAV')
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
            const success = await this.webdavService.downloadConfig(
                this.webdavConfig.url,
                this.webdavConfig.username,
                this.webdavConfig.password
            )
            
            if (success) {
                this.notifications.success('配置已成功从WebDAV下载')
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