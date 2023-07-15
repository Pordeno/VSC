
# Configuration

You can control the settings for this extension through your VS Code settings
page. You can open the settings page using the `Ctrl+,` keyboard shortcut. The
extension has the following configuration options:

```jsonc
{
    /*
     *  Whether or not the this extension is enabled.
     *  
     *  When enabled the built-in VSCode 
     *  JavaScript / TypeScript language 
     *  services are replaced with the 
     *  Deno Language Server ( `deno lsp` )
     */

    "deno.enable" : false ,

    /*
     *  Paths to limit the language server to.
     */

    "deno.enablePaths" : [] ,

    /*
     *  Overrides the path to the Deno executable
     *  
     *  Examples:
     *  -   /usr/bin/deno
     *  -   C:\Program Files\deno\deno.exe
     */

    "deno.path" : null ,

    /*
     *  Overrides the path to the cache folder
     */

    "deno.cache" : null ,


}
```


- `deno.codeLens.implementations`: Enables or disables the display of code lens
  information for implementations for items in the code. _boolean, default
  `false`_

- `deno.codeLens.references`: Enables or disables the display of code lens
  information for references of items in the code. _boolean, default `false`_

- `deno.codeLens.referencesAllFunctions`: Enables or disables the display of
  code lens information for all functions in the code. Requires
  `deno.codeLens.references` to be enabled as well. _boolean, default `false`_

- `deno.codeLens.test`: Enables or disables the display of test code lens on
  Deno tests. _boolean, default `false`_. _This feature is deprecated, see
  `deno.testing` below_

- `deno.codeLens.testArgs`: Provides additional arguments that should be set
  when invoking the Deno CLI test from a code lens. _array of strings, default
  `[ "--allow-all" ]`_.

- `deno.config`: The file path to a configuration file. This is the equivalent
  to using `--config` on the command line. The path can be either be relative to
  the workspace, or an absolute path. It is recommended you name this file
  either `deno.json` or `deno.jsonc`. _string, default `null`, examples:
  `./deno.jsonc`, `/path/to/deno.jsonc`, `C:\path\to\deno.jsonc`_

- `deno.documentPreloadLimit`: Maximum number of file system entries to traverse
  when finding scripts to preload into TypeScript on startup. Set this to `0` to
  disable document preloading.

- `deno.importMap`: The file path to an import map. This is the equivalent to
  using `--import-map` on the command line.
  [Import maps](https://deno.land/manual/linking_to_external_code/import_maps)
  provide a way to "relocate" modules based on their specifiers. The path can
  either be relative to the workspace, or an absolute path. _string, default
  `null`, examples: `./import_map.json`, `/path/to/import_map.json`,
  `C:\path\to\import_map.json`_

- `deno.inlayHints.enumMemberValues.enabled` - Enable/disable inlay hints for
  enum values.

- `deno.inlayHints.functionLikeReturnTypes.enabled` - Enable/disable inlay hints
  for implicit function return types.

- `deno.inlayHints.parameterNames.enabled` - Enable/disable inlay hints for
  parameter names. Values can be `"none"`, `"literals"`, `"all"`.

- `deno.inlayHints.parameterNames.suppressWhenArgumentMatchesName` - Do not
  display an inlay hint when the argument name matches the parameter.

- `deno.inlayHints.parameterTypes.enabled` - Enable/disable inlay hints for
  implicit parameter types.

- `deno.inlayHints.propertyDeclarationTypes.enabled` - Enable/disable inlay

  hints for implicit property declarations.

- `deno.inlayHints.variableTypes.enabled` - Enable/disable inlay hints for
  implicit variable types.

- `deno.inlayHints.variableTypes.suppressWhenTypeMatchesName` - Suppress type
  hints where the variable name matches the implicit type.

- `deno.internalDebug`: If enabled the Deno Language Server will log additional
  internal diagnostic information.

- `deno.lint`: Controls if linting information will be provided by the Deno
  Language Server. _boolean, default `true`_

- `deno.maxTsServerMemory`: Maximum amount of memory the TypeScript isolate can
  use. Defaults to 3072 (3GB).

- `deno.suggest.imports.hosts`: A map of domain hosts (origins) that are used
  for suggesting import auto completions. (See:
  [ImportCompletions](./docs/ImportCompletions.md) for more information.)

- `deno.testing.args`: Arguments to use when running tests via the Test
  Explorer. Defaults to `[ \"--allow-all\" ]`.

- `deno.testing.enable`: Enable the testing API for the language server. When
  folder is Deno enabled, tests will be available in the Test Explorer view.
  Defaults to `true`.

- `deno.unstable`: Controls if code will be type checked with Deno's unstable
  APIs. This is the equivalent to using `--unstable` on the command line.
  _boolean, default `false`_
