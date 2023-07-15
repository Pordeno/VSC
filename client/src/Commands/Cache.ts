
export { Command as cache }

import type { DenoExtensionContext } from '../types'
import type { ExtensionContext } from 'vscode'

import { ProgressLocation , window } from 'vscode'
import { DocumentUri } from 'vscode-languageclient'
import { cache } from '../lsp_extensions'



/**
 *  For the current document active in the editor
 *  tell the Deno LSP to cache the file and all
 *  of its dependencies in the local cache.
 */

function Command (
    _context : ExtensionContext ,
    extensionContext : DenoExtensionContext
){
    return ( uris : Array<DocumentUri> = [] ) => {

        const activeEditor = window.activeTextEditor

        if( ! activeEditor )
            return

        const { client } = extensionContext

        if( ! client )
            return

        return window.withProgress({
            location : ProgressLocation.Window ,
            title : 'caching'
        },() => client.sendRequest(cache,{
            referrer : { uri : activeEditor.document.uri.toString() } ,
            uris : uris.map((uri) => ({ uri }))
        }))
    }
}
