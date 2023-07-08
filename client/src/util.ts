// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

export { getDenoCommandName , getDenoCommandPath , assert }

import { EXTENSION_NS } from "./constants";

import * as Files from 'node:fs/promises'
import * as os from "os";
import * as path from "path";
import * as process from "process";
import * as vscode from "vscode";


/** Assert that the condition is "truthy", otherwise throw. */

function assert ( condition : unknown , failure = `Assertion failed.` ) : asserts condition {

    if( condition )
        return

    throw new Error(failure)
}


/** Returns the absolute path to an existing deno command or
 * the "deno" command name if not found. */

async function getDenoCommandName (){
    return await getDenoCommandPath() ?? 'deno'
}

/** Returns the absolute path to an existing deno command. */

async function getDenoCommandPath (){

    const command = getWorkspaceConfigDenoExePath()

    const { workspaceFolders } = vscode.workspace

    if( ! command || ! workspaceFolders )
        return command ?? await getDefaultDenoCommand()

    if( path.isAbsolute(command) )
        return command

    // if sent a relative path, iterate over workspace folders to try and resolve.

    for ( const workspace of workspaceFolders ){

        const commandPath = path.resolve(workspace.uri.fsPath,command)

        if( await fileExists(commandPath) )
            return commandPath
    }

    return undefined
}


function getWorkspaceConfigDenoExePath (){

    const path = vscode.workspace
        .getConfiguration(EXTENSION_NS)
        .get<string>('path')

    if( isBlank(path) )
        return undefined

    return path
}


function isBlank ( string : undefined | null | string ){
    return string?.length === 0
}



// Adapted from https://github.com/npm/node-which/blob/master/which.js
  // Within vscode it will do `require("child_process").spawn("deno")`,
  // which will prioritize "deno.exe" on the path instead of a possible
  // higher precedence non-exe executable. This is a problem because, for
  // example, version managers may have a `deno.bat` shim on the path. To
  // ensure the resolution of the `deno` command matches what occurs on the
  // command line, attempt to manually resolve the file path (issue #361).

async function getDefaultDenoCommand() {

    const denoCmd = "deno";
    const pathValue = process.env.PATH ?? "";
    const pathFolderPaths = splitEnvValue(pathValue);
    // resolve the default install location in case it's not on the PATH
    pathFolderPaths.push(getUserDenoBinDir());
    const pathExts = getPathExts()

    const cmdFileNames = ( pathExts == null )
        ? [ denoCmd ]
        : pathExts.map(( extension ) => denoCmd + extension )

    for ( const pathFolderPath of pathFolderPaths ){

        for ( const cmdFileName of cmdFileNames ){

            const file = path.join(pathFolderPath,cmdFileName)

            if( await fileExists(file) )
                return file
        }
    }

    // nothing found
    return undefined

    function getPathExts (){

        if( os.platform() === 'win32' ){

            const pathExtValue =
                ( process.env.PATHEXT )
                ?? `.EXE;.CMD;.BAT;.COM`

            return splitEnvValue(pathExtValue)
        }

        return undefined
    }

    function splitEnvValue ( value : string ){

        const separator = ( os.platform() === 'win32' )
            ? ';' : ':'

        return value
            .split(separator)
            .map(( item ) => item.trim() )
            .filter(( item ) => item.length > 0 );
    }

    function getUserDenoBinDir (){
        return path.join(os.homedir(),'.deno','bin')
    }
}


function fileExists ( path : string ){
    return Files.stat(path)
        .then(( stats ) => stats.isFile() )
        .catch(() => false )
}
