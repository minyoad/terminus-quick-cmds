# tabby-quick-cmds

Quick commands plugin for tabby

# Shortcuts

The default shortcut for opening the Quick Commands menu is `Alt+Q` for Windows.

# Features

## WebDAV同步
新增WebDAV同步功能，可以将命令配置同步到WebDAV服务器，方便在多台设备间共享配置。
在设置页面底部可以找到WebDAV同步配置选项，填写WebDAV服务器地址、用户名和密码后，可以上传或下载配置。

## 其他功能
1. 支持多行命令
2. 支持组合键，如Ctrl+I、Ctrl+C等，使用十六进制值如\x03
   参考：https://www.physics.udel.edu/~watson/scen103/ascii.html
3. 支持延迟命令，使用\sxxx可以延迟xxx毫秒

# Update History
## v1.1.0.1
- 修复保存WebDAV配置会丢失的问题

## v1.1.0.0
- 修复WebDAV下载配置后页面刷新问题，现在下载配置后不再需要重启应用
- 修复添加命令后输入框无法获取焦点的问题
- 优化WebDAV同步功能，提升用户体验
- 添加最近上传和下载时间显示

## v1.0.4
- 新增WebDAV同步功能，支持配置的云端备份和恢复

## v1.0.3
- 修复了每个命令后都会跟上一个换行的问题
- 更新依赖到最新版本，修复构建错误
- 添加多行命令支持
- 添加控制字符支持
- 添加延迟命令支持

fork自官方插件 https://github.com/minyoad/terminus-quick-cmds
目前主要在Windows平台上测试
