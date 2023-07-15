
export { Command as welcome }

import type { ExtensionContext } from 'vscode'
import { WelcomePanel } from '../welcome'


function Command ( context : ExtensionContext ){

    const { extensionUri } = context

    return () => WelcomePanel
        .createOrShow(extensionUri)
}
