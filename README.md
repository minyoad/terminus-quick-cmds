# tabby-quick-cmds

A plugin that provides quick command functionality for Tabby terminal.

## Features

- Quick Command Menu: Quickly open command list through hotkeys
- Command Group Management: Support organizing commands by groups
- Multi-line Command Support: Execute complex commands containing multiple lines
- Hotkey Combination Support: Send special combination key commands (like Ctrl+C, Ctrl+I, etc.)
- Delayed Execution: Support adding delays between commands
- Enter Control: Option to automatically add carriage return at the end of commands

## Hotkeys

- Windows: `Alt+Q`
- macOS: `Alt+Q`
- Linux: `Alt+Q`

## Configuration

### Command Configuration

Each command contains the following properties:
- name: Command name
- text: Command content
- appendCR: Whether to automatically add carriage return (true/false)
- group: Command group (optional)

### Special Syntax

1. Multi-line Commands: Use line breaks directly in command content
```
cd /path/to/project
npm install
npm start
```

2. Combination Keys: Use ASCII control characters
- Ctrl+C: \x03
- Ctrl+I: \x09

3. Delayed Execution: Use \sxxx to add delay
- \s1000: Delay 1000 milliseconds

## Usage Examples

1. Basic Command
```
name: "List Files"
text: "ls -la"
appendCR: true
```

2. Multi-line Command Example
```
name: "Start Project"
text: "cd ~/project\nnpm install\nnpm start"
appendCR: true
```

3. Command with Delay
```
name: "Step Execution"
text: "echo Step 1\s1000\necho Step 2\s1000\necho Step 3"
appendCR: true
```

4. Combination Key Command
```
name: "Interrupt Process"
text: "\x03"
appendCR: false
```
