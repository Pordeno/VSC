
export { Command as cache }


import type { DenoExtensionContext } from '../types'
import { DocumentUri } from 'vscode-languageclient'
import { cache } from '../lsp_extensions'

import * as vscode from 'vscode'


type Callback = ( ... args : any [] ) => unknown



/**
 *  For the current document active in the editor
 *  tell the Deno LSP to cache the file and all
 *  of its dependencies in the local cache.
 */

function Command (
    _context : vscode.ExtensionContext ,
    extensionContext : DenoExtensionContext
){
    return (( uris : Array<DocumentUri> = [] ) => {

        const activeEditor = vscode.window.activeTextEditor

        if( ! activeEditor )
            return

        const { client } = extensionContext

        if( ! client )
            return

        return vscode.window.withProgress({
            location : vscode.ProgressLocation.Window ,
            title : 'caching'
        },() => client.sendRequest(cache,{
            referrer : { uri : activeEditor.document.uri.toString() } ,
            uris : uris.map((uri) => ({ uri }))
        }))

    }) satisfies Callback
}
