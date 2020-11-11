import Util from './Util.js'

// NOTE: Adding or deleting object properties requires shinanigans so Vue can detect changes

export default class TheProjectStore {
  constructor({ addProp=null, delProp=null }) {
    this._addProp = addProp || ((obj, key, val) => obj[key] = val) // custom function to add property to object (Vue needs special help)
    this._delProp = delProp || ((obj, key) => delete obj[key]) // custom function to delete property from object

    this.data = {} // DO NOT WRITE DIRECTLY (use a setter), but do read directly
    this.autoCompute = true // compute results whenever an influencing value changes
    this.modified = false // whether data has changed since last saved
  }
  new() {
    this.data = this._template()
    this.modified = false
    this._computeAll()
  }
  load(data) {
    // ...validate, check version, etc
    const version = Util.deepGet(data, ['meta', 'version'])
    if (version !== '2.0.0') {
      throw Error(`Unsupported file version "${version}"`)
    }

    this.data = Util.cloneObj(data)
    this.modified = false
    this._computeAll()
  }
  compute() { // only need to call this method if you set autoCompute to false
    this._computeAll()
  }

  onModified(func) { // call func when this.modified changes false -> true
    this._onModifiedCallback = func
  }

  getSaveable() {
    return Util.cloneObj(this.data, ['computed']) // remove computed values  
  }
  getCriterionArray() {
    return this._getSectionArray(this.data.criterionSection, 'criteria')
  }
  getStakeholderArray() {
    return this._getSectionArray(this.data.stakeholderSection, 'stakeholders')
  }
  getBeneficiaryArray() {
    return this._getSectionArray(this.data.beneficiarySection, 'beneficiaries')
  }
  getAttributeArray() {
    return this._getSectionArray(this.data.attributeSection, 'attributes')
  }

  setProjectName(name) { 
    this.data.meta.name = name
    this._modified()
  }
  setProjectDescription(desc) { 
    this.data.meta.description = desc
    this._modified()
  }
  setCriterionNotes(notes) {
    this.data.criterionSection.notes = notes
    this._modified()
  }
  setStakeholderNotes(notes) {
    this.data.stakeholderSection.notes = notes
    this._modified()
  }
  setBeneficiaryNotes(notes) {
    this.data.beneficiarySection.notes = notes
    this._modified()
  }
  setAttributeNotes(notes) {
    this.data.attributeSection.notes = notes
    this._modified()
  }
  setCriterionResult(criterionName, val) {
    if (!(criterionName in this.data.criterionSection.criteria)) {
      throw new Error(`Cannot find criterion "${criterionName}".`) // programmer error
    } else {
      this.data.criterionSection.criteria[criterionName].result = val
      this._modified()
      if (this.autoCompute) this._computeCriterionSection()
    }
  }
  setStakeholderScore(stakeholderName, criterionName, val) {
    if (!(stakeholderName in this.data.stakeholderSection.stakeholders)) {
      throw new Error(`Cannot find stakeholder "${stakeholderName}".`) // programmer error
    } else if (!(criterionName in this.data.criterionSection.criteria)) {
      throw new Error(`Cannot find criterion "${criterionName}".`) // programmer error
    } else {
      this.data.stakeholderSection.stakeholders[stakeholderName].scores[criterionName] = val
      this._modified()
      if (this.autoCompute) this._computeStakeholderSection()
    }
  }
  setBeneficiaryScore(beneficiaryName, stakeholderName, val) {
    if (!(beneficiaryName in this.data.beneficiarySection.beneficiaries)) {
      throw new Error(`Cannot find beneficiary "${beneficiaryName}".`) // programmer error
    } else if (!(stakeholderName in this.data.stakeholderSection.stakeholders)) {
      throw new Error(`Cannot find stakeholder "${stakeholderName}".`) // programmer error
    } else {
      this.data.beneficiarySection.beneficiaries[beneficiaryName].scores[stakeholderName] = val
      this._modified()
      if (this.autoCompute) this._computeBeneficiarySection()
    }
  }
  setAttributeScore(attributeName, beneficiaryName, val) {
    if (!(attributeName in this.data.attributeSection.attributes)) {
      throw new Error(`Cannot find attribute "${attributeName}".`) // programmer error
    } else if (!(beneficiaryName in this.data.beneficiarySection.beneficiaries)) {
      throw new Error(`Cannot find beneficiary "${beneficiaryName}".`) // programmer error
    } else {
      this.data.attributeSection.attributes[attributeName].scores[beneficiaryName] = val
      this._modified()
      if (this.autoCompute) this._computeAttributeSection()
    }
  }
  setStakeholderName(oldName, newName) {
    if (!(oldName in this.data.stakeholderSection.stakeholders)) {
      throw new Error(`Cannot find stakeholder "${oldName}".`) // programmer error
    } else if (newName in this.data.stakeholderSection.stakeholders) {
      throw new Error(`Stakeholder "${newName}" already exists.`) // programmer error
    } else {
      this._renameKey(this.data.stakeholderSection.stakeholders, oldName, newName)
      Util.replace(this.data.stakeholderSection.order, oldName, newName)
      Object.values(this.data.beneficiarySection.beneficiaries).forEach(beneficiary => {
        this._renameKey(beneficiary.scores, oldName, newName)
      })
      this._modified()
      if (this.autoCompute) this._computeStakeholderSection()
    }
  }
  setStakeholderColor(stakeholderName, color) {
    if (!(stakeholderName in this.data.stakeholderSection.stakeholders)) {
      throw new Error(`Cannot find stakeholder "${stakeholderName}".`) // programmer error
    } else {
      this.data.stakeholderSection.stakeholders[stakeholderName].color.primary = color
      this._modified()
      if (this.autoCompute) this._computeStakeholderColors()
    }
  }

