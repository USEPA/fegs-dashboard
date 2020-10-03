const Util = require('../utils/Util.js')

module.exports = class DataStore {
  constructor(data=null) {
    this.data = null // DO NOT WRITE DIRECTLY (use a setter), but do read directly
    this.autoCompute = true // compute results whenever an influencing value changes
    if (data) {
      this.load(data)
    } else {
      this.new()
    }
  }
  new() {
    this.data = this._template() // provide default values
    this._registerAliases()
    if (this.autoCompute) this._computeAll()
  }
  load(data) {
    // ...validate, check version, etc
    this.data = Util.cloneObj(data)
    this._registerAliases()
    if (this.autoCompute) this._computeAll()
  }
  compute() { // only need to call this method if you set autoCompute to false
    this._computeAll()
  }

  getSaveable() {
    return Util.cloneObj(this.data, ['computed']) // remove computed values   
  }

  setProjectName(name) { 
    this.data.project.name = name
  }
  setProjectDescription(desc) { 
    this.data.project.description = desc
  }
  setCriterionNotes(notes) {
    this.data.criterionSection.notes = notes
  }
  setStakeholderNotes(notes) {
    this.data.stakeholderSection.notes = notes
  }
  setBeneficiaryNotes(notes) {
    this.data.beneficiarySection.notes = notes
  }
  setAttributeNotes(notes) {
    this.data.attributeSection.notes = notes
  }
  setCriterionResult(criterionName, val) {
    if (!(criterionName in this.criteria)) {
      throw new Error(`Cannot find criterion "${criterionName}".`) // programmer error
    } else {
      this.criteria[criterionName].result = val
      if (this.autoCompute) this._computeCriterionSection()
    }
  }
  setStakeholderScore(stakeholderName, criterionName, val) {
    if (!(stakeholderName in this.stakeholders)) {
      throw new Error(`Cannot find stakeholder "${stakeholderName}".`) // programmer error
    } else if (!(criterionName in this.criteria)) {
      throw new Error(`Cannot find criterion "${criterionName}".`) // programmer error
    } else {
      this.stakeholders[stakeholderName].scores[criterionName] = val
      if (this.autoCompute) this._computeStakeholderSection()
    }
  }
  setBeneficiaryScore(beneficiaryName, stakeholderName, val) {
    if (!(beneficiaryName in this.beneficiaries)) {
      throw new Error(`Cannot find beneficiary "${beneficiaryName}".`) // programmer error
    } else if (!(stakeholderName in this.stakeholders)) {
      throw new Error(`Cannot find stakeholder "${stakeholderName}".`) // programmer error
    } else {
      this.beneficiaries[beneficiaryName].scores[stakeholderName] = val
      if (this.autoCompute) this._computeBeneficiarySection()
    }
  }
  setAttributeScore(attributeName, beneficiaryName, val) {
    if (!(attributeName in this.attributes)) {
      throw new Error(`Cannot find attribute "${attributeName}".`) // programmer error
    } else if (!(beneficiaryName in this.beneficiaries)) {
      throw new Error(`Cannot find beneficiary "${beneficiaryName}".`) // programmer error
    } else {
      this.attributes[attributeName].scores[beneficiaryName] = val
      if (this.autoCompute) this._computeAttributeSection()
    }
  }
  setStakeholderName(oldName, newName) {
    if (!(oldName in this.stakeholders)) {
      throw new Error(`Cannot find stakeholder "${oldName}".`) // programmer error
    } else if (newName in this.stakeholders) {
      throw new Error(`Stakeholder "${newName}" already exists.`) // programmer error
    } else {
      Util.renameKey(this.stakeholders, oldName, newName)
      Object.values(this.beneficiaries).forEach(beneficiary => {
        Util.renameKey(beneficiary.scores, oldName, newName)
      })
      if (this.autoCompute) this._computeStakeholderSection()
    }
  }
  setStakeholderColor(stakeholderName, color) {
    if (!(stakeholderName in this.stakeholders)) {
      throw new Error(`Cannot find stakeholder "${stakeholderName}".`) // programmer error
    } else {
      this.stakeholders[stakeholderName].color.primary = color
      if (this.autoCompute) this._computeStakeholderColors()
    }
  }

  addStakeholder(stakeholderName, color=null) {
    if (stakeholderName in this.stakeholders) {
      throw new Error(`Stakeholder "${stakeholderName}" already exists.`) // programmer error
    } else {
      // add stakeholder to stakeholders
      const stakeholder = this.stakeholders[stakeholderName] = {
        color: {},
        scores: {},
      }
      if (color) stakeholder.color.primary = color
      
      // add scores to stakeholder
      Object.keys(this.criteria).forEach(criterionName => {
        stakeholder.scores[criterionName] = null
      })

      // add stakeholder to beneficiary scores
      Object.values(this.beneficiaries).forEach(beneficiary => {
        beneficiary.scores[stakeholderName] = null
      })

      if (this.autoCompute) this._computeStakeholderSection()
    }
  }

  delStakeholder(stakeholderName) {
    if (!(stakeholderName in this.stakeholders)) {
      throw new Error(`Cannot find stakeholder "${stakeholderName}".`) // programmer error
    } else {
      // delete stakeholder from stakeholders
      delete this.stakeholders[stakeholderName]

      // delete stakeholder from beneficiary scores
      Object.values(this.beneficiaries).forEach(beneficiary => {
        delete beneficiary.scores[stakeholderName]
      })

      if (this.autoCompute) this._computeStakeholderSection()
    }
  }

  // debug methods
  logResults() {
    const filter = (obj) => {
      if (Util.deepGet(obj, ['result']) === null) return {}
      if (Util.deepGet(obj, ['computed', 'result']) === null) return {}
      const ret = (Array.isArray(obj)) ? [] : {}
      Object.entries(obj).forEach(([key, val]) => {
        if (val && typeof val === 'object') {
          ret[key] = filter(val)
        } else {
          ret[key] = val
        }
      })
      return ret
    }
    console.log(JSON.stringify(filter(this.data), null, 2))
  }
  
  // the following methods are 'private'
  _registerAliases() {
    this.criteria = this.data.criterionSection.criteria
    this.stakeholders = this.data.stakeholderSection.stakeholders
    this.beneficiaries = this.data.beneficiarySection.beneficiaries
    this.attributes = this.data.attributeSection.attributes
  }
  _setComputed(obj, key, val) {
    Util.deepSet(obj, ['computed', key], val)
  }
  _computeAll() {
    this._computeCriterionSection()
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
    Object.values(this.stakeholders).forEach(stakeholder => {
      remain.delete(stakeholder.color.primary)
    })
    this._setComputed(this.data.stakeholderSection, 'colorsRemain', [...remain])
  }
  _computeStakeholderResults() {
    this._computeResults(this.criteria, this.stakeholders)
  }
  _computeBeneficiaryResults() {
    this._computeResults(this.stakeholders, this.beneficiaries, { doCategoriesWeighted: true })
  }
  _computeAttributeResults() {
    this._computeResults(this.beneficiaries, this.attributes, { doCategoriesWeighted: true })
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
        const category = metrics[metric].category // may be undefined
        if (doCategoriesWeighted && !(category in categoriesWeighted)) {
          categoriesWeighted[category] = null
        }
        if (doScoresWeighted) {
          scoresWeighted[metric] = null
        }
        if (Util.isNum(val)) {
          hasScore = true
          const scoreWeighted = cleanMetrics[metric]*val
          sum += scoreWeighted
          if (doCategoriesWeighted) {
            if (categoriesWeighted[category] !== null) {
              categoriesWeighted[category] += scoreWeighted
            } else {
              categoriesWeighted[category] = scoreWeighted
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
  _template() {
    const data = {
      project: {
        version: '2.0.0', // lowest compatible app version
        name: 'My Project',
        description: '',
      },
      criterionSection: {
        notes: 'section notes',
        criteria: {
          // 'criteria name': {
          //   short: 'short name',
          //   def: 'criterion definition',
          //   tip: 'criterion tooltip',
          //   color: {
          //     primary: '#777',
          //   }
          // },

          'Magnitude & Probability of Impact': {
            short: 'Impact',
            tip: 'If changes are made in this decision context what is the likelihood that this stakeholder group will be impacted? What is the potential magnitude of that impact?',
            color: {
              primary: '#c0504d',
            },
          },
          'Level of Influence': {
            short: 'Influence',
            tip: 'Does this stakeholder group have any formal or informal influence over the decision making process?',
            color: {
              primary: '#9bbb59',
            },
          },
          'Level of Interest': {
            short: 'Interest',
            tip: 'What is this stakeholder group\'s level of interest in this decision/action?',
            color: {
              primary: '#8064a2',
            },
          },
          'Urgency & Temporal Immediacy': {
            short: 'Urgency',
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
            short: 'Economic',
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
            short: 'Underrepresented',
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
        categories: {
          // 'category name': {
          //   short: 'shorter name',
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
          //   short: 'shorter name',
          //   category: 'category name',
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
            category: 'Agricultural',
            def: 'Uses the environment to graze livestock',
          },
          'Agricultural Processors': {
            category: 'Agricultural',
            def: 'Cleans edible products',
          },
          'Aquaculturalists': {
            category: 'Agricultural',
            def: 'Farms aquatic fauna (e.g., fish, shrimp, oysters)',
          },
          'Farmers': {
            category: 'Agricultural',
            def: 'Farms terrestrial or aquatic flora (e.g., crops, orchards)',
          },
          'Foresters': {
            category: 'Agricultural',
            def: 'Plants and raises trees (i.e., silviculture)',
          },

          // Commercial / Industrial
          'Food Extractors': {
            category: 'Commercial / Industrial',
            def: 'Uses the natural abundance of edible organisms (e.g., hunting, trapping, or fishing for livelihood, job, commercial, or artisinal purposes)',
          },
          'Timber / Fiber / Ornamental Extractors': {
            category: 'Commercial / Industrial',
            def: 'Extracts or harvests timber, fiber, wood, or ornamental extraction or harvest for commercial or business purposes (e.g., logging, shell collection)',
          },
          'Industrial Processors': {
            category: 'Commercial / Industrial',
            def: 'Uses natural resources in industrial processing such as manufacturing (e.g., textile or steel industries), mills, or oil and gas extraction and processing)',
          },
          'Energy Generators': {
            category: 'Commercial / Industrial',
            def: 'Uses the environment for energy production or placement of power generation structures includes power plants (electric and nuclear), dams, turbines (wind, water, or wave), solar',
          },
          'Pharmaceutical / Food Supplement Suppliers': {
            category: 'Commercial / Industrial',
            def: 'Collects organisms from nature that are used for pharmaceuticals, medicines, food supplements, or vitamins for commerical sale',
          },
          'Fur / Hide Trappers / Hunters': {
            category: 'Commercial / Industrial',
            def: 'Hunts or traps fauna for fur or hides for commerical sale',
          },
          'Commercial Property Owners': {
            category: 'Commercial / Industrial',
            def: 'Owners of private land for commercial or industrial purposes',
          },
          'Private Drinking Water Plant Operators': {
            category: 'Commercial / Industrial',
            def: 'Provides water for private purposes',
          },

          // Governmental / Municipal / Residential
          'Municipal Drinking Water Plant Operators': {
            category: 'Governmental / Municipal / Residential',
            def: 'Provides water for the Community',
          },
          'Public Energy Generators': {
            category: 'Governmental / Municipal / Residential',
            def: 'Uses the environment for energy production or placement of power generation structures for the community, includes power plants (electric and nuclear), dams, turbines (wind, water, or wave), solar panels, and geothermal systems',
          },
          'Residential Property Owners': {
            category: 'Governmental / Municipal / Residential',
            def: 'Homeowners of private land',
          },
          'Military / Coast Guard': {
            category: 'Governmental / Municipal / Residential',
            def: 'Uses the environment for placement of infrastucture or training activities',
          },

          // Transportation
          'Transporters of Goods': {
            category: 'Transportation',
            def: 'Uses the environment to transport goods (e.g., shipping, cargo, commercial navigation, barges, freight, planes, trains)',
          },
          'Transporters of People': {
            category: 'Transportation',
            def: 'Uses the environment to transport people (e.g., cruises, ferries, airplanes, airports, trains, harbors)',
          },

          // Subsistence
          'Water Subsisters': {
            category: 'Subsistence',
            def: 'Relies on natural sources for water including drinking water and tribal or traditional uses (may use wells, cisterns, rain gardens, rain barrels, etc.)',
          },
          'Food and Medicinal Subsisters': {
            category: 'Subsistence',
            def: 'Uses natural sources of edible flora, fauna, and fungi as a major source of food; includes hunting, fishing, and gathering as well as other tribal or traditional uses',
          },
          'Timber / Fiber / Ornamental Subsisters': {
            category: 'Subsistence',
            def: 'Relies on timber, fiber, or fauna for survival, including tribal or cultural traditions (e.g., firewood)',
          },
          'Building Material Subsisters': {
            category: 'Subsistence',
            def: 'Relies on natural materials for infrastructure and housing',
          },

          // Recreational
          'Experiencers / Viewers': {
            category: 'Recreational',
            def: 'Views and experiences the environment as an activity (e.g., bird, wildlife, or fauna watching; nature appreciation; hiking, biking, camping, climbing, outings, sunbathing, sightseeing, beach combing)',
          },
          'Food Pickers / Gatherers': {
            category: 'Recreational',
            def: 'Recreationally collects or gathers edible flora, fungi, or fauna (does not include hunting or trapping) (e.g., berry picking, mushroom gathering; clam digging)',
          },
          'Hunters': {
            category: 'Recreational',
            def: 'Hunts for recreation or sport',
          },
          'Anglers': {
            category: 'Recreational',
            def: 'Fishes for recreation or sport',
          },
          'Waders / Swimmers / Divers': {
            category: 'Recreational',
            def: 'Recreates in or under the water (e.g., snorkeling, SCUBA, swimming, beachgoing, wading, diving, bathing)',
          },
          'Boaters': {
            category: 'Recreational',
            def: 'Recreates in motorized or unmotorized watercraft (e.g., sailboats, ski boats, jet skis, kayaks, surfboards)',
          },

          // Inspirational
          'Spiritual and Ceremonial Participants': {
            category: 'Inspirational',
            def: 'Uses the environment for spiritual, ceremonial, or celebratory puposes (e.g., harvest festivals, tribal observances, traditional ceremonies, religious rites)',
          },
          'Artists': {
            category: 'Inspirational',
            def: 'Uses the environment to produce art, includes writers, painters, sculptors, cinematographers, and recording artists',
          },

          // Learning
          'Students and Educators': {
            category: 'Learning',
            def: 'Includes all educational uses, interests, or opportunities including field trips and outdoor laboratories',
          },
          'Researchers': {
            category: 'Learning',
            def: 'Includes opportunities or interest for significant scientific research and improving scientific knowledge',
          },

          // Non-Use
          'People Who Care': {
            category: 'Non-Use',
            def: 'Believes it is important to preserve the environment for moral or ethical reasons, for fear of its loss, or to allow their future selves or future generations to visit or rely upon it',
          },
        },
      },
      attributeSection: {
        notes: 'section notes',
        categories: {
          // 'category name': {
          //   short: 'shorter name',
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
          //   short: 'shorter name',
          //   category: 'category name',
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
            category: 'Atmosphere',
            def: 'The degree to which air is clean, clear, and pollution-free',
          },
          'Wind Strength / Speed': {
            category: 'Atmosphere',
            def: 'The speed and force of the wind',
          },
          'Precipitation': {
            category: 'Atmosphere',
            def: 'Weather in which something, including rain, snow, sleet, and/or hail, is falling from the sky',
          },
          'Sunlight': {
            category: 'Atmosphere',
            def: 'Light from the sun ',
          },
          'Temperature': {
            category: 'Atmosphere',
            def: 'A measure of the warmth or coldness of the weather or climate',
          },

          // Soil
          'Soil Quality': {
            category: 'Soil',
            def: 'The suitability of soil for use based on physical, chemical, and/or biological characteristics',
          },
          'Soil Quantity': {
            category: 'Soil',
            def: 'The amount of soil present, could be measured in terms of volume, depth, and/or extent',
          },
          'Substrate Quality': {
            category: 'Soil',
            def: 'The suitability of substrate for use based on physical, chemical, and/or biological characteristics',
          },
          'Substrate Quantity': {
            category: 'Soil',
            def: 'The amount of substrate present, could be measured in terms of volume, depth, and/or extent',
          },

          // Water
          'Water Quality': {
            category: 'Water',
            def: 'The suitability of water for use based on physical, chemical, and/or biological characteristics',
          },
          'Water Quantity': {
            category: 'Water',
            def: 'The amount of water present, could be measured in terms of volume, depth, total yield, and/or peak flow',
          },
          'Water Movement': {
            category: 'Water',
            def: 'The amount of water flowing per unit of time, includes aspects such as surface water movement through watersheds, wave action, etc',
          },

          // Fauna
          'Fauna Community': {
            category: 'Fauna',
            def: 'The interacting animal life present in the area',
          },
          'Edible Fauna': {
            category: 'Fauna',
            def: 'Fauna fit to be eaten by humans',
          },
          'Medicinal Fauna': {
            category: 'Fauna',
            def: 'Fauna that has healing properties as is or after processesing',
          },
          'Keystone Fauna': {
            category: 'Fauna',
            def: 'Fauna on which other species depend, its absence would significantly alter the ecosystem',
          },
          'Charismatic Fauna': {
            category: 'Fauna',
            def: 'Fauna with symbolic value or widespread popular appeal',
          },
          'Rare Fauna': {
            category: 'Fauna',
            def: 'Fauna that are uncommon or infrequently encountered',
          },
          'Pollinating Fauna': {
            category: 'Fauna',
            def: 'Fauna that moves pollen from plant to plant',
          },
          'Pest Predator / Depredator Fauna': {
            category: 'Fauna',
            def: 'Fauna that prey upon pest species',
          },
          'Commercially Important Fauna': {
            category: 'Fauna',
            def: 'Fauna that has importance for commerce',
          },
          'Spiritually / Culturally Important Fauna': {
            category: 'Fauna',
            def: 'Fauna that has importance for spiritual or cultural practices or beliefs',
          },

          // Flora
          'Flora Community': {
            category: 'Flora',
            def: 'The interacting plant life present in the area',
          },
          'Edible Flora': {
            category: 'Flora',
            def: 'Flora fit to be eaten by humans',
          },
          'Medicinal Flora': {
            category: 'Flora',
            def: 'Flora that has healing properties as is or after processesing',
          },
          'Keystone Flora': {
            category: 'Flora',
            def: 'Flora on which other species depend, its absence would significantly alter the ecosystem',
          },
          'Charismatic Flora': {
            category: 'Flora',
            def: 'Flora with symbolic value or widespread popular appeal',
          },
          'Rare Flora': {
            category: 'Flora',
            def: 'Flora that are uncommon or infrequently encountered',
          },
          'Commercially Important Flora': {
            category: 'Flora',
            def: 'Flora that has importance for commerce',
          },
          'Spiritually / Culturally Important Flora': {
            category: 'Flora',
            def: 'Flora that has importance for spiritual or cultural practices or beliefs',
          },

          // Fungi
          'Fungal Community': {
            category: 'Fungi',
            def: 'The interacting fungal life present in the area',
          },
          'Edible Fungi': {
            category: 'Fungi',
            def: 'Fungi fit to be eaten by humans',
          },
          'Medicinal Fungi': {
            category: 'Fungi',
            def: 'Fungi that has healing properties as is or after processesing',
          },
          'Rare Fungi': {
            category: 'Fungi',
            def: 'Fungi that are uncommon or infrequently encountered',
          },
          'Commercially Important Fungi': {
            category: 'Fungi',
            def: 'Fungi that has importance for commerce',
          },
          'Spiritually / Culturally Important Fungi': {
            category: 'Fungi',
            def: 'Fungi that has importance for spiritual or cultural practices or beliefs',
          },

          // Other Natural Components
          'Fuel Quality': {
            category: 'Other Natural Components',
            def: 'The suitability of material, based on physical, chemical, and/or biological characteristics, to produce heat or power through burning or other methods ',
          },
          'Fuel Quantity': {
            category: 'Other Natural Components',
            def: 'The amount of fuel present, could be measured in terms of volume, mass, and/or extent',
          },
          'Fiber Material Quality': {
            category: 'Other Natural Components',
            def: 'The amount of fiber material present, could be measured in terms of volume, mass, and/or extent',
          },
          'Fiber Material Quantity': {
            category: 'Other Natural Components',
            def: 'The suitability of material, based on physical, chemical, and/or biological characteristics, to be used in production of textiles',
          },
          'Mineral / Chemical Quality': {
            category: 'Other Natural Components',
            def: 'The suitability of material for use based on physical, chemical, and/or biological characteristics',
          },
          'Mineral / Chemical Quantity': {
            category: 'Other Natural Components',
            def: 'The amount of material present, could be measured in terms of volume, mass, and/or extent',
          },
          'Presence of Other Natural Materials for Artistic Use or Consumption (e.g. Shells, Acorns, Honey)': {
            short: 'Other Natural Materials',
            category: 'Other Natural Components',
            def: 'The presence and/or extent of materials suitable for artistic use or consumption',
          },

          // Composite (and Extreme Events)
          'Sounds': {
            category: 'Composite (and Extreme Events)',
            def: 'The sounds or combination of sounds arising from the area',
          },
          'Scents': {
            category: 'Composite (and Extreme Events)',
            def: 'The scents or combination of scents arising from the area',
          },
          'Viewscapes': {
            category: 'Composite (and Extreme Events)',
            def: 'The views and vistas available in the area',
          },
          'Phenomena (e.g. Sunsets, Northern Lights, etc)': {
            category: 'Composite (and Extreme Events)',
            short: 'Phenomena',
            def: 'Natural phenomena arising from a combination of environmental attributes',
          },
          'Ecological Condition': {
            category: 'Composite (and Extreme Events)',
            def: 'The overall quality of the ecological system based on physical, chemical, and biological characteristics',
          },
          'Open Space': {
            category: 'Composite (and Extreme Events)',
            def: 'Land that is undeveloped, but may be landscaped or otherwise in use, and is available for use',
          },
          'Flooding': {
            category: 'Composite (and Extreme Events)',
            def: 'The likelihood the area will experience flooding and the likely severity of the flooding',
          },
          'Wildfire': {
            category: 'Composite (and Extreme Events)',
            def: 'The likelihood the area will experience wildfire and the likely severity of the fire',
          },
          'Extreme Weather Events': {
            category: 'Composite (and Extreme Events)',
            def: 'The likelihood the area will experience extreme weather events and the likely severity of the events',
          },
          'Earthquakes': {
            category: 'Composite (and Extreme Events)',
            def: 'The likelihood the area will experience earthquakes and the likely severity of the earthquakes',
          },
        },
      },
    }

    // add scores to beneficiaries
    Object.values(data.beneficiarySection.beneficiaries).forEach(beneficiary => {
      beneficiary.scores = {} // populated when stakeholder added
    })

    // add scores to attributes
    Object.values(data.attributeSection.attributes).forEach(attribute => {
      attribute.scores = {}
      Object.keys(data.beneficiarySection.beneficiaries).forEach(beneficiary => {
        attribute.scores[beneficiary] = null
      })
    })

    return data
  }
}