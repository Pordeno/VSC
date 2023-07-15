
export { Command as startLanguageServer }

import type { DenoExtensionContext } from '../types'
import { LANGUAGE_CLIENT_NAME , LANGUAGE_CLIENT_ID , ENABLEMENT_FLAG , SERVER_SEMVER } from '../constants'
import { DenoTestController, TestingFeature } from '../testing'
import { LanguageClient, ServerOptions } from 'vscode-languageclient/node'
import { createRegistryStateHandler } from '../notification_handlers'
import { getWorkspacesEnabledInfo } from '../enable'
import { getDenoCommandPath } from '../util'
import { DenoServerInfo } from '../server_info'
import { registryState } from '../lsp_extensions'
import { welcome } from './Welcome'

import * as semver from 'semver'
import * as vscode from 'vscode'


type Callback = ( ... args : any [] ) => unknown


/** Start (or restart) the Deno Language Server */

function Command (
    context : vscode.ExtensionContext ,
    extensionContext : DenoExtensionContext
){

    return ( async () => {
      // Stop the existing language server and reset the state
      if (extensionContext.client) {
        const client = extensionContext.client;
        extensionContext.client = undefined;
        extensionContext.testController?.dispose();
        extensionContext.testController = undefined;
        extensionContext.statusBar.refresh(extensionContext);
        vscode.commands.executeCommand("setContext", ENABLEMENT_FLAG, false);
        await client.stop();
      }

      // Start a new language server
      const command = await getDenoCommandPath();
      if (command == null) {
        const message =
          "Could not resolve Deno executable. Please ensure it is available " +
          `on the PATH used by VS Code or set an explicit "deno.path" setting.`;

        // only show the message if the user has enabled deno or they have
        // a deno configuration file and haven't explicitly disabled deno
        const enabledInfo = await getWorkspacesEnabledInfo();
        const shouldShowMessage = enabledInfo
          .some((e) => e.enabled || e.hasDenoConfig && e.enabled !== false);
        if (shouldShowMessage) {
          vscode.window.showErrorMessage(message);
        }
        extensionContext.outputChannel.appendLine(`Error: ${message}`);
        return;
      }

      const env = {
        ...process.env,
        "DENO_V8_FLAGS": getV8Flags(),
        "NO_COLOR": true,
      };

      const serverOptions: ServerOptions = {
        run: {
          command,
          args: ["lsp"],
          options: { env },
        },
        debug: {
          command,
          // disabled for now, as this gets super chatty during development
          // args: ["lsp", "-L", "debug"],
          args: ["lsp"],
          options: { env },
        },
      };
      const client = new LanguageClient(
        LANGUAGE_CLIENT_ID,
        LANGUAGE_CLIENT_NAME,
        serverOptions,
        {
          outputChannel: extensionContext.outputChannel,
          ...extensionContext.clientOptions,
        },
      );
      const testingFeature = new TestingFeature();
      client.registerFeature(testingFeature);
      await client.start();

      // set this after a successful start
      extensionContext.client = client;

      vscode.commands.executeCommand("setContext", ENABLEMENT_FLAG, true);
      extensionContext.serverInfo = new DenoServerInfo(
        client.initializeResult?.serverInfo,
      );
      extensionContext.serverCapabilities = client.initializeResult?.capabilities;
      extensionContext.statusBar.refresh(extensionContext);

      if (testingFeature.enabled) {
        context.subscriptions.push(new DenoTestController(extensionContext));
      }

      context.subscriptions.push(
        client.onNotification(
          registryState,
          createRegistryStateHandler(),
        ),
      );

      extensionContext.tsApi.refresh();

      if (
        semver.valid(extensionContext.serverInfo.version) &&
        !semver.satisfies(extensionContext.serverInfo.version, SERVER_SEMVER)
      ) {
        notifyServerSemver(extensionContext.serverInfo.version);
      } else {
        showWelcomePageIfFirstUse(context, extensionContext);
      }
    }) satisfies Callback

    function getV8Flags (){

        let v8Flags = process.env.DENO_V8_FLAGS ?? "";

        const hasMaxOldSpaceSizeFlag = v8Flags.includes("--max-old-space-size=") ||
            v8Flags.includes("--max_old_space_size=");

        if (
            hasMaxOldSpaceSizeFlag &&
            extensionContext.workspaceSettings.maxTsServerMemory == null
        ) {
            // the v8 flags already include a max-old-space-size and the user
            // has not provided a maxTsServerMemory value
            return v8Flags;
        }
        // Use the same defaults and minimum as vscode uses for this setting
        // https://github.com/microsoft/vscode/blob/48d4ba271686e8072fc6674137415bc80d936bc7/extensions/typescript-language-features/src/configuration/configuration.ts#L213-L214
        const maxTsServerMemory = Math.max(
            128,
            extensionContext.workspaceSettings.maxTsServerMemory ?? 3072,
        );
        if (v8Flags.length > 0) {
            v8Flags += ",";
        }
        // flags at the end take precedence
        v8Flags += `--max-old-space-size=${maxTsServerMemory}`;
        return v8Flags;
    }
}


function notifyServerSemver ( serverVersion : string ){
    return vscode.window.showWarningMessage(
        `The version of Deno language ` +
        `server ("${ serverVersion }") ` +
        `does not meet the requirements ` +
        `of the extension ("${ SERVER_SEMVER }"). ` +
        `Please update Deno and restart.` ,
        'OK'
    )
}

function showWelcomePageIfFirstUse(
    context : vscode.ExtensionContext ,
    _extensionContext : DenoExtensionContext
){

    const welcomeShown = context.globalState
        .get<boolean>('deno.welcomeShown')
        ?? false

    if( welcomeShown )
        return

    welcome(context)()

    context.globalState
        .update('deno.welcomeShown',true)
}
