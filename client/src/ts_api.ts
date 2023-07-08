// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

import type { PluginSettings, TsApi } from './types'
import { TS_LANGUAGE_FEATURES_EXTENSION , EXTENSION_TS_PLUGIN } from './constants'
import { assert } from './util'

import * as vscode from 'vscode'
import { satisfies } from "semver"


interface TsLanguageFeatures {
    getAPI ( version : 0 ) : undefined | TsLanguageFeaturesApiV0
}


interface TsLanguageFeaturesApiV0 {
    configurePlugin(
        pluginId : string ,
        configuration : PluginSettings
    ) : void
}


export function getTsApi (
    getPluginSettings : () => PluginSettings
){

    let api : undefined | TsLanguageFeaturesApiV0

    ( async () => {

        try {

            const extension = vscode.extensions
                .getExtension(TS_LANGUAGE_FEATURES_EXTENSION)

            const errorMessage =
                `The Deno extension cannot load the built ` +
                `in TypeScript Language Features. Please ` +
                `try restarting Visual Studio Code.`

            assert(extension,errorMessage)

            const languageFeatures =
                await extension.activate()

            api = languageFeatures.getAPI(0)

            assert(api,errorMessage)

            const pluginSettings =
                getPluginSettings()

            api.configurePlugin(EXTENSION_TS_PLUGIN,pluginSettings)

        } catch ( exception ){

            const reason = ( exception instanceof Error )
                ? ` (${ exception.name }: ${ exception.message })` : ''

            const message = `Cannot get internal TypeScript plugin configuration API.${ reason }`

            await vscode.window
                .showErrorMessage(message);
        }

    })()

    return {

        refresh() {

            if( ! api )
                return

            const pluginSettings =
                getPluginSettings()

            api.configurePlugin(EXTENSION_TS_PLUGIN,pluginSettings)
        }

    } satisfies TsApi
}
