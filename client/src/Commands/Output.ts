
export { Command as openOutput }

import type { DenoExtensionContext } from '../types'
import type { ExtensionContext } from 'vscode'


function Command (
    _context : ExtensionContext ,
    extension : DenoExtensionContext
){
    const { outputChannel } = extension

    return () => outputChannel
        .show(true)
}
