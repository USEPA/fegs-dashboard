# FEGS Scoping Tool
"The FEGS Scoping Tool informs the early stage of decision making, when decision makers are aware of a decision that needs to be made, but before any actions are taken. The tool helps users identify and prioritize stakeholders, beneficiaries, and environmental attributes through a structured, transparent, and repeatable process. These relevant and meaningful environmental attributes can then be used to evaluate decision alternatives."

## Version 2.0 Goals
* Separation of concerns: data, view, components, etc.
* Cleaner data management
* Consistent language
* Responsive design using Vue.js

## Development
### Prerequisites
* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/en/) (includes npm)

### Setup
Clone

```
$ git clone -b 2.0 https://github.com/USEPA/fegs-dashboard
$ cd fegs-dashboard
```

Install dependencies

```
$ npm install
```

### Usage (Electron)
Run the Electron app in development mode

```
$ npm run electron:serve
```

### Usage (Website)
Run the web app in development mode

```
$ npm run serve
```

The website is useful for testing with browser plugins such as WAVE. It also might be useful as a demo.

### Build (Electron)
Build a distributable version of the Electron app

```
$ npm run electron:build
```

The results of the build are placed in the `dist_electron/` directory. There you will find the installer `FEGS Scoping Tool Setup x.y.x.exe` (where `x` is the major version number, `y` is the minor version number, and `z` is the patch version number). Also, the unpacked executable is in the `win-unpacked/` directory for running the app without installing.

### Build (Website)
Build a distributable version of the web app

```
$ npm run build
```

The results of the build are placed in the `dist/` directory. The contents are ready to be statically hosted on a web server, or viewed locally by opening `index.html` in your web browser.

## Design
### Technology
The FEGS Scoping Tool is an [Electron](https://www.electronjs.org/) app (and website). The user interface is written using the [Vue.js](https://vuejs.org/) library. To compile the `.vue` files we use the [Webpack](https://webpack.js.org/) bundler. Getting these technologies to work with Electron and especially [Electron Builder](https://www.electron.build/) proved very difficult, but thankfully the Vue CLI has a plugin for templating such a project called [Vue CLI Plugin Electron Builder](https://nklayman.github.io/vue-cli-plugin-electron-builder/). This plugin dictates the general structure of the project and solves many problems, including setting up hot module reloading. It also paves the way for creating both a desktop app and a web app from the same codebase.

### Directory Structure
The following are the most important files and directories.
* `dist/` - Webpack output (for website)
* `dist_electron/` - Webpack and Electron Builder output (for Electron)
* `node_modules/` - run `npm install` to populate
* `public/` - static content
  * `index.html` - file where Webpack injects `main.js`
* `src/` - content to be bundled
  * `assets/` - static content to be bundled
  * `build/` - resources for Electron Builder
  * `classes/` - ES6 classes used in the app (might separate by process later)
  * `components/` - all Vue component definitions
  * `AppElectron.vue` - root Vue component (for Electron)
  * `AppWebsite.vue` - root Vue component (for website)
  * `background.js` - **entry** for Electron main process
  * `main.js` - **entry** for app and Electron render process
  * `preload.js` - runs before `main.js` to wrap specific Node imports
  * `store.js` - data manager
* `package.json` - specify dependencies and scripts
* `README.md` - project description
* `vue.config.js` - specify settings and Electron Builder customizations

### Security
Although the Electron application does not require stringent security right now, it has been designed to follow recommended security standards. This means features such as loading remote content can be easily added in the future. To this end, all the operating system APIs (such as file I/O, window management, etc.) can only be called from `background.js`. All other processes have no access to Node imports and may only communicate with `background.js` through the Inter-Process Control (IPC) system, which is configured in `preload.js`.

## Data
### Terminology
**Alternative** ﹘ an option in consideration<br>
**Metric** ﹘ measurable property to compare alternatives<br>
**Weight** ﹘ value associated with a metric<br>
**Score** ﹘ value associated with an alternative on a specific metric<br>
**Result** ﹘ value associated with an alternative across all metrics (see [result calculation](#result-calculation))<br>

### Sources
|                 | **0. Criteria** | **1. Stakeholders** | **2. Beneficiaries** | **3. Attributes**   |
|-----------------|-----------------|---------------------|----------------------|---------------------|
| **Alternative** | criterion*      | [ user input ]      | beneficiary*         | attribute*          |
| **Metric**      | none            | criterion           | stakeholder          | beneficiary         |
| **Weights**     | none            | criterion results   | stakeholder results  | beneficiary results |
| **Scores**      | none            | [ user input ]      | [ user input ]       | [ user input ]      |
| **Results**     | [ user input ]  | weights × scores    | weights × scores     | weights × scores    |

\* Included from the FEGS Classification System (FEGS-CS)

Notice that results from each step are used as weights in the next.

### Result Calculation
Compute a weighted average for each alternative based on metric weights and scores for the alternative on each metric.
```
let
  r[a] = result of calculation for alternative a
  w[mi] = weight of metric number i
  w[total] = sum of all weights
  s[a][mi] = score of alternative a on metric number i
  N = number of metrics
compute
  r[a] = (w[m1]*s[a][m1] + w[m2]*s[a][m2] + ... + w[mN]*s[a][mN]) / w[total]
```
