export interface QuickCmds {
    name: string
    text: string
    appendCR: boolean
    group?: string
    shortcut?: string
}

export interface ICmdGroup {
    name: string
    cmds: QuickCmds[]
}
