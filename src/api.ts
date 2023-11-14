export interface QuickCmds {
  name: string;
  text: string;
  appendCR: boolean;
  group?: string;
}

export interface ICmdGroup {
  name: string;
  cmds: QuickCmds[];
}
