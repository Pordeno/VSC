// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

export { DenoTextDocumentContentProvider , SCHEME }

import type { TextDocumentContentProvider , CancellationToken , Uri } from 'vscode'
import type { DenoExtensionContext } from './types'
import { virtualTextDocument } from './lsp_extensions'


const SCHEME = 'deno'


class DenoTextDocumentContentProvider
implements TextDocumentContentProvider {

    constructor (
        private extensionContext : DenoExtensionContext
    ){}

    provideTextDocumentContent (
        uri : Uri ,
        token : CancellationToken
    ){

        if( ! this.extensionContext.client )
            throw new Error(`Deno language server has not started.`)

        return this.extensionContext.client
            .sendRequest(virtualTextDocument,{
                textDocument : { uri : uri.toString() } } ,
                token )
    }
}
