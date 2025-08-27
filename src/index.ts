import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'
import { ToolbarButtonProvider, ConfigProvider } from 'terminus-core'
import TerminusCoreModule from 'terminus-core'
import { SettingsTabProvider } from 'terminus-settings'

import { EditCommandModalComponent } from './components/editCommandModal.component'
import { QuickCmdsModalComponent } from './components/quickCmdsModal.component'
import { QuickCmdsSettingsTabComponent } from './components/quickCmdsSettingsTab.component'
import { PromptModalComponent } from './components/promptModal.component'
import { WebDAVSyncComponent } from './components/webdavSync.component'

import { ButtonProvider } from './buttonProvider'
import { QuickCmdsConfigProvider } from './config'
import { QuickCmdsSettingsTabProvider } from './settings'
import { WebDAVService } from './services/webdav.service'
import { CommandUpdateService } from './services/command-update.service'

@NgModule({
    imports: [
        NgbModule,
        CommonModule,
        FormsModule,
        TerminusCoreModule,
    ],
    providers: [
        { provide: ToolbarButtonProvider, useClass: ButtonProvider, multi: true },
        { provide: ConfigProvider, useClass: QuickCmdsConfigProvider, multi: true },
        { provide: SettingsTabProvider, useClass: QuickCmdsSettingsTabProvider, multi: true },
        WebDAVService,
        CommandUpdateService,
    ],
    entryComponents: [
        PromptModalComponent,
        EditCommandModalComponent,
        QuickCmdsModalComponent,
        QuickCmdsSettingsTabComponent,
        WebDAVSyncComponent,
    ],
    declarations: [
        PromptModalComponent,
        EditCommandModalComponent,
        QuickCmdsModalComponent,
        QuickCmdsSettingsTabComponent,
        WebDAVSyncComponent,
    ],
})
export default class QuickCmdsModule { }
