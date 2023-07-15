
export { Command as showReferences }

import type { Location , Position } from 'vscode-languageclient/node'
import type { DenoExtensionContext } from '../types'

import { ExtensionContext , commands , Uri } from 'vscode'


function Command (
    _content : ExtensionContext ,
    context : DenoExtensionContext
){

	const { client } = context

	if( ! client )
		return () => {}

	const converter = client
        .protocol2CodeConverter

    return (
        uri : string ,
        position : Position ,
        locations : Array<Location>
    ) =>
        commands.executeCommand(
            'editor.action.showReferences' ,
            Uri.parse(uri) ,
            converter.asPosition(position) ,
            locations.map(converter.asLocation)
        )
}
