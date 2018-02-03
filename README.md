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
`$ npm run dist` followed by `$ './dist/FEGS-Scoping-Tool Setup X.Y.Z.exe'`, where `X`, `Y`, and `Z` represent current version-numbers

## Contribute
Tests are defined in `test/spec.js`. Run tests with `$ npm run test`.
