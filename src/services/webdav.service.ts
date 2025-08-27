import { Injectable } from '@angular/core'
import { ConfigService } from 'terminus-core'
import { QuickCmds } from '../api'

@Injectable()
export class WebDAVService {
    constructor(
        private config: ConfigService,
    ) { }

    /**
     * 上传配置到WebDAV服务器
     * @param url WebDAV服务器URL
     * @param username WebDAV用户名
     * @param password WebDAV密码
     * @returns Promise<boolean> 上传是否成功
     */
    async uploadConfig(url: string, username: string, password: string): Promise<boolean> {
        try {
            // 准备配置数据
            const configData = {
                cmds: this.config.store.qc.cmds
            }
            
            // 转换为JSON字符串
            const configJson = JSON.stringify(configData, null, 2)
            
            // 创建基本认证头
            const authHeader = 'Basic ' + btoa(`${username}:${password}`)
            
            // 发送PUT请求到WebDAV服务器
            const response = await fetch(`${url}/tabby-quick-cmds-config.json`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authHeader
                },
                body: configJson
            })
            
            return response.ok
        } catch (error) {
            console.error('上传配置到WebDAV失败:', error)
            return false
        }
    }

    /**
     * 从WebDAV服务器下载配置
     * @param url WebDAV服务器URL
     * @param username WebDAV用户名
     * @param password WebDAV密码
     * @returns Promise<boolean> 下载是否成功
     */
    async downloadConfig(url: string, username: string, password: string): Promise<boolean> {
        try {
            // 创建基本认证头
            const authHeader = 'Basic ' + btoa(`${username}:${password}`)
            
            // 发送GET请求到WebDAV服务器
            const response = await fetch(`${url}/tabby-quick-cmds-config.json`, {
                method: 'GET',
                headers: {
                    'Authorization': authHeader
                }
            })
            
            if (!response.ok) {
                return false
            }
            
            // 解析JSON响应
            const configData = await response.json()
            
            // 更新本地配置
            if (configData && configData.cmds) {
                this.config.store.qc.cmds = configData.cmds
                this.config.save()
                return true
            }
            
            return false
        } catch (error) {
            console.error('从WebDAV下载配置失败:', error)
            return false
        }
    }
}