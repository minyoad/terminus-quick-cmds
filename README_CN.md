# tabby-quick-cmds

一个为Tabby终端提供快速命令功能的插件。

## 功能特性

- 快速命令菜单：通过快捷键快速打开命令列表
- 命令分组管理：支持将命令按组进行分类管理
- 多行命令支持：可以执行包含多行的复杂命令
- 组合键支持：支持发送特殊的组合键命令（如Ctrl+C、Ctrl+I等）
- 延迟执行：支持在命令之间添加延时
- 回车控制：可以选择是否在命令末尾自动添加回车

## 快捷键

- Windows: `Alt+Q`
- macOS: `Alt+Q`
- Linux: `Alt+Q`

## 配置说明

### 命令配置

每个命令包含以下属性：
- name: 命令名称
- text: 命令内容
- appendCR: 是否自动添加回车（true/false）
- group: 所属分组（可选）

### 特殊语法

1. 多行命令：直接在命令内容中使用换行符
```
cd /path/to/project
npm install
npm start
```

2. 组合键：使用ASCII控制字符
- Ctrl+C: \x03
- Ctrl+I: \x09

3. 延迟执行：使用\sxxx添加延时
- \s1000：延迟1000毫秒

## 使用示例

1. 基本命令
```
name: "列出文件"
text: "ls -la"
appendCR: true
```

2. 多行命令示例
```
name: "启动项目"
text: "cd ~/project\nnpm install\nnpm start"
appendCR: true
```

3. 带延迟的命令
```
name: "分步执行"
text: "echo Step 1\s1000\necho Step 2\s1000\necho Step 3"
appendCR: true
```

4. 组合键命令
```
name: "中断进程"
text: "\x03"
appendCR: false
```