  addStakeholder(stakeholderName, color=null) {
    if (stakeholderName in this.data.stakeholderSection.stakeholders) {
      throw new Error(`Stakeholder "${stakeholderName}" already exists.`) // programmer error
    } else {
      // define stakeholder
      const stakeholder = {
        color: {
          primary: color,
        },
        scores: {},
      }
      
      // add scores to stakeholder
      Object.keys(this.data.criterionSection.criteria).forEach(criterionName => {
        stakeholder.scores[criterionName] = null
      })

      // add stakeholder to stakeholders
      this._addProp(this.data.stakeholderSection.stakeholders, stakeholderName, stakeholder)
      this.data.stakeholderSection.order.push(stakeholderName)

      // add stakeholder to beneficiary scores
      Object.values(this.data.beneficiarySection.beneficiaries).forEach(beneficiary => {
        this._addProp(beneficiary.scores, stakeholderName, null)
      })

      this._modified()
      if (this.autoCompute) this._computeStakeholderSection()
    }
  }

  delStakeholder(stakeholderName) {
    if (!(stakeholderName in this.data.stakeholderSection.stakeholders)) {
      throw new Error(`Cannot find stakeholder "${stakeholderName}".`) // programmer error
    } else {
      // delete stakeholder from stakeholders
      this._delProp(this.data.stakeholderSection.stakeholders, stakeholderName)
      Util.remove(this.data.stakeholderSection.order, stakeholderName)

      // delete stakeholder from beneficiary scores
      Object.values(this.data.beneficiarySection.beneficiaries).forEach(beneficiary => {
        this._delProp(beneficiary.scores, stakeholderName)
      })

      this._modified()
      if (this.autoCompute) this._computeStakeholderSection()
    }
  }
  
