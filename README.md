# FEGS Scoping Tool
The FEGS Scoping Tool informs the early stage of decision making, when decision makers are aware of a decision that needs to be made, but before any actions are taken. The tool helps users identify and prioritize stakeholders, beneficiaries, and environmental attributes through a structured, transparent, and repeatable process. These relevant and meaningful environmental attributes can then be used to evaluate decision alternatives.'

## Version 1.8 Goals
* Separation of concerns: data, view, components, etc.
* Clean data management
* Consistent language
* Responsive design using Vue.js (stretch goal)

## Development
### Prerequisites
* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/en/) (includes npm)

### Setup
Clone

```
$ git clone https://github.com/USEPA/fegs-dashboard
$ cd fegs-dashboard
```

Install dependencies

```
$ npm install
```

### Usage
Run the app in development mode

```
$ npm start
```

### Build
Build a distributable version of the app

```
$ npm run dist
```

The results of the build are the `dist/` directory named `FEGS Scoping Tool Setup x.y.x.exe`, where `x` is the major version number, `y` is the minor version number, and `z` is the patch version number.

## Data
### Terminology
**Alternative** ﹘ an option in consideration<br>
**Metric** ﹘ measurable property to compare alternatives<br>
**Weight** ﹘ value associated with a metric<br>
**Score** ﹘ value associated with an alternative on a specific metric<br>
**Result** ﹘ value associated with an alternative across all metrics (see [result calculation](#result-calculation))<br>

### Sources
| Name        | Criteria       | Stakeholders     | Beneficiaries        | Attributes            |
|-------------|----------------|------------------|----------------------|-----------------------|
| Alternative | criterion*     | [ user input ]   | beneficiary*         | attribute*            |
| Metric      | none           | criteria         | stakeholders         | beneficiaries         |
| Weights     | none           | criteria results | stakeholders results | beneficiaries results |
| Scores      | none           | [ user input ]   | [ user input ]       | [ user input ]        |
| Results     | [ user input ] | weights × scores | weights × scores     | weights × scores      |
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