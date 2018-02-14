# FEGS Scoping Tool
## SYNOPSIS
Stakeholders describe utilization of Final Ecosystem Goods and Services(FEGS). The provided lists of beneficiaries and attributes are based on definitions from the Final Ecosystem Goods and Services-Classification-System(FEGS-CS).

## Electron App Compilation from Source
**Note**: Running this requires [Git](https://git-scm.com/) and [Node.js](https://nodejs.org/en/) (which includes npm) on your system.
### Clone the repository
`$ git clone -b fegs-electron https://github.com/USEPA/fegs-dashboard`
### Go into the repository
`$ cd fegs-dashboard`
### Install dependencies
`$ npm install`
### Run the app
`$ npm run dist` followed by `$ './dist/FEGS-Scoping-Tool Setup X.Y.Z.exe'`, where `X`, `Y`, and `Z` represent current version-numbers. `X` is the major version, `Y` is the minor version, and `Z` is the patch.

## Contribute
Tests are defined in `test/spec.js`. Run tests with `$ npm run test`.

### A Workflow for Development
#### Instruct bash to run a test whose descriptive text matches `PATTERN`.

This command is explained by parts.
The explanation by parts allows parts to be understood, used, removed, or changed as needed.

```bash
npm test -- --"grep=PATTERN" &>logfile &
```

Explanation:
- `npm test` runs the script `test` defined in `package.json`. The standardized notation for running an arbitrary script named `SCRIPT` is `npm run SCRIPT`.
- `-- --"grep=PATTERN"` runs tests whose descriptive text matches `PATTERN`.
- `&>logfile` redirects `stderr` and `stdout` to the file named `logfile`.
- `&` on the end of a command runs the command in the background.

#### Build and run the application.

The following commands joined into one by `&&` are explained by atomic parts.
The explanation by parts allows parts to be understood, used, removed, or changed independently as needed.

```bash
npm run dist &>logfile
&& dist/FEGS-Scoping-Tool\ Setup\ VERSION.exe &>>logfile &
```

Explanation:
- `rm -rf dist/*` removes everything in the directory named `dist`.
- `&>logfile` writes `stdout` and `stderr` to the file `./logfile`. This replaces `./logfile` if extant.
- `&&` joins two commands into one command run serially.
- `npm run dist` runs the npm-script named `dist` in `package.json`.
- `&>>logfile` appends `stdout` and `stderr` to the file `./logfile`.
- `dist/FEGS-Scoping-Tool\ Setup\ VERSION.exe` runs the executable identified by replacing the text `VERSION` with the version specified by the property `version` in `package.json`.
