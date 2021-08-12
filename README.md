# kibiutils
Utility library for Siren Investigate. This library is to keep functions which are shared between frontend and server side.

Sources are in `src`;
before submitting a PR, run `npm run babel` to create the distribution files in `lib`, which must be included in the commit.

## Development

To debug unit tests from VSCode use the following mocha launcher

```
{
    "version": "0.2.0",
    "configurations": [
      {
        "type": "node",
        "request": "launch",
        "name": "Mocha Single Test",
        "runtimeVersion": "14.17.0",
        "program": "${workspaceFolder}/node_modules/.bin/_mocha",
        "stopOnEntry": false,
        "args": [
          "--compilers",  "js:babel-core/register,js:babel-polyfill",
          "${file}"
        ],
        "console": "integratedTerminal",
        "sourceMaps": true,
        "internalConsoleOptions": "neverOpen"
    }
  ]
}
```