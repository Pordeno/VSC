// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

export * from './Commands/InitializeWorkspace'
export * from './Commands/LanguageServer'
export * from './Commands/References'
export * from './Commands/Welcome'
export * from './Commands/Output'
export * from './Commands/Cache'
export * from './Commands/Test'

/** Contains handlers for commands that are enabled in Visual Studio Code for
 * the extension. */

import type { DenoExtensionContext } from './types'

import * as vscode from "vscode";

// deno-lint-ignore no-explicit-any
export type Callback = (...args: any[]) => unknown;
export type Factory = (
  context: vscode.ExtensionContext,
  extensionContext: DenoExtensionContext,
) => Callback;


