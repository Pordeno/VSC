
export { Command as test }

import type { DenoExtensionContext , TestCommandOptions } from '../types'
import { getDenoCommandName , assert } from '../util'
import { EXTENSION_NS } from '../constants'

import * as vscode from 'vscode'
import * as tasks from '../tasks'


function Command (
    _context: vscode.ExtensionContext ,
    _extensionContext: DenoExtensionContext
){
    return async (uriStr: string, name: string, options: TestCommandOptions) => {
      const uri = vscode.Uri.parse(uriStr, true);
      const path = uri.fsPath;
      const config = vscode.workspace.getConfiguration(EXTENSION_NS, uri);
      const testArgs: string[] = [
        ...(config.get<string[]>("codeLens.testArgs") ?? []),
      ];
      if (config.get("unstable")) {
        testArgs.push("--unstable");
      }
      if (options?.inspect) {
        testArgs.push("--inspect-brk");
      }
      if (!testArgs.includes("--import-map")) {
        const importMap: string | undefined | null = config.get("importMap");
        if (importMap?.trim()) {
          testArgs.push("--import-map", importMap.trim());
        }
      }
      const env = {} as Record<string, string>;
      const cacheDir: string | undefined | null = config.get("cache");
      if (cacheDir?.trim()) {
        env["DENO_DIR"] = cacheDir.trim();
      }
      const args = ["test", ...testArgs, "--filter", name, path];

      const definition: tasks.DenoTaskDefinition = {
        type: tasks.TASK_TYPE,
        command: "test",
        args,
        env,
      };

      assert(vscode.workspace.workspaceFolders);
      const target = vscode.workspace.workspaceFolders[0];
      const denoCommand = await getDenoCommandName();
      const task = tasks.buildDenoTask(
        target,
        denoCommand,
        definition,
        `test "${name}"`,
        args,
        ["$deno-test"],
      );

      task.presentationOptions = {
        reveal: vscode.TaskRevealKind.Always,
        panel: vscode.TaskPanelKind.Dedicated,
        clear: true,
      };
      task.group = vscode.TaskGroup.Test;

      const createdTask = await vscode.tasks.executeTask(task);

      if (options?.inspect) {
        await vscode.debug.startDebugging(target, {
          name,
          request: "attach",
          type: "node",
        });
      }

      return createdTask;
    };
  }
