
export { Command as status }

import type { DenoExtensionContext } from '../types'

import { ExtensionContext , commands , Uri } from 'vscode'


/**
 *  Open and display the "virtual document"
 *  which provides the status of the Deno
 *  Language Server.
 */

function Command (
    _context : ExtensionContext ,
    _extensionContext : DenoExtensionContext
){
    return () => {

        const uri = Uri.parse
            ( 'deno:/status.md' )

        return commands.executeCommand
            ( 'markdown.showPreviewToSide' , uri )
    }
}
