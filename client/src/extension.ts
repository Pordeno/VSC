// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

export { deactivate , activate }


import { satisfies } from "semver";
import * as commands from "./commands";
import {
  ENABLE_PATHS,
  ENABLEMENT_FLAG,
  EXTENSION_NS,
  LANGUAGE_CLIENT_NAME,
} from "./constants";
import { DenoTextDocumentContentProvider, SCHEME } from "./content_provider";
import { DenoDebugConfigurationProvider } from "./debug_config_provider";
import { setupCheckConfig } from "./enable";
import type { EnabledPaths } from "./shared_types";
import { DenoStatusBar } from "./status_bar";
import { activateTaskProvider } from "./tasks";
import { getTsApi } from "./ts_api";
import type { DenoExtensionContext, Settings } from "./types";
import { assert } from "./util";

import * as vscode from "vscode";

/** The language IDs we care about. */

const LANGUAGES = [
    'typescriptreact' ,
    'javascriptreact' ,
    'typescript' ,
    'javascript'
]

/** These are keys of settings that have a scope of window or machine. */

const workspaceSettingsKeys = [

    'unsafelyIgnoreCertificateErrors' ,
    'documentPreloadLimit' ,
    'maxTsServerMemory' ,
    'certificateStores' ,
    'tlsCertificate' ,
    'internalDebug' ,
    'enablePaths' ,
    'inlayHints' ,
    'importMap' ,
    'codeLens' ,
    'unstable' ,
    'suggest' ,
    'testing' ,
    'config' ,
    'enable' ,
    'cache' ,
    'lint' ,
    'path'

] satisfies Array < keyof Settings >


/** These are keys of settings that can apply to an individual resource, like
 * a file or folder. */

const resourceSettingsKeys = [

    'enablePaths' ,
    'codeLens' ,
    'enable'

] satisfies Array < keyof Settings >


/** Convert a workspace configuration to `Settings` for a workspace. */

function configToWorkspaceSettings (
    config : vscode.WorkspaceConfiguration
){

    const settings = Object
        .create(null)

    for ( const key of workspaceSettingsKeys )
        settings[key] = config.get(key)

    return settings as Settings
}


/** Convert a workspace configuration to settings that apply to a resource. */

function configToResourceSettings (
    config : vscode.WorkspaceConfiguration
){

    const settings = Object
        .create(null)

    for ( const key of resourceSettingsKeys ){

        const value = config
            .inspect(key)

        assert(value)

        settings[key] = value.workspaceFolderLanguageValue
            ?? value.workspaceFolderValue
            ?? value.workspaceLanguageValue
            ?? value.workspaceValue
            ?? value.globalValue
            ?? value.defaultValue
    }

    return settings satisfies Partial<Settings>
}


function getEnabledPaths (){

    const items : Array<EnabledPaths> = []

    const folders = vscode
        .workspace.workspaceFolders

    if( ! folders )
        return items

    for ( const folder of folders ){

        const config = vscode.workspace
            .getConfiguration(EXTENSION_NS,folder)

        const enabledPaths = config
            .get<Array<string>>(ENABLE_PATHS)

        if( ! enabledPaths?.length )
            continue

        const paths = enabledPaths
            .map(( path ) => vscode.Uri.joinPath(folder.uri,path).fsPath);

        const workspace = folder.uri.fsPath

        items.push({ workspace , paths })
    }

    return items
}


function getWorkspaceSettings (){

    const config = vscode.workspace
        .getConfiguration(EXTENSION_NS)

    return configToWorkspaceSettings(config)
}


function handleConfigurationChange(event: vscode.ConfigurationChangeEvent) {
  if (event.affectsConfiguration(EXTENSION_NS)) {
    extensionContext.client?.sendNotification(
      "workspace/didChangeConfiguration",
      // We actually set this to empty because the language server will
      // call back and get the configuration. There can be issues with the
      // information on the event not being reliable.
      { settings: null },
    );
    extensionContext.workspaceSettings = getWorkspaceSettings();
    for (
      const [key, { scope }] of Object.entries(
        extensionContext.documentSettings,
      )
    ) {
      extensionContext.documentSettings[key] = {
        scope,
        settings: configToResourceSettings(
          vscode.workspace.getConfiguration(EXTENSION_NS, scope),
        ),
      };
    }
    extensionContext.enabledPaths = getEnabledPaths();
    extensionContext.tsApi.refresh();
    extensionContext.statusBar.refresh(extensionContext);

    // restart when certain config changes
    if (
      event.affectsConfiguration("deno.path") ||
      event.affectsConfiguration("deno.maxTsServerMemory")
    ) {
      vscode.commands.executeCommand("deno.restart");
    }
  }
}

function handleChangeWorkspaceFolders (){
    extensionContext.enabledPaths = getEnabledPaths()
    extensionContext.tsApi.refresh()
}


function handleDocumentOpen (
    ... documents : Array<vscode.TextDocument>
){

    const { documentSettings , tsApi } = extensionContext

    let didChange = false;

    for ( const doc of documents ){

        if ( ! LANGUAGES.includes(doc.languageId) )
            continue

        const { languageId, uri } = doc;

        const config = vscode.workspace
            .getConfiguration(EXTENSION_NS, { languageId, uri })

        documentSettings[ doc.uri.fsPath ] = {
            settings : configToResourceSettings(config) ,
            scope : { languageId , uri }
        }

        didChange = true
    }

    if( didChange )
        tsApi.refresh()
}


