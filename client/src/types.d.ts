// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

export { DenoExtensionContext , TestCommandOptions , TsApi }

import type { DocumentSettings, EnabledPaths, Settings } from './shared_types'
import type { LanguageClientOptions , LanguageClient } from 'vscode-languageclient/node'
import type { ServerCapabilities } from 'vscode-languageclient'
import type { DenoServerInfo } from './server_info'
import type { DenoStatusBar } from './status_bar'
import type * as vscode from 'vscode'

export * from './shared_types'


interface TsApi {

    /**
     *  Update the Typescript-Deno-Plugin with settings.
     */

    refresh() : void
}


interface DenoExperimental {

    /**
     *  Support for the `deno/task` request,
     *  which returns any tasks that are
     *  defined in the config files.
     */

    denoConfigTasks ?: boolean
}


interface DenoExtensionContext {

    clientOptions : LanguageClientOptions
    client : undefined | LanguageClient

    /** A record of filepaths and their document settings. */

    documentSettings : Record<string,DocumentSettings>
    enabledPaths : Array<EnabledPaths>
    serverInfo : undefined | DenoServerInfo

    /** The capabilities returned from the server. */

    serverCapabilities:
        | ServerCapabilities<DenoExperimental>
        | undefined

    testController : undefined | vscode.TestController
    statusBar : DenoStatusBar
    tsApi : TsApi

    /** The current workspace settings. */

    workspaceSettings : Settings
    outputChannel : vscode.OutputChannel
}


interface TestCommandOptions {
    inspect : boolean
}
