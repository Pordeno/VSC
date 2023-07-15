
export { Command as reloadImportRegistries }

import type { DenoExtensionContext } from '../types'
import type { ExtensionContext } from 'vscode'

import { reloadImportRegistries } from '../lsp_extensions'


function Command (
    _context : ExtensionContext ,
    context : DenoExtensionContext
){
    const { client } = context

    return () => client
        ?.sendRequest(reloadImportRegistries)
}