  // the following methods are private (please don't use them externally)
  _modified() {
    if (!this.modified) this._onModifiedCallback()
    this.modified = true
  }
  _getSectionArray(section, key) {
    const ret = []
    section.order.forEach(name => {
      const item = section[key][name]
      ret.push({
        name: name,
        ...item,
        ...((item.categoryName) ? {
          category: { ...section.categories[item.categoryName] },
        } : {}),
      })
    })
    return ret
  }
  _setComputed(obj, key, val) {
    if (!('computed' in obj)) {
      this._addProp(obj, 'computed', { [key]: val })
    } else if (!(key in obj.computed)) {
      this._addProp(obj.computed, key, val)
    } else {
      obj.computed[key] = val
    }
  }
  _computeAll() {
    this._computeAllCategories()
    this._computeCriterionSection()
  }
  _computeAllCategories() {
    this._computeCategories(this.data.beneficiarySection.categories, this.data.beneficiarySection.beneficiaries)
    this._computeCategories(this.data.attributeSection.categories, this.data.attributeSection.attributes)
  }
  _computeCriterionSection() { // and dependent sections
    this._computeStakeholderSection()
  }
  _computeStakeholderSection() { // and dependent sections
    this._computeStakeholderColors()
    this._computeStakeholderResults()
    this._computeBeneficiarySection()
  }
  _computeBeneficiarySection() { // and dependent sections
    this._computeBeneficiaryResults()
    this._computeAttributeSection()
  }
  _computeAttributeSection() {
    this._computeAttributeResults()
  }
  _computeStakeholderColors() {
    const remain = new Set(this.data.stakeholderSection.colors)
    Object.values(this.data.stakeholderSection.stakeholders).forEach(stakeholder => {
      remain.delete(stakeholder.color.primary)
    })
    this._setComputed(this.data.stakeholderSection, 'colorsRemain', [...remain])
  }
  _computeStakeholderResults() {
    this._computeResults(this.data.criterionSection.criteria, this.data.stakeholderSection.stakeholders, { doScoresWeighted: true })
  }
  _computeBeneficiaryResults() {
    this._computeResults(this.data.stakeholderSection.stakeholders, this.data.beneficiarySection.beneficiaries, { doScoresWeighted: true })
  }
  _computeAttributeResults() {
    this._computeResults(this.data.beneficiarySection.beneficiaries, this.data.attributeSection.attributes, { doCategoriesWeighted: true })
  }
  _computeResults(metrics, alternatives, { doCategoriesWeighted=false, doScoresWeighted=false }={}) {
    const cleanMetrics = {} // map: metric name -> non-null weight
    let weightSum = 0
    Object.entries(metrics).forEach(([metricName, val]) => {
      const weight = Util.deepGet(val, ['result']) || Util.deepGet(val, ['computed', 'result']) || 0
      weightSum += weight
      cleanMetrics[metricName] = weight
    })

    Object.values(alternatives).forEach(alternative => {
      const categoriesWeighted = {}
      const scoresWeighted = {}
      let hasScore = false
      let sum = 0
      Object.entries(alternative.scores).forEach(([metric, val]) => {
        const categoryName = metrics[metric].categoryName // may be undefined
        if (doCategoriesWeighted && !(categoryName in categoriesWeighted)) {
          categoriesWeighted[categoryName] = null
        }
        if (doScoresWeighted) {
          scoresWeighted[metric] = null
        }
        if (Util.isNum(val)) {
          hasScore = true
          const scoreWeighted = cleanMetrics[metric]*val
          sum += scoreWeighted
          if (doCategoriesWeighted) {
            if (categoriesWeighted[categoryName] !== null) {
              categoriesWeighted[categoryName] += scoreWeighted
            } else {
              categoriesWeighted[categoryName] = scoreWeighted
            }
          }
          if (doScoresWeighted) {
            scoresWeighted[metric] = scoreWeighted
          }
        }
      })
      const result = sum/weightSum // normalize
      const cleanResult = (hasScore && Util.isNum(result)) ? result : null
      this._setComputed(alternative, 'result', cleanResult)
      if (doCategoriesWeighted) {
        this._setComputed(alternative, 'categoriesWeighted', categoriesWeighted)
      }
      if (doScoresWeighted) {
        this._setComputed(alternative, 'scoresWeighted', scoresWeighted)
      }
    })
  }
  _computeCategories(categories, alternatives) {
    const counts = {}
    let even = true // alternate with each category
    const visitedCategories = new Set()
    Object.values(alternatives).forEach(alternative => {
      const categoryName = alternative.categoryName
      if (categoryName in counts) {
        counts[categoryName]++
      } else {
        counts[categoryName] = 1
        even = !even // this does assume alternatives are in order
      }
      this._setComputed(alternative, 'evenCategory', even)
      this._setComputed(alternative, 'firstOfCategory', !visitedCategories.has(categoryName))
      visitedCategories.add(categoryName)
    })
    Object.entries(categories).forEach(([categoryName, category]) => {
      this._setComputed(category, 'members', counts[categoryName] || 0)
    })
  }
  _renameKey(obj, oldKey, newKey) {
    const oldVal = obj[oldKey]
    const newVal = (oldVal && typeof oldVal === 'object') ? Util.cloneObj(oldVal) : oldVal
    this._delProp(obj, oldKey)
    this._addProp(obj, newKey, newVal)
  }
  _template() {
    const data = {
      meta: {
        version: '2.0.0', // lowest compatible app version
        name: 'New Project',
        description: '',
      },
      criterionSection: {
        notes: 'section notes',
        order: [],
        criteria: {
          // 'criteria name': {
          //   shortName: 'short name',
          //   def: 'criterion definition',
          //   tip: 'criterion tooltip',
          //   color: {
          //     primary: '#777',
          //   }
          // },

          'Magnitude & Probability of Impact': {
            shortName: 'Impact',
            tip: 'If changes are made in this decision context what is the likelihood that this stakeholder group will be impacted? What is the potential magnitude of that impact?',
            color: {
              primary: '#c0504d',
            },
          },
          'Level of Influence': {
            shortName: 'Influence',
            tip: 'Does this stakeholder group have any formal or informal influence over the decision making process?',
            color: {
              primary: '#9bbb59',
            },
          },
          'Level of Interest': {
            shortName: 'Interest',
            tip: 'What is this stakeholder group\'s level of interest in this decision/action?',
            color: {
              primary: '#8064a2',
            },
          },
          'Urgency & Temporal Immediacy': {
            shortName: 'Urgency',
            tip: 'Does this stakeholder group want an immediate decision/action on this issue?',
            color: {
              primary: '#DDC436',
            },
          },
          'Proximity': {
            tip: 'How frequently does this stakeholder group come into contact with the area subject to this decision?',
            color: {
              primary: '#4bacc6',
            },
          },
          'Economic Interest': {
            shortName: 'Economic',
            tip: 'Does this stakeholder group have an economic interest in the outcome of this decision?',
            color: {
              primary: '#2F7455',
            },
          },
          'Rights': {
            tip: 'Does this stakeholder group have any 1) legal right to be involved in this decision making process, 2) property rights associated with the land that will be impacted by the decision, or 3) consumer/user rights associated with the services that will be impacted by the decision?',
            color: {
              primary: '#f79646',
            },
          },
          'Fairness': {
            tip: 'If this stakeholder group is not considered in decision-making, would the resulting decision be seen as unfair?',
            color: {
              primary: '#863758',
            },
          },
          'Underrepresented & Underserved Representation': {
            shortName: 'Underrepresented',
            tip: 'Underrepresented & Underserved representation: Does this stakeholder group represent underserved or underrepresented groups?',
            color: {
              primary: '#2c4d75',
            },
          },
        },
      },
      stakeholderSection: {
        notes: 'section notes',
        colors: [ // available colors for stakeholders
          '#4cb159',
          '#1287c5',
          '#f08940',
          '#932fb2',
          '#5de2e2',
          '#e24bda',
          '#8ae538',
          '#fabebe',
          '#008080',
          '#e12b57',
          '#e6beff',
          '#aa6e28',
          '#ffdd88',
          '#883333',
          '#88ff88',
          '#888833',
          '#fade2a',
          '#333388',
          '#88ddff',
          '#888888',
          '#333333',
          '#3c5b40',
          '#15435c',
          '#a75a23',
          '#4a2655',
          '#37a2a2',
          '#973092',
          '#599027',
          '#e17070',
          '#084545',
          '#81253b',
          '#bb69ee',
          '#4d381f',
          '#e9b638',
          '#352020',
          '#38e938',
          '#353520',
          '#a79317',
          '#202035',
          '#38b6e9',
          '#555555',
          '#000000',
        ],
        order: [],
        stakeholders: {
          // 'stakeholder name': {
          //   color: {
          //     primary: '#777',
          //   },
          //   scores: {
          //     'criterion name': 0.1,
          //     ...etc
          //   },
          //   computed: {
          //     result: 0.1,
          //   },
          // },
          // ...etc
        },
        // computed: {
        //   colorsRemain: []
        // }
      },
      beneficiarySection: {
        notes: 'section notes',
        order: [],
        categories: {
          // 'category name': {
          //   shortName: 'shorter name',
          //   def: 'category definition',
          //   color: {
          //     primary: '#777',
          //     lighter: '#CCC',
          //     lightest: '#EEE',
          //   },
          // },

          'Agricultural': {
            color: {
              primary: 'rgb(255,133,82)',
              lighter: 'rgb(245,208,168)',
              lightest: 'rgb(250,231,211)',
            },
          },
          'Commercial / Industrial': {
            color: {
              primary: 'rgb(219,58,52)',
              lighter: 'rgb(242,145,141)',
              lightest: 'rgb(248,200,198)',
            },
          },
          'Governmental / Municipal / Residential': {
            color: {
              primary: 'rgb(180,111,236)',
              lighter: 'rgb(248,194,248)',
              lightest: 'rgb(251,224,251)',
            },
          },
          'Transportation': {
            color: {
              primary: 'rgb(102,0,7)',
              lighter: 'rgb(184,122,127)',
              lightest: 'rgb(219,188,191)',
            },
          },
          'Subsistence': {
            color: {
              primary: 'rgb(115,194,190)',
              lighter: 'rgb(176,235,232)',
              lightest: 'rgb(215,245,243)',
            },
          },
          'Recreational': {
            color: {
              primary: 'rgb(144,39,83)',
              lighter: 'rgb(234,153,187)',
              lightest: 'rgb(224,204,221)',
            },
          },
          'Inspirational': {
            color: {
              primary: 'rgb(62,142,97)',
              lighter: 'rgb(153,203,175)',
              lightest: 'rgb(204,229,215)',
            },
          },
          'Learning': {
            color: {
              primary: 'rgb(233,215,88)',
              lighter: 'rgb(243,243,151)',
              lightest: 'rgb(249,249,203)',
            },
          },
          'Non-Use': {
            color: {
              primary: 'rgb(27,64,121)',
              lighter: 'rgb(145,169,207)',
              lightest: 'rgb(200,212,231)',
            },
          },
        },
        beneficiaries: {
          // 'beneficiary name': {
          //   shortName: 'shorter name',
          //   categoryName: 'category name',
          //   def: 'beneficiary definition',
          //   scores: {
          //     'stakeholder name': 0.1,
          //     ...etc
          //   },
          //   computed: {
          //     result: 0.1,
          //   },
          // },

          // Agricultural
          'Livestock Grazers': {
            categoryName: 'Agricultural',
            def: 'Uses the environment to graze livestock',
          },
          'Agricultural Processors': {
            categoryName: 'Agricultural',
            def: 'Cleans edible products',
          },
          'Aquaculturalists': {
            categoryName: 'Agricultural',
            def: 'Farms aquatic fauna (e.g., fish, shrimp, oysters)',
          },
          'Farmers': {
            categoryName: 'Agricultural',
            def: 'Farms terrestrial or aquatic flora (e.g., crops, orchards)',
          },
          'Foresters': {
            categoryName: 'Agricultural',
            def: 'Plants and raises trees (i.e., silviculture)',
          },

          // Commercial / Industrial
          'Food Extractors': {
            categoryName: 'Commercial / Industrial',
            def: 'Uses the natural abundance of edible organisms (e.g., hunting, trapping, or fishing for livelihood, job, commercial, or artisinal purposes)',
          },
          'Timber / Fiber / Ornamental Extractors': {
            categoryName: 'Commercial / Industrial',
            def: 'Extracts or harvests timber, fiber, wood, or ornamental extraction or harvest for commercial or business purposes (e.g., logging, shell collection)',
          },
          'Industrial Processors': {
            categoryName: 'Commercial / Industrial',
            def: 'Uses natural resources in industrial processing such as manufacturing (e.g., textile or steel industries), mills, or oil and gas extraction and processing)',
          },
          'Energy Generators': {
            categoryName: 'Commercial / Industrial',
            def: 'Uses the environment for energy production or placement of power generation structures includes power plants (electric and nuclear), dams, turbines (wind, water, or wave), solar',
          },
          'Pharmaceutical / Food Supplement Suppliers': {
            categoryName: 'Commercial / Industrial',
            def: 'Collects organisms from nature that are used for pharmaceuticals, medicines, food supplements, or vitamins for commerical sale',
          },
          'Fur / Hide Trappers / Hunters': {
            categoryName: 'Commercial / Industrial',
            def: 'Hunts or traps fauna for fur or hides for commerical sale',
          },
          'Commercial Property Owners': {
            categoryName: 'Commercial / Industrial',
            def: 'Owners of private land for commercial or industrial purposes',
          },
          'Private Drinking Water Plant Operators': {
            categoryName: 'Commercial / Industrial',
            def: 'Provides water for private purposes',
          },

          // Governmental / Municipal / Residential
          'Municipal Drinking Water Plant Operators': {
            categoryName: 'Governmental / Municipal / Residential',
            def: 'Provides water for the Community',
          },
          'Public Energy Generators': {
            categoryName: 'Governmental / Municipal / Residential',
            def: 'Uses the environment for energy production or placement of power generation structures for the community, includes power plants (electric and nuclear), dams, turbines (wind, water, or wave), solar panels, and geothermal systems',
          },
          'Residential Property Owners': {
            categoryName: 'Governmental / Municipal / Residential',
            def: 'Homeowners of private land',
          },
          'Military / Coast Guard': {
            categoryName: 'Governmental / Municipal / Residential',
            def: 'Uses the environment for placement of infrastucture or training activities',
          },

          // Transportation
          'Transporters of Goods': {
            categoryName: 'Transportation',
            def: 'Uses the environment to transport goods (e.g., shipping, cargo, commercial navigation, barges, freight, planes, trains)',
          },
          'Transporters of People': {
            categoryName: 'Transportation',
            def: 'Uses the environment to transport people (e.g., cruises, ferries, airplanes, airports, trains, harbors)',
          },

          // Subsistence
          'Water Subsisters': {
            categoryName: 'Subsistence',
            def: 'Relies on natural sources for water including drinking water and tribal or traditional uses (may use wells, cisterns, rain gardens, rain barrels, etc.)',
          },
          'Food and Medicinal Subsisters': {
            categoryName: 'Subsistence',
            def: 'Uses natural sources of edible flora, fauna, and fungi as a major source of food; includes hunting, fishing, and gathering as well as other tribal or traditional uses',
          },
          'Timber / Fiber / Ornamental Subsisters': {
            categoryName: 'Subsistence',
            def: 'Relies on timber, fiber, or fauna for survival, including tribal or cultural traditions (e.g., firewood)',
          },
          'Building Material Subsisters': {
            categoryName: 'Subsistence',
            def: 'Relies on natural materials for infrastructure and housing',
          },

          // Recreational
          'Experiencers / Viewers': {
            categoryName: 'Recreational',
            def: 'Views and experiences the environment as an activity (e.g., bird, wildlife, or fauna watching; nature appreciation; hiking, biking, camping, climbing, outings, sunbathing, sightseeing, beach combing)',
          },
          'Food Pickers / Gatherers': {
            categoryName: 'Recreational',
            def: 'Recreationally collects or gathers edible flora, fungi, or fauna (does not include hunting or trapping) (e.g., berry picking, mushroom gathering; clam digging)',
          },
          'Hunters': {
            categoryName: 'Recreational',
            def: 'Hunts for recreation or sport',
          },
          'Anglers': {
            categoryName: 'Recreational',
            def: 'Fishes for recreation or sport',
          },
          'Waders / Swimmers / Divers': {
            categoryName: 'Recreational',
            def: 'Recreates in or under the water (e.g., snorkeling, SCUBA, swimming, beachgoing, wading, diving, bathing)',
          },
          'Boaters': {
            categoryName: 'Recreational',
            def: 'Recreates in motorized or unmotorized watercraft (e.g., sailboats, ski boats, jet skis, kayaks, surfboards)',
          },

          // Inspirational
          'Spiritual and Ceremonial Participants': {
            categoryName: 'Inspirational',
            def: 'Uses the environment for spiritual, ceremonial, or celebratory puposes (e.g., harvest festivals, tribal observances, traditional ceremonies, religious rites)',
          },
          'Artists': {
            categoryName: 'Inspirational',
            def: 'Uses the environment to produce art, includes writers, painters, sculptors, cinematographers, and recording artists',
          },

          // Learning
          'Students and Educators': {
            categoryName: 'Learning',
            def: 'Includes all educational uses, interests, or opportunities including field trips and outdoor laboratories',
          },
          'Researchers': {
            categoryName: 'Learning',
            def: 'Includes opportunities or interest for significant scientific research and improving scientific knowledge',
          },

          // Non-Use
          'People Who Care': {
            categoryName: 'Non-Use',
            def: 'Believes it is important to preserve the environment for moral or ethical reasons, for fear of its loss, or to allow their future selves or future generations to visit or rely upon it',
          },
        },
      },
      attributeSection: {
        notes: 'section notes',
        order: [],
        categories: {
          // 'category name': {
          //   shortName: 'shorter name',
          //   def: 'category definition',
          //   color: {
          //     primary: '#777',
          //   },
          // },

          'Atmosphere': {
            color: {
              primary: 'rgb(34,181,195)',
            },
          },
          'Soil': {
            color: {
              primary: 'rgb(129,93,86)',
            },
          },
          'Water': {
            color: {
              primary: 'rgb(42,117,169)',
            },
          },
          'Fauna': {
            color: {
              primary: 'rgb(201,52,53)',
            },
          },
          'Flora': {
            color: {
              primary: 'rgb(54,150,54)',
            },
          },
          'Fungi': {
            color: {
              primary: 'rgb(147,114,178)',
            },
          },
          'Other Natural Components': {
            color: {
              primary: 'rgb(243,128,26)',
            },
          },
          'Composite (and Extreme Events)': {
            color: {
              primary: 'rgb(219,127,191)',
            },
          },
        },
        attributes: {
          // 'attribute name': {
          //   shortName: 'shorter name',
          //   categoryName: 'category name',
          //   def: 'attribute definition',
          //   scores: {
          //     'beneficiary name': 0.1,
          //     ...etc
          //   },
          //   computed: {
          //     result: 0.1,
          //   },
          // },
          
          // Atmosphere
          'Air Quality': {
            categoryName: 'Atmosphere',
            def: 'The degree to which air is clean, clear, and pollution-free',
          },
          'Wind Strength / Speed': {
            categoryName: 'Atmosphere',
            def: 'The speed and force of the wind',
          },
          'Precipitation': {
            categoryName: 'Atmosphere',
            def: 'Weather in which something, including rain, snow, sleet, and/or hail, is falling from the sky',
          },
          'Sunlight': {
            categoryName: 'Atmosphere',
            def: 'Light from the sun ',
          },
          'Temperature': {
            categoryName: 'Atmosphere',
            def: 'A measure of the warmth or coldness of the weather or climate',
          },

          // Soil
          'Soil Quality': {
            categoryName: 'Soil',
            def: 'The suitability of soil for use based on physical, chemical, and/or biological characteristics',
          },
          'Soil Quantity': {
            categoryName: 'Soil',
            def: 'The amount of soil present, could be measured in terms of volume, depth, and/or extent',
          },
          'Substrate Quality': {
            categoryName: 'Soil',
            def: 'The suitability of substrate for use based on physical, chemical, and/or biological characteristics',
          },
          'Substrate Quantity': {
            categoryName: 'Soil',
            def: 'The amount of substrate present, could be measured in terms of volume, depth, and/or extent',
          },

          // Water
          'Water Quality': {
            categoryName: 'Water',
            def: 'The suitability of water for use based on physical, chemical, and/or biological characteristics',
          },
          'Water Quantity': {
            categoryName: 'Water',
            def: 'The amount of water present, could be measured in terms of volume, depth, total yield, and/or peak flow',
          },
          'Water Movement': {
            categoryName: 'Water',
            def: 'The amount of water flowing per unit of time, includes aspects such as surface water movement through watersheds, wave action, etc',
          },

          // Fauna
          'Fauna Community': {
            categoryName: 'Fauna',
            def: 'The interacting animal life present in the area',
          },
          'Edible Fauna': {
            categoryName: 'Fauna',
            def: 'Fauna fit to be eaten by humans',
          },
          'Medicinal Fauna': {
            categoryName: 'Fauna',
            def: 'Fauna that has healing properties as is or after processesing',
          },
          'Keystone Fauna': {
            categoryName: 'Fauna',
            def: 'Fauna on which other species depend, its absence would significantly alter the ecosystem',
          },
          'Charismatic Fauna': {
            categoryName: 'Fauna',
            def: 'Fauna with symbolic value or widespread popular appeal',
          },
          'Rare Fauna': {
            categoryName: 'Fauna',
            def: 'Fauna that are uncommon or infrequently encountered',
          },
          'Pollinating Fauna': {
            categoryName: 'Fauna',
            def: 'Fauna that moves pollen from plant to plant',
          },
          'Pest Predator / Depredator Fauna': {
            categoryName: 'Fauna',
            def: 'Fauna that prey upon pest species',
          },
          'Commercially Important Fauna': {
            categoryName: 'Fauna',
            def: 'Fauna that has importance for commerce',
          },
          'Spiritually / Culturally Important Fauna': {
            categoryName: 'Fauna',
            def: 'Fauna that has importance for spiritual or cultural practices or beliefs',
          },

          // Flora
          'Flora Community': {
            categoryName: 'Flora',
            def: 'The interacting plant life present in the area',
          },
          'Edible Flora': {
            categoryName: 'Flora',
            def: 'Flora fit to be eaten by humans',
          },
          'Medicinal Flora': {
            categoryName: 'Flora',
            def: 'Flora that has healing properties as is or after processesing',
          },
          'Keystone Flora': {
            categoryName: 'Flora',
            def: 'Flora on which other species depend, its absence would significantly alter the ecosystem',
          },
          'Charismatic Flora': {
            categoryName: 'Flora',
            def: 'Flora with symbolic value or widespread popular appeal',
          },
          'Rare Flora': {
            categoryName: 'Flora',
            def: 'Flora that are uncommon or infrequently encountered',
          },
          'Commercially Important Flora': {
            categoryName: 'Flora',
            def: 'Flora that has importance for commerce',
          },
          'Spiritually / Culturally Important Flora': {
            categoryName: 'Flora',
            def: 'Flora that has importance for spiritual or cultural practices or beliefs',
          },

          // Fungi
          'Fungal Community': {
            categoryName: 'Fungi',
            def: 'The interacting fungal life present in the area',
          },
          'Edible Fungi': {
            categoryName: 'Fungi',
            def: 'Fungi fit to be eaten by humans',
          },
          'Medicinal Fungi': {
            categoryName: 'Fungi',
            def: 'Fungi that has healing properties as is or after processesing',
          },
          'Rare Fungi': {
            categoryName: 'Fungi',
            def: 'Fungi that are uncommon or infrequently encountered',
          },
          'Commercially Important Fungi': {
            categoryName: 'Fungi',
            def: 'Fungi that has importance for commerce',
          },
          'Spiritually / Culturally Important Fungi': {
            categoryName: 'Fungi',
            def: 'Fungi that has importance for spiritual or cultural practices or beliefs',
          },

          // Other Natural Components
          'Fuel Quality': {
            categoryName: 'Other Natural Components',
            def: 'The suitability of material, based on physical, chemical, and/or biological characteristics, to produce heat or power through burning or other methods ',
          },
          'Fuel Quantity': {
            categoryName: 'Other Natural Components',
            def: 'The amount of fuel present, could be measured in terms of volume, mass, and/or extent',
          },
          'Fiber Material Quality': {
            categoryName: 'Other Natural Components',
            def: 'The amount of fiber material present, could be measured in terms of volume, mass, and/or extent',
          },
          'Fiber Material Quantity': {
            categoryName: 'Other Natural Components',
            def: 'The suitability of material, based on physical, chemical, and/or biological characteristics, to be used in production of textiles',
          },
          'Mineral / Chemical Quality': {
            categoryName: 'Other Natural Components',
            def: 'The suitability of material for use based on physical, chemical, and/or biological characteristics',
          },
          'Mineral / Chemical Quantity': {
            categoryName: 'Other Natural Components',
            def: 'The amount of material present, could be measured in terms of volume, mass, and/or extent',
          },
          'Presence of Other Natural Materials for Artistic Use or Consumption (e.g. Shells, Acorns, Honey)': {
            shortName: 'Other Natural Materials',
            categoryName: 'Other Natural Components',
            def: 'The presence and/or extent of materials suitable for artistic use or consumption',
          },

          // Composite (and Extreme Events)
          'Sounds': {
            categoryName: 'Composite (and Extreme Events)',
            def: 'The sounds or combination of sounds arising from the area',
          },
          'Scents': {
            categoryName: 'Composite (and Extreme Events)',
            def: 'The scents or combination of scents arising from the area',
          },
          'Viewscapes': {
            categoryName: 'Composite (and Extreme Events)',
            def: 'The views and vistas available in the area',
          },
          'Phenomena (e.g. Sunsets, Northern Lights, etc)': {
            categoryName: 'Composite (and Extreme Events)',
            shortName: 'Phenomena',
            def: 'Natural phenomena arising from a combination of environmental attributes',
          },
          'Ecological Condition': {
            categoryName: 'Composite (and Extreme Events)',
            def: 'The overall quality of the ecological system based on physical, chemical, and biological characteristics',
          },
          'Open Space': {
            categoryName: 'Composite (and Extreme Events)',
            def: 'Land that is undeveloped, but may be landscaped or otherwise in use, and is available for use',
          },
          'Flooding': {
            categoryName: 'Composite (and Extreme Events)',
            def: 'The likelihood the area will experience flooding and the likely severity of the flooding',
          },
          'Wildfire': {
            categoryName: 'Composite (and Extreme Events)',
            def: 'The likelihood the area will experience wildfire and the likely severity of the fire',
          },
          'Extreme Weather Events': {
            categoryName: 'Composite (and Extreme Events)',
            def: 'The likelihood the area will experience extreme weather events and the likely severity of the events',
          },
          'Earthquakes': {
            categoryName: 'Composite (and Extreme Events)',
            def: 'The likelihood the area will experience earthquakes and the likely severity of the earthquakes',
          },
        },
      },
    }

    // add criterion order, add results to criteria
    Object.entries(data.criterionSection.criteria).forEach(([criterionName, criterion]) => {
      data.criterionSection.order.push(criterionName)
      criterion.result = null
    })

    // add beneficiary order, add scores to beneficiaries
    Object.entries(data.beneficiarySection.beneficiaries).forEach(([beneficiaryName, beneficiary]) => {
      data.beneficiarySection.order.push(beneficiaryName)
      beneficiary.scores = {} // populated when stakeholder added
    })

    // add attribute order, add scores to attributes
    Object.entries(data.attributeSection.attributes).forEach(([attributeName, attribute]) => {
      data.attributeSection.order.push(attributeName)
      attribute.scores = {}
      Object.keys(data.beneficiarySection.beneficiaries).forEach(beneficiary => {
        attribute.scores[beneficiary] = null
      })
    })

    return data
  }
}

// DESIGN NOTES
// constraints:
//    data to/from json easily (object? array?)
//    data looked up easily (object? map?)
//    data ordered at top level (array? map?)
//    data externally accessed easily (object? array? getters?)
// solution:
//    data stored as objects
//    data order specified by array with object keys