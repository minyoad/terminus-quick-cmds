# 安装指南

本文档提供了如何安装和配置tabby-quick-cmds插件的详细说明。

## 构建插件

1. **安装依赖**

   ```bash
   npm install --legacy-peer-deps
   ```

   > 注意：使用`--legacy-peer-deps`标志可以避免Angular版本冲突问题。

2. **构建插件**

   ```bash
   npm run build
   ```

   这将在`dist`目录下生成编译后的插件文件。

## 安装到Tabby

### 方法1：手动安装（推荐）

1. **找到Tabby的插件目录**：
   - Windows: `%APPDATA%\tabby\plugins\`
   - macOS: `~/Library/Application Support/tabby/plugins/`
   - Linux: `~/.config/tabby/plugins/`

2. **创建插件目录**：
   - 在插件目录中创建一个名为`tabby-quick-cmds`的文件夹

3. **复制文件**：
   - 将`dist`目录下的所有文件复制到这个文件夹中

4. **重启Tabby**

### 方法2：替换现有插件

如果您已经安装了旧版本的quick-cmds插件，可以直接替换：

1. **找到现有插件目录**：
   - 通常在`%APPDATA%\tabby\plugins\tabby-quick-cmds`（Windows）或相应的其他平台路径

2. **备份原有文件**（可选）

3. **替换文件**：
   - 将新构建的`dist`目录下的所有文件复制到现有插件目录，覆盖原有文件

4. **重启Tabby**

## 故障排除

### 依赖冲突问题

如果在安装依赖时遇到类似以下错误：

```
npm error ERESOLVE unable to resolve dependency tree
```

请尝试以下解决方案：

1. **使用`--legacy-peer-deps`标志**：
   ```bash
   npm install --legacy-peer-deps
   ```

2. **使用`--force`标志**：
   ```bash
   npm install --force
   ```

3. **清除npm缓存**：
   ```bash
   npm cache clean --force
   npm install --legacy-peer-deps
   ```

### 插件不显示

如果插件安装后在Tabby中不可见：

1. **检查插件目录**：
   - 确认插件文件已正确复制到Tabby的插件目录中

2. **检查控制台错误**：
   - 在Tabby中按F12打开开发者控制台
   - 查看是否有与插件相关的错误消息

3. **检查版本兼容性**：
   - 确认插件与您的Tabby版本兼容

## 使用WebDAV同步功能

安装完成后，您可以使用WebDAV同步功能来备份和恢复您的快速命令配置：

1. 在Tabby设置中找到"Quick Commands"选项卡
2. 滚动到页面底部，找到WebDAV同步配置部分
3. 输入您的WebDAV服务器URL、用户名和密码
4. 点击"保存配置"按钮
5. 使用"上传配置到WebDAV"或"从WebDAV下载配置"按钮进行同步操作

配置将以JSON格式保存在WebDAV服务器上的`tabby-quick-cmds-config.json`文件中。