const extensionContext = {} as DenoExtensionContext


/** When the extension activates, this function is called with the extension
 * context, and the extension bootstraps itself. */

async function activate (
    context : vscode.ExtensionContext
){

    extensionContext.outputChannel ??= vscode.window
		.createOutputChannel(LANGUAGE_CLIENT_NAME)

    extensionContext.clientOptions = {

        diagnosticCollectionName : 'deno' ,
        initializationOptions : getWorkspaceSettings ,


        documentSelector : [

			{ scheme : 'file' , language : 'typescriptreact' } ,
			{ scheme : 'file' , language : 'javascriptreact' } ,
			{ scheme : 'file' , language : 'javascript' } ,
			{ scheme : 'file' , language : 'typescript' } ,
			{ scheme : 'file' , language : 'markdown' } ,
			{ scheme : 'file' , language : 'jsonc' } ,
			{ scheme : 'file' , language : 'json' } ,

			{ scheme : 'deno' , language : 'javascriptreact' } ,
			{ scheme : 'deno' , language : 'typescriptreact' } ,
			{ scheme : 'deno' , language : 'javascript' } ,
			{ scheme : 'deno' , language : 'typescript' } ,
        ],

        markdown : {
        	isTrusted : true
        }
    }


    // When a workspace folder is opened, the updates or changes to the workspace
    // folders need to be sent to the TypeScript language service plugin

	vscode.workspace.onDidChangeWorkspaceFolders(
        handleChangeWorkspaceFolders ,
        extensionContext ,
        context.subscriptions
    )

    // When a document opens, the language server will query the client to
    // determine the specific configuration of a resource, we need to ensure the
    // the builtin TypeScript language service has the same "view" of the world,
    // so when Deno is enabled, we need to disable the built in language service,
    // but this is determined on a file by file basis.

	vscode.workspace.onDidOpenTextDocument(
        handleDocumentOpen ,
        extensionContext ,
        context.subscriptions
    )


    // Send a notification to the language server when the configuration changes
    // as well as update the TypeScript language service plugin

    vscode.workspace.onDidChangeConfiguration(
        handleConfigurationChange ,
        extensionContext ,
        context.subscriptions
    )


    extensionContext.statusBar = new DenoStatusBar
    context.subscriptions.push(extensionContext.statusBar)


    // Register a content provider for Deno resolved read-only files.

	context.subscriptions.push(
        vscode.workspace.registerTextDocumentContentProvider(SCHEME,new DenoTextDocumentContentProvider(extensionContext))
    )

    context.subscriptions.push(
        vscode.debug.registerDebugConfigurationProvider(
        'deno',new DenoDebugConfigurationProvider(extensionContext))
    )


    // Activate the task provider.

	context.subscriptions.push(activateTaskProvider(extensionContext));

    // Register any commands.

	const registerCommand = createRegisterCommand(context)
    registerCommand('reloadImportRegistries',commands.reloadImportRegistries)
    registerCommand('initializeWorkspace',commands.initializeWorkspace)
    registerCommand('showReferences',commands.showReferences)
    registerCommand('openOutput',commands.openOutput)
    registerCommand('restart',commands.startLanguageServer)
    registerCommand('welcome',commands.welcome)
    registerCommand('status',commands.status)
    registerCommand('cache',commands.cache)
    registerCommand('test',commands.test)

    extensionContext.tsApi = getTsApi(() => ({
        enabledPaths : extensionContext.enabledPaths ,
        workspace : extensionContext.workspaceSettings ,
        documents : extensionContext.documentSettings
    }))

    extensionContext.workspaceSettings = getWorkspaceSettings()
    extensionContext.documentSettings = {}
    extensionContext.enabledPaths = getEnabledPaths()


	// setup detection of enabling Deno detection

    context.subscriptions.push(await setupCheckConfig())


    // when we activate, it might have been because a document was opened that
    // activated us, which we need to grab the config for and send it over to the
    // plugin

    handleDocumentOpen(...vscode.workspace.textDocuments)

    await commands.startLanguageServer(context,extensionContext)()
}


function deactivate (){

    const { client } = extensionContext

    if( ! client )
        return

    const { statusBar } = extensionContext

    extensionContext.client = undefined

    statusBar.refresh(extensionContext)

    vscode.commands.executeCommand
        ('setContext',ENABLEMENT_FLAG,false)

    return client
        .stop()
}


/** Internal function factory that returns a registerCommand function that is
 * bound to the extension context. */

type CommandCallback = (
    context: vscode.ExtensionContext,
    extensionContext: DenoExtensionContext,
  ) => commands.Callback

function createRegisterCommand (
    context : vscode.ExtensionContext
){
    return ( name : string , onCommand : CommandCallback ) => {

        const fullName = `${ EXTENSION_NS }.${ name }`

        const command = onCommand(context,extensionContext)

        const subscription = vscode.commands
            .registerCommand(fullName,command)

        context.subscriptions.push(subscription)
    }
}
