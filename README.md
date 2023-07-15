
<div align = center >

# Alternative VSCode <br> extension for Deno

Adds support for **[Deno]** to **VSCode** with  
the help of the Deno Language Server.

<br>
<br>

<kbd>

Based on [denoland/vscode_deno] commit [0cde6b0]

</kbd>

<br>

![Preview]

</div>

<br>



<br>

## Features

- Type checking for JavaScript and TypeScript, including quick fixes, hover
  cards, intellisense, and more.
- Integrates with the version of the Deno CLI you have installed, ensuring there
  is alignment between your editor and the Deno CLI.
- Resolution of modules in line with Deno CLI's module resolution strategy
  allows caching of remote modules in Deno CLI's cache.
- Integration to Deno CLI's linting functionality, including inline diagnostics
  and hover cards.
- Integration to Deno CLI's formatting functionality.
- Allow specifying of import maps and TypeScript configuration files that are
  used with the Deno CLI.
- [Auto completion for imports](./docs/ImportCompletions.md).
- [Workspace folder configuration](./docs/workspaceFolders.md).
- [Testing Code Lens](./docs/testing.md).
- [Provides Tasks for the Deno CLI](./docs/tasks.md).

<br>
<br>

## Usage

1. Install the Deno CLI.
2. Install this extension.
3. Ensure `deno` is available in the environment path, or set its path via the
   `deno.path` setting in VSCode.
4. Open the VS Code command palette with `Ctrl+Shift+P`, and run the _Deno:
   Initialize Workspace Configuration_ command.

We recognize that not every TypeScript/JavaScript project that you might work on
in VSCode uses Deno — therefore, by default, this extension will only apply the
Deno language server when the setting `deno.enable` is set to `true`. This can
be done via editing the settings or using the command _Deno: Initialize
Workspace Configuration_.

While you can enable Deno globally, you probably only want to do that if every
JavaScript/TypeScript workspace you work on in VSCode is a Deno based one.

<br>
<br>

## Commands

The extension provides several commands:

- _Deno: Cache_ - instructs Deno to fetch and cache all the dependencies of the
  current file open in the editor. This is similar to doing `deno cache` on the
  command line. Deno will not automatically fetch and cache remote dependencies.

  > ℹ️ &nbsp; If there are missing dependencies in a module, the extension will
  > provide a quick fix to fetch and cache those dependencies, which invokes
  > this command for you.
- _Deno: Initialize Workspace Configuration_ - will enabled Deno on the current
  workspace and allow you to choose to enable linting and Deno _unstable_ API
  options.
- _Deno: Language Server Status_ - displays a page of information about the
  status of the Deno Language Server. Useful when submitting a bug about the
  extension or the language server. _ _Deno: Reload Import Registries Cache_ -
  reload any cached responses from the configured import registries.
- _Deno: Welcome_ - displays the information document that appears when the
  extension is first installed.

<br>
<br>

## Formatting

The extension provides formatting capabilities for JavaScript, TypeScript, JSX,
TSX, JSON and markdown documents. When choosing to format a document or setting
up a default formatter for these type of files, the extension should be listed
as an option.

When configuring a formatter, you use the extension name, which in the case of
this extension is `denoland.vscode-deno`. For example, to configure Deno to
format your TypeScript files automatically on saving, you might set your
`settings.json` in the workspace like this:

```json
{
  "deno.enable": true,
  "deno.lint": true,
  "editor.formatOnSave": true,
  "[typescript]": { "editor.defaultFormatter": "denoland.vscode-deno" }
}
```

Or if you wanted to have Deno be your default formatter overall:

```json
{
  "deno.enable": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "denoland.vscode-deno"
}
```

The formatter will respect the settings in your Deno configuration file, which
can be explicitly set via `deno.config` or automatically detected in the
workspace. You can find more information about formatter settings at
[Deno Tools - Formatter](https://deno.land/manual/tools/formatter).

> ℹ️ &nbsp; It does not currently provide format-on-paste or format-on-type
> capabilities.

<br>
<br>



<br>
<br>

## Contribute

We appreciate your help!

To build the extension locally, clone this repository and run the following
steps:

1. Open this folder in VS Code.
2. Run `npm i`.
3. Run the `Launch Client` launch task from the VSCode debug menu.

After making changes to the extension you can use the restart button in the
VSCode debug menu, this makes a new build and reloads the client.

Note that if you already have the deno extension installed from the VSCode
Marketplace, it will be replaced for the `Launch Client` instance only. So
there's no need to uninstall your existing Deno extension.

Most changes and feature enhancements do not require changes to the extension
though, as most information comes from the Deno Language Server itself, which is
integrated into the Deno CLI. Please check out the
[contribution guidelines](https://deno.land/manual/contributing) for the Deno
CLI.

## Thanks

This project was inspired by
[justjavac/vscode-deno](https://github.com/justjavac/vscode-deno) and
[axetroy/vscode-deno](https://github.com/axetroy/vscode-deno). Thanks for their
contributions.

## License

The [MIT License](LICENSE)


<!----------------------------------------------------------------------------->

[denoland/vscode_deno]: https://github.com/denoland/vscode_deno
[0cde6b0]: https://github.com/denoland/vscode_deno/commit/0cde6b0abdadf609c5cdc467066cd10a4f02710e
[Preview]: ./screenshots/basic_usage.gif
[Deno]: https://deno.land/
