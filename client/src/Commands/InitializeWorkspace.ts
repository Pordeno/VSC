
export { Command as initializeWorkspace }

import type { DenoExtensionContext } from '../types'
import { pickInitWorkspace } from '../initialize_project'
import { EXTENSION_NS } from '../constants'
import { assert } from '../util'

import * as vscode from 'vscode'


function Command (
    _context : vscode.ExtensionContext ,
    _extensionContext : DenoExtensionContext
){
    return async () => {

        try {

            const settings = await
                pickInitWorkspace()

            const config = vscode.workspace
                .getConfiguration(EXTENSION_NS)

            await config.update('enable',true)

            const lintInspect = config
                .inspect('lint')

            assert(lintInspect);

            const unstableInspect = config
                .inspect('unstable')

            assert(unstableInspect)

            // Don't write settings if they have default values.

            if( lintInspect.defaultValue != settings.lint )
                await config.update('lint',settings.lint)

            if( unstableInspect.defaultValue != settings.unstable )
                await config.update('unstable',settings.unstable)

            await vscode.window.showInformationMessage
                ( `Deno is now setup in this workspace.` )

        } catch {
            vscode.window.showErrorMessage
                ( `Deno project initialization failed.` )
        }

    }
}
