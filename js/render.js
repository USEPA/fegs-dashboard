const fs = require('fs');
const electron = require('electron');

const { ipcRenderer, remote, webFrame } = electron;
const { app, dialog } = electron.remote;
const d3 = require('d3');
const { color } = require('d3');
const { time } = require('console');
d3.tip = require('d3-tip');

const appTitle = `FEGS Scoping Tool ${app.getVersion()} | BETA | US EPA`;

let fegsScopingData;
let fegsScopingView;
let fegsScopingController;
let tableAttributes;

const charts = {} // object to namespace charts
const notes = {} // object to namespace notes

// CONSTANTS
// const template = {
//   'Tier 1': {
//     color: 'str', // block color
//     colorBack: 'str', // background color
//     colorBack2: 'str', // lighter background color
//     short: 'str', // shorter label for 'Tier 1'
//     tip: 'str', // tooltip for tier
//     def: 'str', // definition for tier
//     parts: { // sub-tiers
//       'Tier 2': {
//         color: 'str',
//         short: 'str',
//         def: 'str',
//       },
//       ...
//     }
//   },
//   ...
// }

const STAKEHOLDER_COLORS = [
  "rgb(76,177,89)",
  "rgb(18,135,197)",
  "rgb(240,137,64)",
  "rgb(147,47,178)",
  "rgb(93,226,226)",
  "rgb(226,75,218)",
  "rgb(138,229,56)",
  "rgb(250,190,190)",
  "rgb(0,128,128)",
  "rgb(225,43,87)",
  "rgb(230,190,255)",
  "rgb(170,110,40)",
  "rgb(255,221,136)",
  "rgb(136,51,51)",
  "rgb(136,255,136)",
  "rgb(136,136,51)",
  "rgb(250,222,42)",
  "rgb(51,51,136)",
  "rgb(136,221,255)",
  "rgb(136,136,136)",
  "rgb(51,51,51)",
  "rgb(60,91,64)",
  "rgb(21,67,92)",
  "rgb(167,90,35)",
  "rgb(74,38,85)",
  "rgb(55,162,162)",
  "rgb(151,48,146)",
  "rgb(89,144,39)",
  "rgb(225,112,112)",
  "rgb(8,69,69)",
  "rgb(129,37,59)",
  "rgb(187,105,238)",
  "rgb(77,56,31)",
  "rgb(233,182,56)",
  "rgb(53,32,32)",
  "rgb(56,233,56)",
  "rgb(53,53,32)",
  "rgb(167,147,23)",
  "rgb(32,32,53)",
  "rgb(56,182,233)",
  "rgb(85,85,85)",
  "rgb(0,0,0)",
]

const CRITERIA = {
  'Magnitude & Probability of Impact': {
    tip: 'If changes are made in this decision context what is the likelihood that this stakeholder group will be impacted? What is the potential magnitude of that impact?',
    color: '#c0504d',
    short: 'Impact',
  },
  'Level of Influence': {
    tip: 'Does this stakeholder group have any formal or informal influence over the decision making process?',
    color: '#9bbb59',
    short: 'Influence',
  },
  'Level of Interest': {
    tip: 'What is this stakeholder group\'s level of interest in this decision/action?',
    color: '#8064a2',
    short: 'Interest',
  },
  'Urgency & Temporal Immediacy': {
    tip: 'Does this stakeholder group want an immediate decision/action on this issue?',
    color: '#DDC436',
    short: 'Urgency',
  },
  'Proximity': {
    tip: 'How frequently does this stakeholder group come into contact with the area subject to this decision?',
    color: '#4bacc6',
  },
  'Economic Interest': {
    tip: 'Does this stakeholder group have an economic interest in the outcome of this decision?',
    color: '#2F7455',
    short: 'Economic',
  },
  'Rights': {
    tip: 'Does this stakeholder group have any 1) legal right to be involved in this decision making process, 2) property rights associated with the land that will be impacted by the decision, or 3) consumer/user rights associated with the services that will be impacted by the decision?',
    color: '#f79646',
  },
  'Fairness': {
    tip: 'If this stakeholder group is not considered in decision-making, would the resulting decision be seen as unfair?',
    color: '#863758',
  },
  'Underrepresented & Underserved Representation': {
    tip: 'Underrepresented & Underserved representation: Does this stakeholder group represent underserved or underrepresented groups?',
    color: '#2c4d75',
    short: 'Underrepresented',
  },
}

const BENEFICIARIES = {
  'Agricultural': {
    color: 'rgb(255,133,82)',
    colorBack: 'rgb(245,208,168)',
    colorBack2: 'rgb(250,231,211)',
    parts: {
      'Livestock Grazers': {
        def: 'Uses the environment to graze livestock',
      },
      'Agricultural Processors': {
        def: 'Cleans edible products',
      },
      'Aquaculturalists': {
        def: 'Farms aquatic fauna (e.g., fish, shrimp, oysters)',
      },
      'Farmers': {
        def: 'Farms terrestrial or aquatic flora (e.g., crops, orchards)',
      },
      'Foresters': {
        def: 'Plants and raises trees (i.e., silviculture)',
      },
    },
  },
  'Commercial / Industrial': {
    color: 'rgb(219,58,52)',
    colorBack: 'rgb(242,145,141)',
    colorBack2: 'rgb(248,200,198)',
    parts: {
      'Food Extractors': {
        def: 'Uses the natural abundance of edible organisms (e.g., hunting, trapping, or fishing for livelihood, job, commercial, or artisinal purposes)',
      },
      'Timber / Fiber / Ornamental Extractors': {
        def: 'Extracts or harvests timber, fiber, wood, or ornamental extraction or harvest for commercial or business purposes (e.g., logging, shell collection)',
      },
      'Industrial Processors': {
        def: 'Uses natural resources in industrial processing such as manufacturing (e.g., textile or steel industries), mills, or oil and gas extraction and processing)',
      },
      'Energy Generators': {
        def: 'Uses the environment for energy production or placement of power generation structures includes power plants (electric and nuclear), dams, turbines (wind, water, or wave), solar',
      },
      'Pharmaceutical / Food Supplement Suppliers': {
        def: 'Collects organisms from nature that are used for pharmaceuticals, medicines, food supplements, or vitamins for commerical sale',
      },
      'Fur / Hide Trappers / Hunters': {
        def: 'Hunts or traps fauna for fur or hides for commerical sale',
      },
      'Commercial Property Owners': {
        def: 'Owners of private land for commercial or industrial purposes',
      },
      'Private Drinking Water Plant Operators': {
        def: 'Provides water for private purposes',
      },
    },
  },
  'Governmental / Municipal / Residential': {
    color: 'rgb(180,111,236)',
    colorBack: 'rgb(248,194,248)',
    colorBack2: 'rgb(251,224,251)',
    parts: {
      'Municipal Drinking Water Plant Operators': {
        def: 'Provides water for the Community',
      },
      'Public Energy Generators': {
        def: 'Uses the environment for energy production or placement of power generation structures for the community, includes power plants (electric and nuclear), dams, turbines (wind, water, or wave), solar panels, and geothermal systems',
      },
      'Residential Property Owners': {
        def: 'Homeowners of private land',
      },
      'Military / Coast Guard': {
        def: 'Uses the environment for placement of infrastucture or training activities',
      },
    },
  },
  'Transportation': {
    color: 'rgb(102,0,7)',
    colorBack: 'rgb(184,122,127)',
    colorBack2: 'rgb(219,188,191)',
    parts: {
      'Transporters of Goods': {
        def: 'Uses the environment to transport goods (e.g., shipping, cargo, commercial navigation, barges, freight, planes, trains)',
      },
      'Transporters of People': {
        def: 'Uses the environment to transport people (e.g., cruises, ferries, airplanes, airports, trains, harbors)',
      },
    },
  },
  'Subsistence': {
    color: 'rgb(115,194,190)',
    colorBack: 'rgb(176,235,232)',
    colorBack2: 'rgb(215,245,243)',
    parts: {
      'Water Subsisters': {
        def: 'Relies on natural sources for water including drinking water and tribal or traditional uses (may use wells, cisterns, rain gardens, rain barrels, etc.)',
      },
      'Food and Medicinal Subsisters': {
        def: 'Uses natural sources of edible flora, fauna, and fungi as a major source of food; includes hunting, fishing, and gathering as well as other tribal or traditional uses',
      },
      'Timber / Fiber / Ornamental Subsisters': {
        def: 'Relies on timber, fiber, or fauna for survival, including tribal or cultural traditions (e.g., firewood)',
      },
      'Building Material Subsisters': {
        def: 'Relies on natural materials for infrastructure and housing',
      },
    },
  },
  'Recreational': {
    color: 'rgb(144,39,83)',
    colorBack: 'rgb(234,153,187)',
    colorBack2: 'rgb(224,204,221)',
    parts: {
      'Experiencers / Viewers': {
        def: 'Views and experiences the environment as an activity (e.g., bird, wildlife, or fauna watching; nature appreciation; hiking, biking, camping, climbing, outings, sunbathing, sightseeing, beach combing)',
      },
      'Food Pickers / Gatherers': {
        def: 'Recreationally collects or gathers edible flora, fungi, or fauna (does not include hunting or trapping) (e.g., berry picking, mushroom gathering; clam digging)',
      },
      'Hunters': {
        def: 'Hunts for recreation or sport',
      },
      'Anglers': {
        def: 'Fishes for recreation or sport',
      },
      'Waders / Swimmers / Divers': {
        def: 'Recreates in or under the water (e.g., snorkeling, SCUBA, swimming, beachgoing, wading, diving, bathing)',
      },
      'Boaters': {
        def: 'Recreates in motorized or unmotorized watercraft (e.g., sailboats, ski boats, jet skis, kayaks, surfboards)',
      },
    },
  },
  'Inspirational': {
    color: 'rgb(62,142,97)',
    colorBack: 'rgb(153,203,175)',
    colorBack2: 'rgb(204,229,215)',
    parts: {
      'Spiritual and Ceremonial Participants': {
        def: 'Uses the environment for spiritual, ceremonial, or celebratory puposes (e.g., harvest festivals, tribal observances, traditional ceremonies, religious rites)',
      },
      'Artists': {
        def: 'Uses the environment to produce art, includes writers, painters, sculptors, cinematographers, and recording artists',
      },
    },
  },
  'Learning': {
    color: 'rgb(233,215,88)',
    colorBack: 'rgb(243,243,151)',
    colorBack2: 'rgb(249,249,203)',
    parts: {
      'Students and Educators': {
        def: 'Includes all educational uses, interests, or opportunities including field trips and outdoor laboratories',
      },
      'Researchers': {
        def: 'Includes opportunities or interest for significant scientific research and improving scientific knowledge',
      },
    },
  },
  'Non-Use': {
    color: 'rgb(27,64,121)',
    colorBack: 'rgb(145,169,207)',
    colorBack2: 'rgb(200,212,231)',
    parts: {
      'People Who Care': {
        def: 'Believes it is important to preserve the environment for moral or ethical reasons, for fear of its loss, or to allow their future selves or future generations to visit or rely upon it',
      },
    },
  },
}

const ATTRIBUTES = {
  'Atmosphere': {
    color: 'rgb(34,181,195)',
    parts: {
      'Air Quality': {
        def: 'The degree to which air is clean, clear, and pollution-free',
      },
      'Wind Strength / Speed': {
        def: 'The speed and force of the wind',
      },
      'Precipitation': {
        def: 'Weather in which something, including rain, snow, sleet, and/or hail, is falling from the sky',
      },
      'Sunlight': {
        def: 'Light from the sun ',
      },
      'Temperature': {
        def: 'A measure of the warmth or coldness of the weather or climate',
      },
    },
  },
  'Soil': {
    color: 'rgb(129,93,86)',
    parts: {
      'Soil Quality': {
        def: 'The suitability of soil for use based on physical, chemical, and/or biological characteristics',
      },
      'Soil Quantity': {
        def: 'The amount of soil present, could be measured in terms of volume, depth, and/or extent',
      },
      'Substrate Quality': {
        def: 'The suitability of substrate for use based on physical, chemical, and/or biological characteristics',
      },
      'Substrate Quantity': {
        def: 'The amount of substrate present, could be measured in terms of volume, depth, and/or extent',
      },
    },
  },
  'Water': {
    color: 'rgb(42,117,169)',
    parts: {
      'Water Quality': {
        def: 'The suitability of water for use based on physical, chemical, and/or biological characteristics',
      },
      'Water Quantity': {
        def: 'The amount of water present, could be measured in terms of volume, depth, total yield, and/or peak flow',
      },
      'Water Movement': {
        def: 'The amount of water flowing per unit of time, includes aspects such as surface water movement through watersheds, wave action, etc',
      },
    },
  },
  'Fauna': {
    color: 'rgb(201,52,53)',
    parts: {
      'Fauna Community': {
        def: 'The interacting animal life present in the area',
      },
      'Edible Fauna': {
        def: 'Fauna fit to be eaten by humans',
      },
      'Medicinal Fauna': {
        def: 'Fauna that has healing properties as is or after processesing',
      },
      'Keystone Fauna': {
        def: 'Fauna on which other species depend, its absence would significantly alter the ecosystem',
      },
      'Charismatic Fauna': {
        def: 'Fauna with symbolic value or widespread popular appeal',
      },
      'Rare Fauna': {
        def: 'Fauna that are uncommon or infrequently encountered',
      },
      'Pollinating Fauna': {
        def: 'Fauna that moves pollen from plant to plant',
      },
      'Pest Predator / Depredator Fauna': {
        def: 'Fauna that prey upon pest species',
      },
      'Commercially Important Fauna': {
        def: 'Fauna that has importance for commerce',
      },
      'Spiritually / Culturally Important Fauna': {
        def: 'Fauna that has importance for spiritual or cultural practices or beliefs',
      },
    },
  },
  'Flora': {
    color: 'rgb(54,150,54)',
    parts: {
      'Flora Community': {
        def: 'The interacting plant life present in the area',
      },
      'Edible Flora': {
        def: 'Flora fit to be eaten by humans',
      },
      'Medicinal Flora': {
        def: 'Flora that has healing properties as is or after processesing',
      },
      'Keystone Flora': {
        def: 'Flora on which other species depend, its absence would significantly alter the ecosystem',
      },
      'Charismatic Flora': {
        def: 'Flora with symbolic value or widespread popular appeal',
      },
      'Rare Flora': {
        def: 'Flora that are uncommon or infrequently encountered',
      },
      'Commercially Important Flora': {
        def: 'Flora that has importance for commerce',
      },
      'Spiritually / Culturally Important Flora': {
        def: 'Flora that has importance for spiritual or cultural practices or beliefs',
      },
    },
  },
  'Fungi': {
    color: 'rgb(147,114,178)',
    parts: {
      'Fungal Community': {
        def: 'The interacting fungal life present in the area',
      },
      'Edible Fungi': {
        def: 'Fungi fit to be eaten by humans',
      },
      'Medicinal Fungi': {
        def: 'Fungi that has healing properties as is or after processesing',
      },
      'Rare Fungi': {
        def: 'Fungi that are uncommon or infrequently encountered',
      },
      'Commercially Important Fungi': {
        def: 'Fungi that has importance for commerce',
      },
      'Spiritually / Culturally Important Fungi': {
        def: 'Fungi that has importance for spiritual or cultural practices or beliefs',
      },
    },
  },
  'Other Natural Components': {
    color: 'rgb(243,128,26)',
    parts: {
      'Fuel Quality': {
        def: 'The suitability of material, based on physical, chemical, and/or biological characteristics, to produce heat or power through burning or other methods ',
      },
      'Fuel Quantity': {
        def: 'The amount of fuel present, could be measured in terms of volume, mass, and/or extent',
      },
      'Fiber Material Quality': {
        def: 'The amount of fiber material present, could be measured in terms of volume, mass, and/or extent',
      },
      'Fiber Material Quantity': {
        def: 'The suitability of material, based on physical, chemical, and/or biological characteristics, to be used in production of textiles',
      },
      'Mineral / Chemical Quality': {
        def: 'The suitability of material for use based on physical, chemical, and/or biological characteristics',
      },
      'Mineral / Chemical Quantity': {
        def: 'The amount of material present, could be measured in terms of volume, mass, and/or extent',
      },
      'Presence of Other Natural Materials for Artistic Use or Consumption (e.g. Shells, Acorns, Honey)': {
        short: 'Other Natural Materials',
        def: 'The presence and/or extent of materials suitable for artistic use or consumption',
      },
    },
  },
  'Composite (and Extreme Events)': {
    color: 'rgb(219,127,191)',
    parts: {
      'Sounds': {
        def: 'The sounds or combination of sounds arising from the area',
      },
      'Scents': {
        def: 'The scents or combination of scents arising from the area',
      },
      'Viewscapes': {
        def: 'The views and vistas available in the area',
      },
      'Phenomena (e.g. Sunsets, Northern Lights, etc)': {
        short: 'Phenomena',
        def: 'Natural phenomena arising from a combination of environmental attributes',
      },
      'Ecological Condition': {
        def: 'The overall quality of the ecological system based on physical, chemical, and biological characteristics',
      },
      'Open Space': {
        def: 'Land that is undeveloped, but may be landscaped or otherwise in use, and is available for use',
      },
      'Flooding': {
        def: 'The likelihood the area will experience flooding and the likely severity of the flooding',
      },
      'Wildfire': {
        def: 'The likelihood the area will experience wildfire and the likely severity of the fire',
      },
      'Extreme Weather Events': {
        def: 'The likelihood the area will experience extreme weather events and the likely severity of the events',
      },
      'Earthquakes': {
        def: 'The likelihood the area will experience earthquakes and the likely severity of the earthquakes',
      },
    },
  },
}


/** clear all notices */
const clearNotices = function clearNotices() {
  const notices = document.getElementsByClassName('accessible-notification');
  for (let i = 0; i < notices.length; i += 1) {
    notices[i].remove();
  }
};

/** return HTMLElement of accessible notice of text */
const accessiblyNotify = function accessiblyNotify(text) {
  const notice = document.createElement('div');
  let textNode = document.createTextNode(text);
  clearNotices();
  notice.appendChild(textNode);
  notice.setAttribute('aria-live', 'polite');
  notice.addEventListener('click', function removeNotification() {
    this.remove();
  });
  notice.className = 'accessible-notification';
  const span = document.createElement('span');
  textNode = document.createTextNode('×');
  span.appendChild(textNode);
  span.setAttribute('role', 'button');
  span.className = 'toast-close-button';
  notice.appendChild(span);
  document.getElementsByTagName('body')[0].appendChild(notice);
  return notice;
};

// PAGE PROCESS

// Set styles used in d3 visualizations
const fontLabel = '14px sans-serif'
const fontLegend = '14px sans-serif'


// UTILS

// determine if a variable is a valid number
const isNum = n => (typeof n === 'number' && !isNaN(n))

// sort an array alphabetically by the key specified by keyfunc
const alphabetize = (arr, keyfunc=d=>d) => {
  return arr.sort((a, b) => {
    a = keyfunc(a).toLowerCase()
    b = keyfunc(b).toLowerCase()
    return (a < b) ? -1 : (a > b) ? 1 : 0
  })
}

// create and return the specified element
const element = ({ tag, cls, text, childs, ...rest }) => {
  const ele = document.createElement(tag)
  if (cls) ele.className = cls
  if (text) ele.innerText = text
  if (childs) childs.forEach(child => ele.appendChild(element(child))) // recursive
  Object.entries(rest).forEach(([key, val]) => ele.setAttribute(key, val))
  return ele
}

/** sum all values in an object */
const sum = function sum(obj) {
  let total = 0;
  const keys = Object.keys(obj);
  keys.forEach(el => {
    total += parseFloat(obj[el]);
  });
  return total;
};

// Rounding function used in the application
const round = function round(number, precision) {
  const shift = function shift(number, precision, reverseShift) {
    if (reverseShift) {
      precision = -precision;
    }
    const numArray = number.toString().split('e');
    return +`${numArray[0]}e${numArray[1] ? +numArray[1] + precision : precision}`;
  };

  return shift(Math.round(shift(number, precision, false)), precision, true);
};


// CLASSES

class Note {
  constructor(config) {
    this.node =        config.node // DOM node to attach note section
    this.saveFunc =    config.saveFunc || null // called when edited text is saved
    this.header =      config.header || 'Notes'
    this.placeholder = config.placeholder || '<em>Your notes here...</em>'

    this.editIcon = 'fas fa-edit'.split(' ') // array of CSS classes
    this.saveIcon = 'fas fa-check green'.split(' ')
    this.hideIcon = 'fas fa-chevron-down'.split(' ')
    this.showIcon = 'fas fa-chevron-right'.split(' ')
    this.editing = false
    this.visible = true
    this.note = ''

    this.init()
  }
  init() {
    const headerDiv = element({ tag: 'div', cls: 'note-header' })
    headerDiv.appendChild(element({ tag: 'h3', text: this.header }))

    this.editBtn = element({ tag: 'i', cls: 'icon-btn' })
    this.editBtn.addEventListener('click', () => {
      (this.editing) ? this.save() : this.edit()
    })
    headerDiv.appendChild(this.editBtn)

    this.viewBtn = element({ tag: 'i', cls: 'icon-btn', style: 'margin-left: .75em' })
    this.viewBtn.addEventListener('click', () => {
      (this.visible) ? this.hide() : this.show()
    })
    headerDiv.appendChild(this.viewBtn)

    this.node.appendChild(headerDiv)

    this.content = element({ tag: 'div', cls: 'note', text: this.note })
    this.node.appendChild(this.content)

    this.save() // initialize state
    this.show() // initialize state
  }
  get() {
    return this.note
  }
  set(note) {
    this.note = note
    this.editing = false
    this.save()
    this.show()
  }
  save() {
    if (this.editing) {
      this.note = this.content.innerText
      if (this.saveFunc) this.saveFunc(this.note)
    }
    this.editing = false
    this.content.setAttribute('contenteditable', false)
    this.editBtn.classList.remove(...this.saveIcon)
    this.editBtn.classList.add(...this.editIcon)
    this.editBtn.setAttribute('title', 'Edit')
    this.viewBtn.hidden = false
    this.showContent()
  }
  edit() {
    this.editing = true
    this.content.setAttribute('contenteditable', true)
    this.editBtn.classList.remove(...this.editIcon)
    this.editBtn.classList.add(...this.saveIcon)
    this.editBtn.setAttribute('title', 'Save')
    this.viewBtn.hidden = true
    this.showContent()
  }
  hide() {
    this.visible = false
    this.viewBtn.classList.remove(...this.hideIcon)
    this.viewBtn.classList.add(...this.showIcon)
    this.viewBtn.setAttribute('title', 'Show')
    this.showContent()
  }
  show() {
    this.visible = true
    this.viewBtn.classList.remove(...this.showIcon)
    this.viewBtn.classList.add(...this.hideIcon)
    this.viewBtn.setAttribute('title', 'Hide')
    this.showContent()
  }
  showContent() { // show correct note content depending on state
    if (this.editing) {
      this.content.innerText = this.note
    } else {
      if (this.visible) {
        if (this.note) {
          this.content.innerText = this.note
        } else {
          this.content.innerHTML = this.placeholder
        }
      } else {
        this.content.innerHTML = '<em>Notes hidden...</em>'
      }
    }
  }
}

class PieChart {
  constructor(config) {
    this.node =      config.node // DOM node to attach svg
    this.font =      config.font || '14px sans-serif'
    this.colorMap =  config.colorMap || {} // map: label -> color
    this.colors =    config.colors || []   // colors to use after or in place of colorMap
    this.wTotal =    config.width || 1020  // svg width
    this.hTotal =    config.height || 420  // svg height
    this.doLabels =  config.doLabels || true
    this.doPercent = config.doPercent || true

    this.show()
    this.init()
    if (config.data) this.update(config.data) // [{ key: str, label: str, value: num }, ...] note: provide optional key for color lookup
  }
  
  init() {
    this.rTotal = Math.min(this.wTotal/2, this.hTotal/2) // largest possible radius
    this.rLine = this.rTotal - 10 // radius where label line bends
    this.rPie = this.rLine - 10 // radius of pie slices

    this.svg = d3.select(this.node).append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${this.wTotal} ${this.hTotal}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')

    this.main = this.svg.append('g')
      .attr('transform', `translate(${this.wTotal/2},${this.hTotal/2})`)

    this.lines = this.main.append('g')
      .attr('class', 'lines')

    this.slices = this.main.append('g')
      .attr('class', 'slices')

    this.labels = this.main.append('g')
      .attr('class', 'labels')
      .style('font', this.font)
    
    this.color = d3.scaleOrdinal()
      .domain(Object.keys(this.colorMap))
      .range(Object.values(this.colorMap).concat(this.colors))
  }

  update(data) { // data: [{ label: str, value: num }, ...]
    data = data.filter(d => d.value > 0) // don't draw empty slices
    data = data.sort((a, b) => a.value - b.value) // slices in order by size

    const sum = data.reduce((total, item) => total + item.value, 0)

    const round = (num, decimals) => Math.round(num*10*decimals)/(10*decimals)
    const percent = (num, total) => (total > 0) ? round((num/total)*100, 1) : 0
    const percentStr = num => (this.doPercent) ? ` (${percent(num, sum)}%)` : ''
    const midAngle = d => (d.startAngle + (d.endAngle - d.startAngle)/2)
    const rightSide = d => midAngle(d) > Math.PI*0.5 && midAngle(d) < Math.PI*1.5

    const arcPie = d3.arc()
      .innerRadius(0)
      .outerRadius(this.rPie)
      .startAngle(d => d.startAngle + Math.PI*1.5)
      .endAngle(d => d.endAngle + Math.PI*1.5)
       
    const arcLine = d3.arc()
      .innerRadius(this.rLine)
      .outerRadius(this.rLine)
      .startAngle(d => d.startAngle + Math.PI*1.5)
      .endAngle(d => d.endAngle + Math.PI*1.5)

    const pie = d3.pie()
      .value(d => d.value)

    const slice = this.slices.selectAll('path')
      .data(pie(data), d => d)
      .join(enter => enter.insert('path'))
      .style('fill', d => this.color(d.data.key || d.data.label))
      .attr('d', d => arcPie(d))

    // if (!this.doLabels) return // don't show any labels (as implemented, old labels won't be removed if this flag is changed after construction)

    const label = this.labels.selectAll('text')
      .data(pie(data), d => d)
      .join(enter => enter.append('text')
        .style('font', this.font)
        .attr('dy', '.35em')
      )
      .style('text-anchor', d => rightSide(d) ? 'start' : 'end')
      .attr('hidden', (this.doLabels) ? null : true)
      .attr('transform', d => {
        let [x, y] = arcLine.centroid(d)
        x = (this.rTotal + 5)*(rightSide(d) ? 1 : -1)
        return `translate(${x},${y})`
      })
      .text(d => `${d.data.label}${percentStr(d.data.value)}`)
  
    const line = this.lines.selectAll('polyline')
      .data(pie(data), d => d)
      .join(enter => enter.append('polyline')
        .attr('stroke', 'black')
        .attr('stroke-width', '1px')
        .attr('fill', 'none')
      )
      .attr('hidden', (this.doLabels) ? null : true)
      .attr('points', d => {
        const y = Math.round(arcLine.centroid(d)[1]) + 0.5 // try to land on pixel to prevent blur
        const outer = [this.rTotal*(rightSide(d) ? 1 : -1), y] 
        const bend = [arcLine.centroid(d)[0], y]
        const inner = arcPie.centroid(d)
        return [inner, bend, outer]
      })
  }

  hide() {
    this.node.hidden = true
  }
  show() {
    this.node.hidden = false
  }
}

class BarChart {
  constructor(config) {
    this.node =     config.node // DOM node to attach svg
    this.font =     config.font || '14px sans-serif'
    this.colorMap = config.colorMap || {}   // map: label -> color
    this.colors =   config.colors || []     // colors to use after or in place of colorMap
    this.wTotal =   config.width || 1020    // svg width
    this.hTotal =   config.height || 520    // svg height
    this.wPlot =    config.plotWidth || 420 // horizontal area where bars can be  
    this.labels =   config.labels || []     // labels to always include in legend

    this.show()
    this.init()
    if (config.data) this.update(config.data) // [{ key: str, label1: num, label2: num, ... }, ...]
  }
  
  init() {
    this.wSide = (this.wTotal - this.wPlot)/2 // space on left and right for y axis labels or legend
    this.hSide = 50 // space on bottom for x axis labels
    this.hPlot = this.hTotal - this.hSide // vertical area where bars can be

    this.svg = d3.select(this.node).append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${this.wTotal} ${this.hTotal}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('shape-rendering', 'crispEdges')

    this.main = this.svg.append('g')
      .attr('transform', `translate(${this.wSide},0)`)

    this.layers = this.main.append('g')
      .attr('class', 'layers')

    this.xAxis = this.main.append('g')
      .attr('class', 'x-axis')
      .style('font', this.font)
      .attr('transform', `translate(-1,${this.hPlot + 5})`)

    this.yAxis = this.main.append('g')
      .attr('class', 'y-axis')
      .style('font', this.font)
      .attr('transform', `translate(-1,0)`) // ...?

    this.legend = this.main.append('g')
      .attr('class', 'legend')
      .style('font', this.font)
  }

  update(data) { // data: [{ key: str, label1: num, label2: num, ... }, ...]
    data = data.reverse() // y axis builds from bottom
  
    const keys = data.map(d => d.key) // for y axis
    const largest = d3.max(data, d => {
      return Object.values(d).reduce((total, item) => {
        return isNum(item) ? item + total : total
      }, 0)
    })
    const labels = [...this.labels] // for legend/colors
    data.forEach(item => {
      Object.keys(item).forEach(key => {
        if (key !== 'key' && !labels.includes(key)) { // unique key (could use a set instead)
          labels.push(key)
        }
      })
    })

    const color = d3.scaleOrdinal()
      .domain(Object.keys(this.colorMap))
      .range(Object.values(this.colorMap).concat(this.colors))
    
    const xScale = d3.scaleLinear()
      .domain([0, largest])
      .range([0, this.wPlot])
    this.xAxis.call(d3.axisBottom(xScale))

    const yScale = d3.scaleBand()
      .domain(keys)
      .range([this.hPlot, 0])
      .padding(0.1)
    this.yAxis.call(d3.axisLeft(yScale))

    const tip = d3.tip()
      .attr('class', 'd3-tip stacket-bar-chart')
      .offset([-10, 0])
      .html(function (d) {
        const label = this.parentNode.getAttribute('data-label')
        return `${round(d[1] - d[0], 1)} (${label})`
      })
    this.main.call(tip)

    const stack = d3.stack()
      .keys(labels)
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone)

    const layer = this.layers.selectAll('g.layer')
      .data(stack(data), d => d) // note: d => d binds data by content instead of index
      .join(enter => enter.append('g')
        .attr('class', 'layer')
      )
      .style('fill', d => color(d.key))
      .attr('data-label', (d, i) => labels[i])  
    
    const rect = layer.selectAll('rect')
      .data(d => d)
      .join(enter => enter.append('rect')
        .attr('class', 'bar')
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
      )
      .attr('x', d => xScale(isNum(d[0]) ? d[0] : 0))
      .attr('y', d => yScale(d.data.key))
      .attr('width', d => (isNum(d[0]) && isNum(d[1])) ? xScale(d[1]) - xScale(d[0]) : 0)
      .attr('height', yScale.bandwidth)
      
    const legendColor = this.legend.selectAll('rect')
      .data(labels, d => d)
      .join(enter => enter.append('rect')
        .attr('x', 10)
        .attr('width', 18)
        .attr('height', 18)
      )
      .attr('fill', d => color(d))
      .attr('transform', (d, i) => `translate(${this.wPlot},${i*19})`)

    const legendLabel = this.legend.selectAll('text')
      .data(labels, d => d)
      .join(entry => entry.append('text')
        .attr('x', 30)
        .attr('y', 9)
        .attr('dy', '0.35em')
      )
      .text(d => d)
      .attr('transform', (d, i) => `translate(${this.wPlot},${i*19})`)
  }

  hide() {
    this.node.hidden = true
  }
  show() {
    this.node.hidden = false
  }
}


function updateAllCharts() {
  // pie charts
  updateCriteriaPieChart()
  updateBeneficiaryPieChart()
  updateStakeholderPieChart()
  updateAttributePieChart()
  // bar charts
  updateStakeholderBarChart()
  updateBeneficiaryBarChart()
  updateAttributeBarChart()
}

const extractColorMap = obj => {
  const colorMap = {}
  Object.entries(obj).forEach(([key, val]) => {
    colorMap[key] = obj[key].color
    if (val.short) colorMap[val.short] = obj[key].color
  })
  return colorMap
}

const chartWidth = 1020
const barHeight = 520
const pieHeight = 300

// Create or update the criteria pie chart
function updateCriteriaPieChart() {
  if (!charts.criteriaPie) {
    charts.criteriaPie = new PieChart({
      node: document.getElementById('criteria-piechart'),
      colorMap: extractColorMap(CRITERIA),
      width: 680,
      height: 340,
    })
  }
  charts.criteriaPie.update(criteriaPieData())
}

// Create or update the stakeholder pie chart
function updateStakeholderPieChart() {
  if (!charts.stakeholderPie) {
    charts.stakeholderPie = new PieChart({
      node: document.getElementById('stakeholder-piechart'),
      colorMap: extractColorMap(CRITERIA),
      width: chartWidth,
      height: pieHeight,
    })
  }
  charts.stakeholderPie.update(criteriaPieData(false)) // same data as criteria pie chart
}

// Create or update the beneficiary pie chart
function updateBeneficiaryPieChart() {
  if (!charts.beneficiaryPie) {
    charts.beneficiaryPie = new PieChart({
      node: document.getElementById('beneficiary-piechart'),
      colorMap: extractColorMap(BENEFICIARIES),
      width: chartWidth,
      height: pieHeight,
    })
  }
  charts.beneficiaryPie.update(getTier1BeneficiaryScoresForPieChart())
}

// Create or update the attribute pie chart
function updateAttributePieChart() {
  if (!charts.attributePie) {
    charts.attributePie = new PieChart({
      node: document.getElementById('attribute-piechart'),
      colorMap: extractColorMap(ATTRIBUTES),
      width: chartWidth,
      height: pieHeight,
    })
  }
  charts.attributePie.update(getTier1AttributeScoresForPieChart())
}


// Create or update the stakeholder bar chart
function updateStakeholderBarChart() {
  if (!charts.stakeholderBar) {
    charts.stakeholderBar = new BarChart({
      node: document.getElementById('stakeholder-barchart'),
      colorMap: extractColorMap(CRITERIA),
      width: chartWidth,
      height: barHeight,
    })
  }
  charts.stakeholderBar.update(stakeholderBarData())
}

// Create or update the beneficiary bar chart
function updateBeneficiaryBarChart() {
  if (!charts.beneficiaryBar) {
    charts.beneficiaryBar = new BarChart({
      node: document.getElementById('beneficiary-barchart'),
      colors: STAKEHOLDER_COLORS, // TODO d3 overflow colors
      width: chartWidth,
      height: barHeight,
    })
  }
  charts.beneficiaryBar.update(beneficiaryBarData())
}

// Create or update the attribute bar chart
function updateAttributeBarChart() {
  if (!charts.attributeBar) {
    charts.attributeBar = new BarChart({
      node: document.getElementById('attribute-barchart'),
      colorMap: extractColorMap(BENEFICIARIES),
      labels: Object.keys(BENEFICIARIES),
      width: chartWidth,
      height: barHeight,
    })
  }
  charts.attributeBar.update(attributeBarData())
}


// Format data for the criteria (and stakeholder) pie chart
function criteriaPieData(short=true) {
  const data = [];
  Object.entries(fegsScopingData.scores).forEach(row => {
    const label = fegsScopingData.criteriaMapOldToNew[row[0]]
    const shortLabel = CRITERIA[label].short // may be undefined
    data.push({
      key: label, // used for colorMap
      label: (short && shortLabel) ? shortLabel : label,
      value: parseFloat(row[1]),
    });
  });
  return data;
}

// Format data for the stakeholder bar chart
function stakeholderBarData() {
  const data = []
  Object.entries(fegsScopingData.stakeholders).forEach(([key, val]) => {
    const item = { key }
    Object.entries(val.scores).forEach(([key2, val2]) => {
      const label = CRITERIA[fegsScopingData.criteriaMapOldToNew[key2]].short || fegsScopingData.criteriaMapOldToNew[key2]
      item[label] = val2*(fegsScopingData.scores[key2]/sum(fegsScopingData.scores))
    })
    data.push(item)
  })
  return data // [{ key: str, label1: num, label2: num, ... }, ...]
}

// Format data for the beneficiary bar chart
function beneficiaryBarData() {
  const data = [];
  fegsScopingData.fegsBeneficiaries.forEach(beneficiary => {
    const item = { key: beneficiary }
    Object.entries(fegsScopingData.stakeholders).forEach(([key, val]) => {
      if (beneficiary in val.beneficiaries && val.beneficiaries[beneficiary].percentageOfStakeholder !== '') {
        item[key] = fegsScopingData.beneficiaryScoreForStakeholder(beneficiary, key)
      }
    })
    if (Object.keys(item).length > 1) data.push(item) // more than just the key
  })
  return data // [{ key: str, label1: num, label2: num, ... }, ...]
}

// Format data for the attribute bar chart
function attributeBarData() {
  const data = [];
  Object.keys(fegsScopingData.calculateAttributeScores()).forEach(attribute => {
    const { attribute: key, ...item } = fegsScopingData.calculateAttributeScoresTier1(attribute)
    item.key = key // rename 'attribute' property to 'key'
    data.push(item);
  })
  return data;
}


// Format the beneficiary scores for the beneficiary pie chart
function getBeneficiaryScoresForPieChart() {
  const data = [];
  for (let i = 0; i < fegsScopingData.fegsBeneficiaries.length; i += 1) {
    const bene = {};
    bene.label = fegsScopingData.fegsBeneficiaries[i];
    bene.value = fegsScopingData.beneficiaryScore(fegsScopingData.fegsBeneficiaries[i]);
    data.push(bene);
  }
  return data;
}

// Updates the beneficiary section charts
function updateBeneficiaryView() {
  updateBeneficiaryBarChart();
  updateBeneficiaryPieChart();
};


/** Add an option to an HTML select menu. Provide the text and the value. */
const addOption = function addOption(selectId, optionText, optionValue) {
  const select = document.getElementById(selectId);
  const optionToAdd = document.createElement('option');
  optionToAdd.innerText = optionText;
  optionToAdd.value = optionValue;
  select.add(optionToAdd);
};

// Updates the Select a Beneficiary HTML input with the current available beneficiaries
const updateSelectBeneficiary = function updateSelectBeneficiary(selectId) {
  const select = document.getElementById(selectId);
  const beneficiaries = fegsScopingData.getExtantBeneficiaries();
  const tier1Beneficiaries = [];
  const selectedValue = select.value;

  for (let i = select.options.length - 1; i >= 0; i -= 1) {
    // remove all options
    select.options[i].remove();
  }

  for (let i = 0; i < beneficiaries.length; i += 1) {
    // add option for each stakeholder
    const tier1Beneficiary = fegsScopingData.fegsBeneficiariesTier1[beneficiaries[i]];

    if (!tier1Beneficiaries.includes(tier1Beneficiary)) {
      tier1Beneficiaries.push(tier1Beneficiary);
      addOption(selectId, tier1Beneficiary, tier1Beneficiary);

      if (tier1Beneficiary === selectedValue) {
        select.selectedIndex = tier1Beneficiaries.length - 1;
      }
    }
  }
};

/**
 * Displays the data for the selected beneficiary in the attributes table
 * @function
 */
const showSelectedBeneficiary = element => {
  const { value } = element;
  const beneficiariesToShow = [];

  fegsScopingData.getExtantBeneficiaries().forEach(beneficiary => {
    if (fegsScopingData.fegsBeneficiariesTier1[beneficiary] === value) {
      beneficiariesToShow.push(beneficiary);
    }
  });

  tableAttributes.showOnlyTheseColumns(beneficiariesToShow);
  displayAttributesforSelectedBeneficiary();
};


/**
 * Formats the attribute scores for the attribute pie chart
 * @function
 */
function getAttributeScoresForPieChart() {
  const data = [];
  let sumOfBeneficiaryScores = 0;
  for (let i = 0; i < fegsScopingData.getExtantBeneficiaries().length; i += 1) {
    sumOfBeneficiaryScores += fegsScopingData.beneficiaryScore(
      fegsScopingData.getExtantBeneficiaries()[i]
    );
  }

  for (let i = 0; i < fegsScopingData.fegsAttributes.length; i += 1) {
    let total = 0;

    for (let j = 0; j < Object.keys(fegsScopingData.attributes).length; j += 1) {
      const beneficiary = Object.keys(fegsScopingData.attributes)[j];
      const percentage = parseInt(
        fegsScopingData.attributes[beneficiary][fegsScopingData.fegsAttributes[i]]
          .percentageOfBeneficiary,
        10
      );

      if (Number.isInteger(percentage) && percentage !== 0) {
        total += percentage * fegsScopingData.beneficiaryScore(beneficiary);
      }
    }

    if (total !== 0) {
      const datum = {};
      datum.label = fegsScopingData.fegsAttributes[i];
      datum.value = total / sumOfBeneficiaryScores;
      data.push(datum);
    }
  }
  return data;
}

/**
 * Formats the data by the TIER 1 beneficiary categories for display in the beneficiary pie chart
 * @function
 */
function getTier1BeneficiaryScoresForPieChart() {
  const temp = {};
  const beneficiaryData = getBeneficiaryScoresForPieChart();
  for (let i = 0; i < beneficiaryData.length; i += 1) {
    if (
      !Object.prototype.hasOwnProperty.call(
        temp,
        fegsScopingData.fegsBeneficiariesTier1[beneficiaryData[i].label]
      )
    ) {
      temp[fegsScopingData.fegsBeneficiariesTier1[beneficiaryData[i].label]] =
        beneficiaryData[i].value;
    } else {
      temp[fegsScopingData.fegsBeneficiariesTier1[beneficiaryData[i].label]] +=
        beneficiaryData[i].value;
    }
  }
  const tier1 = [];
  const tier1Beneficiaries = [...new Set(Object.values(fegsScopingData.fegsBeneficiariesTier1))];
  for (let i = 0; i < tier1Beneficiaries.length; i += 1) {
    if (Object.prototype.hasOwnProperty.call(temp, tier1Beneficiaries[i])) {
      tier1.push({ label: tier1Beneficiaries[i], value: temp[tier1Beneficiaries[i]] });
    } else {
      tier1.push({ label: tier1Beneficiaries[i], value: 0 });
    }
  }
  return tier1;
}

/**
 * Formats the data for the TIER 1 attributes for use in the attribute table
 * @function
 */
function getTier1AttributeScoresForPieChart() {
  const temp = {};
  const attributeData = getAttributeScoresForPieChart();
  for (let i = 0; i < attributeData.length; i += 1) {
    if (
      !Object.prototype.hasOwnProperty.call(
        temp,
        fegsScopingData.fegsAttributesTier1[attributeData[i].label]
      )
    ) {
      temp[fegsScopingData.fegsAttributesTier1[attributeData[i].label]] = attributeData[i].value;
    } else {
      temp[fegsScopingData.fegsAttributesTier1[attributeData[i].label]] += attributeData[i].value;
    }
  }
  const tier1 = [];
  for (let i = 0; i < fegsScopingData.tier1.length; i += 1) {
    if (Object.prototype.hasOwnProperty.call(temp, fegsScopingData.tier1[i])) {
      tier1.push({ label: fegsScopingData.tier1[i], value: temp[fegsScopingData.tier1[i]] });
    } else {
      tier1.push({ label: fegsScopingData.tier1[i], value: 0 });
    }
  }
  return tier1;
}

/**
 * Update the attribute section view of the application
 * @function
 */
function updateAttributeView() {
  fegsScopingView.displayBeneficiaryScores(); // table-attributes
  fegsScopingView.restoreAttributes(); // table-attributes
  updateSelectBeneficiary('select-beneficiary');
  showSelectedBeneficiary(document.getElementById('select-beneficiary'));

  updateAttributePieChart()
  updateAttributeBarChart();
}

/**
 * Updates the attribute progress on the left menu 
 * @function
 */
function updateAttributeProgress() {
  const beneficiaryCount = fegsScopingData.getExtantBeneficiaries().length;
  if (beneficiaryCount === 0) {
    document.getElementById('attributes-progress').innerHTML = 'Add a beneficiary';
    return;
  }
  let completeCount = 0;

  for (let i = 0; i < Object.keys(fegsScopingData.attributes).length; i += 1) {
    const beneficiary = Object.keys(fegsScopingData.attributes)[i];
    const attributes = Object.keys(fegsScopingData.attributes[beneficiary]);
    for (let j = 0; j < attributes.length; j += 1) {
      const attribute = attributes[j];
      if (fegsScopingData.attributes[beneficiary][attribute].percentageOfBeneficiary !== '') {
        completeCount += 1;
        break;
      }
    }
  }

  document.getElementById(
    'attributes-progress'
  ).innerHTML = `${completeCount} of ${beneficiaryCount} beneficiaries completed`;
}

/**
 * Updates the left menu with the current stakeholder progress
 * @function
 */
function updateStakeholderProgress() {
  const stakeholderCount = Object.keys(fegsScopingData.stakeholders).length;
  if (stakeholderCount === 0) {
    document.getElementById('stakeholder-progress').innerHTML = 'Add a stakeholder';
    return;
  }
  let newText = '';

  const stakeholders = Object.entries(fegsScopingData.stakeholders);

  stakeholders.forEach(stakeholder => {
    let completeCount = 0;
    let added = false;
    const criteria = Object.keys(fegsScopingData.stakeholders[stakeholder[0]].scores);

    for (let i = 0; i < criteria.length; i += 1) {
      const criterion = criteria[i];
      if (stakeholder[1].scores[criterion]) {
        newText += `${stakeholder[0]}: added<br />`;
        added = true;
        break;
      } else {
        const inputScore = document.getElementById(`${stakeholder[0]}-${criterion}`).value;
        if (inputScore !== '' && inputScore <= 100 && inputScore > 0) {
          completeCount += 1;
        }
      }
    }

    if (!added) {
      newText += `${stakeholder[0]}: ${completeCount}/${
        Object.keys(fegsScopingData.stakeholders[stakeholder[0]].scores).length
        } criteria entered<br />`;
    }
  });

  document.getElementById('stakeholder-progress').innerHTML = newText;
  updateBeneficiaryProgress();
}

/**
 * Listens for CTRL + + to increase text size
 * @listens 
 */
document.addEventListener('keydown', zEvent => {
  if (zEvent.ctrlKey && zEvent.key === '+') {
    const element = document.querySelector('#page-zoom');
    element.value =
      Number(element.value) + 0.05 > 2 ? Number(element.value) : Number(element.value) + 0.05;
    const change = new Event('change');
    const input = new Event('input');
    element.dispatchEvent(change);
    element.dispatchEvent(input);
  }
});

/**
 * Listens for CTRL + + to decrease text size
 * @listens
 */
document.addEventListener('keydown', zEvent => {
  if (zEvent.ctrlKey && zEvent.key === '-') {
    const element = document.querySelector('#page-zoom');
    element.value =
      +element.value - 0.05 < 0.25 ? Number(element.value) : Number(element.value) - 0.05;
    const change = new Event('change');
    const input = new Event('input');
    element.dispatchEvent(change);
    element.dispatchEvent(input);
  }
});

/** Prototype data-model and its CRUD-methods. */
const FEGSScopingData = function FEGSScopingData(criteria, beneficiaries, attributes) {
  // constructor()...
  
  this.criteria = [ // TODO refactor to stop using this stupid thing
    'magnitude',
    'influence',
    'interest',
    'urgency',
    'proximity',
    'economic-interest',
    'rights',
    'fairness',
    'representation'
  ]; // [oldname, ...]
  this.fegsCriteria = [] // [newname, ...]
  this.criteriaMapOldToNew = {} // { oldname: newname, ... }
  this.criteriaMapNewToOld = {} // { newname: oldname, ... }

  Object.keys(criteria).forEach(key => this.fegsCriteria.push(key))
  this.criteria.forEach(key => {
    const search = key.slice(0, 5) // first 5 chars
    const newName = this.fegsCriteria.find(item => item.toLowerCase().includes(search))
    this.criteriaMapOldToNew[key] = newName
    this.criteriaMapNewToOld[newName] = key
  })

  this.fegsBeneficiaries = [] // [beneficiary, ...]
  this.fegsBeneficiariesTier1 = {} // {beneficiary: tier, ...}

  Object.entries(beneficiaries).forEach(([key, value]) => {
    Object.keys(value.parts).forEach(key2 => {
      this.fegsBeneficiaries.push(key2)
      this.fegsBeneficiariesTier1[key2] = key
    })
  })

  this.tier1 = [] // [tier, ...]
  this.fegsAttributes = [] // [attribute, ...]
  this.fegsAttributesTier1 = {} // {attribute: tier, ...}

  Object.entries(attributes).forEach(([key, value]) => {
    this.tier1.push(key)
    Object.keys(value.parts).forEach(key2 => {
      this.fegsAttributes.push(key2)
      this.fegsAttributesTier1[key2] = key
    })
  })

  /**
   * This object-factory sets value as specified in arg criteria
   *  else to defaultValue.
   *
   * @param {string|Object.<string, string>} values - a single
   *  string to use as a value for all criteria or an object
   *  specifying each value as a numerical string indexed by
   *  its criterion
   */
  this.makeCriteriaObject = function makeCriteriaObject(values) {
    const valuesObject = {};
    const defaultValue = '';
    let valuesCriteria;

    if (typeof values === 'string') {
      for (let i = 0; i < this.criteria.length; i += 1) {
        valuesObject[this.criteria[i]] = values;
      }
      return valuesObject;
    }
    if (typeof values === 'object') {
      if (values.length) {
        throw Error('Argument values should be an object or a string but values is neither.');
      }
      valuesCriteria = Object.keys(values);

      for (let i = 0; i < valuesCriteria.length; i += 1) {
        if (String(this.criteria.indexOf(String(valuesCriteria[i]))) === '-1') {
          throw Error(`An unkown criterion was supplied as a key: ${valuesCriteria[i]}`);
        }
        valuesObject[valuesCriteria[i]] = values[valuesCriteria[i]];
      }

      for (let i = 0; i < this.criteria.length; i += 1) {
        if (valuesCriteria.indexOf(this.criteria[i]) === -1) {
          valuesObject[this.criteria[i]] = defaultValue;
        }
      }
      return valuesObject;
    }
    throw Error('expected values to be an object or a string but was neither');
  };

  /**
   * add a stakeholder and its criteria-scores
   * @param {string} stakeholderName - name of stakeholder to add
   * @param {Object <string>.<string>} stakeholderScores -
   *  criteria are keys and respective scores for this
   *  stakeholder are values
   */
  this.addStakeholder = function addStakeholderToFEGSData(stakeholderName, stakeholderScores) {
    this.stakeholders[stakeholderName] = {
      scores: stakeholderScores,
      beneficiaries: {},
      noBenefit: false, // stakeholder does not benefit from the environment
      lastBeneficiaries: {}, // remember previous entries when noBenefit is selected
    };
  };

  /**
   * update a stakeholder and its criteria-scores
   * @param {string} stakeholderName - name of stakeholder to add
   * @param {Object <string>.<string>} stakeholderScores -
   *  criteria are keys and respective scores for this
   *  stakeholder are values
   */
  this.updateStakeholder = function updateStakeholder(stakeholderName, stakeholderScores) {
    this.stakeholders[stakeholderName] = {
      scores: stakeholderScores,
      beneficiaries: this.stakeholders[stakeholderName].beneficiaries
    };
  };

  /**
   * rename oldStakeholderName to newStakeholderName
   * @param {string} oldStakeholderName - current name of the stakeholder
   * @param {string} newStakeholderName - new name of the stakeholder
   */
  this.renameStakeholder = function renameStakeholder(oldStakeholderName, newStakeholderName) {
    this.stakeholders[newStakeholderName] = this.stakeholders[oldStakeholderName];
    this.removeStakeholders([oldStakeholderName]);
  };

  /**
   * add a beneficiary and its percentage of its stakeholder
   * @param {string} stakeholderName - owner of beneficiary
   */
  this.addBeneficiary = function addBeneficiary(
    stakeholderName,
    beneficiaryName,
    percentageOfStakeholder = ''
  ) {
    this.stakeholders[stakeholderName].beneficiaries[beneficiaryName] = {
      percentageOfStakeholder
    };
  };

  /**
   * add attributes to this.attributes
   * @param {string} beneficiaryName - owner of attributes
   * @param {Object <string>.<string>} attributes - keys are
   *  attribute-names and values are percentages of the
   *  corresponding attributes' owning beneficiary
   */
  this.addAttributes = function addAttributes(beneficiaryName, attributes) {
    if (typeof this.attributes === 'undefined') {
      this.attributes = {};
    }
    this.attributes[beneficiaryName] = {};
    const keys = Object.keys(attributes);
    for (let i = 0; i < keys.length; i += 1) {
      this.attributes[beneficiaryName][keys[i]] = {
        percentageOfBeneficiary: attributes[keys[i]]
      };
    }
  };

  /**
   * Clears attributes that are not used by current beneficiaries
   * @function
   */
  this.clearOtherAttributes = function clearOtherAttributes(beneficiaries) {
    for (let i = 0; i < this.fegsBeneficiaries.length; i += 1) {
      if (beneficiaries.indexOf(this.fegsBeneficiaries[i]) < 0) {
        const attributes = this.attributes[this.fegsBeneficiaries[i]];

        if (typeof attributes === 'array') {
          attributes.forEach(attribute => {
            this.attributes[this.fegsBeneficiaries[i]][attribute].percentageOfBeneficiary = '';
          });
        }
      }
    }
  };

  /**
   * remove stakeholders named in an array
   * @param {Array.<string>} stakeholdersArray - names of
   *  stakeholders to be removed
   */
  this.removeStakeholders = function removeStakeholders(stakeholdersArray) {
    for (let i = 0; i < stakeholdersArray.length; i += 1) {
      delete this.stakeholders[stakeholdersArray[i]];
    }
  };

  /**
   * remove beneficiaries named in an object of arrays
   *  where each key is a stakeholder's name and the
   *  corresponding array's elements are the
   *  beneficiaries owned by that stakeholder who are
   *  to be removed
   * @param {Object.<string,Array.<string>>} beneficiariesObject -
   *  beneficiaries to be removed specified as an object like
   *  {stakeholderName: [beneficiaryName]}
   */
  this.removeBeneficiariesFromStakeholder = function removeBeneficiariesFromStakeholder(
    beneficiariesObject
  ) {
    const stakeholdersArray = Object.keys(beneficiariesObject);
    for (let i = 0; i < stakeholdersArray.length; i += 1) {
      const beneficiariesArray = beneficiariesObject[stakeholdersArray[i]];
      for (let j = 0; j < beneficiariesArray.length; j += 1) {
        delete this.stakeholders[stakeholdersArray[i]].beneficiaries[beneficiariesArray[j]];
      }
    }
  };

  /**
   * completely remove beneficiaries named in an array:
   *  remove listed beneficiaries from all stakeholders
   *  and from the keys of this.attributes
   * @param {Array.<string>} beneficiariesArray -
   *  beneficiaries to be removed specified as an object like
   *  [beneficiaryName]
   */
  this.removeBeneficiariesCompletely = function removeBeneficiariesCompletely(beneficiariesArray) {
    const stakeholdersArray = Object.keys(this.stakeholders);
    for (let i = 0; i < stakeholdersArray.length; i += 1) {
      for (let j = 0; j < beneficiariesArray.length; j += 1) {
        delete this.stakeholders[stakeholdersArray[i]].beneficiaries[beneficiariesArray[j]];
        delete this.attributes[beneficiariesArray[j]];
      }
    }
  };

  /**
   * remove attributes named in an array
   * @param {Array.<string>} attributesArray -
   *  attributes to be removed specified like
   *  [attributeName]
   */
  this.removeAttributesCompletely = function removeAttributesCompletely(attributesArray) {
    const beneficiariesArray = Object.keys(this.attributes);
    for (let j = 0; j < beneficiariesArray.length; j += 1) {
      for (let k = 0; k < attributesArray.length; k += 1) {
        delete this.attributes[beneficiariesArray[k]][attributesArray[k]];
      }
    }
  };

  /** assign properties of valuesObject to this */
  this.add = function add(valuesObject) {
    Object.assign(this, valuesObject);
  };

  /**
   * sum percentageOfStakeholder for all optionally specified
   *  beneficiaries for each optionally specified stakeholder;
   *  if no stakeholders are specified then sum over all;
   *  if no beneficiaries are specified then sum over all;
   * @param {Array.<string>} stakeholderNames - names of
   *  stakeholders over whom to sum; sum over all if undefined
   * @param {Array.<string>} beneficiariesArray - names of
   *  beneficiaries over whom to sum; sum over all if undefined
   */
  this.sumBeneficiaryPercentages = (
    stakeholderNames,
    beneficiaryNames = Object.keys(this.stakeholders)
  ) => {
    let beneficiaryArray = [];
    if (typeof beneficiaryNames === 'undefined') {
      beneficiaryArray = this.fegsBeneficiaries;
    } else {
      beneficiaryArray = beneficiaryNames;
    }
    let total = 0;
    for (let i = 0; i < stakeholderNames.length; i += 1) {
      for (let j = 0; j < beneficiaryArray.length; j += 1) {
        total += +this.stakeholders[stakeholderNames[i]].beneficiaries[beneficiaryArray[j]]
          .percentageOfStakeholder;
      }
    }
    return total;
  };

  /**
   * sum percentageOfBeneficiary for all optionally specified
   *  attributes for each optionally specified beneficiary;
   *  if no beneficiaries are specified then sum over all;
   *  if no attributes are specified then sum over all;
   * @param {Array.<string>} beneficiaryNames - names of
   *  beneficiaries over whom to sum; sum over all if undefined
   * @param {Array.<string>} attributeNames - names of
   *  attributes over which to sum; sum over all if undefined
   */
  this.sumAttributePercentages = function sumAttributePercentages(
    beneficiaryNames = Object.keys(this.attributes),
    attributeNames
  ) {
    let total = 0;
    let attributeArray = [];
    for (let j = 0; j < beneficiaryNames.length; j += 1) {
      if (typeof attributeNames === 'undefined') {
        attributeArray = Object.keys(this.attributes[beneficiaryNames[j]]);
      } else {
        attributeArray = attributeNames;
      }
      for (let k = 0; k < attributeArray.length; k += 1) {
        total += +this.attributes[beneficiaryNames[j]][attributeArray[k]].percentageOfBeneficiary;
      }
    }
    return total;
  };

  /**
   * return {..., benName_i: percentageOfStakeholder_i, ...}
   *  for the named stakeholder
   */
  this.getEachBeneficiaryPercentage = function getEachBeneficiaryPercentage(stakeholderName) {
    const percentages = {};
    const beneficiaryNames = Object.keys(this.stakeholders[stakeholderName].beneficiaries);
    for (let i = 0; i < beneficiaryNames.length; i += 1) {
      percentages[beneficiaryNames[i]] = this.stakeholders[stakeholderName].beneficiaries[
        beneficiaryNames[i]
      ].percentageOfStakeholder;
    }
    return percentages;
  };

  /**
   * return the sum of scores times stakeholder-score
   *  for each criterion
   * @param {string} stakeholders - stakeholder whose scores
   *  will be summed
   */
  this.scoresTimesScoresSum = function scoresTimesScoresSum(stakeholder) {
    let total = 0;
    Object.keys(this.scores).forEach(criteria => {
      const score1 = this.scores[criteria] || 0
      const score2 = this.stakeholders[stakeholder].scores[criteria] || 0
      total += score1*score2;
    })
    return total;
  };

  /**
   * return the sum of beneficiary-scores for all stakeholders
   * @param {string} beneficiary - beneficiary whose
   *  scores are summed
   */
  this.beneficiaryScore = function beneficiaryScore(beneficiary) {
    const stakeholders = Object.keys(this.stakeholders);
    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < stakeholders.length; i += 1) {
      if (Object.keys(this.stakeholders[stakeholders[i]].beneficiaries).length) {
        const percentageOfStakeholder = parseFloat(
          this.stakeholders[stakeholders[i]].beneficiaries[beneficiary].percentageOfStakeholder
        );
        if (!Number.isNaN(Number.parseFloat(percentageOfStakeholder))) {
          numerator +=
            percentageOfStakeholder * parseFloat(this.scoresTimesScoresSum(stakeholders[i]));
        }
      }
    }
    for (let j = 0; j < stakeholders.length; j += 1) {
      denominator += parseFloat(this.scoresTimesScoresSum(stakeholders[j]));
    }
    return numerator / denominator;
  };

  /**
   * return the sum of beneficiary-scores for all stakeholders
   * @param {string} beneficiary - beneficiary whose
   *  scores are summed
   */
  this.beneficiaryScoreForStakeholder = function beneficiaryScoreForStakeholder(
    beneficiary,
    stakeholder
  ) {
    let numerator = 0;
    let denominator = 0;
    if (Object.keys(this.stakeholders[stakeholder].beneficiaries).length) {
      const percentageOfStakeholder = parseFloat(
        this.stakeholders[stakeholder].beneficiaries[beneficiary].percentageOfStakeholder
      );
      if (Number.isNaN(Number.parseFloat(percentageOfStakeholder))) {
        return 0;
      }
      numerator += percentageOfStakeholder * this.stakeholderPrioritizationScoreSum(stakeholder);
    }
    denominator += this.sumOfStakeholderPrioritizationScores();
    return numerator / denominator;
  };

  /**
   * Calculates the attribute scores for the attributes chart
   * @function
   */
  this.calculateAttributeScores = function calculateAttributeScores() {
    const attributeScores = {};
    for (let i = 0; i < this.fegsAttributes.length; i += 1) {
      let total = 0;
      for (let j = 0; j < Object.keys(this.attributes).length; j += 1) {
        const beneficiary = Object.keys(this.attributes)[j];
        const percentage = parseInt(
          this.attributes[beneficiary][this.fegsAttributes[i]].percentageOfBeneficiary,
          10
        );
        if (Number.isInteger(percentage) && percentage !== 0) {
          total += percentage * this.beneficiaryScore(beneficiary);
        }
      }
      if (total !== 0) {
        attributeScores[this.fegsAttributes[i]] = total / 100;
      }
    }
    return attributeScores;
  };

  /**
   * Calculates the attributes scores for the attributes charts
   * @function
   */
  this.calculateAttributeScoresTier1 = function calculateAttributeScoresTier1(attribute) {
    const attributeScores = {};
    attributeScores.attribute = attribute;

    for (let j = 0; j < Object.keys(this.attributes).length; j += 1) {
      const beneficiary = Object.keys(this.attributes)[j];
      if (
        !Object.prototype.hasOwnProperty.call(
          attributeScores,
          fegsScopingData.fegsBeneficiariesTier1[beneficiary]
        )
      ) {
        attributeScores[fegsScopingData.fegsBeneficiariesTier1[beneficiary]] = 0;
      }
      const percentage = parseInt(
        this.attributes[beneficiary][attribute].percentageOfBeneficiary,
        10
      );
      if (Number.isInteger(percentage) && percentage !== 0) {
        attributeScores[fegsScopingData.fegsBeneficiariesTier1[beneficiary]] +=
          (percentage * this.beneficiaryScore(beneficiary)) / 100;
      }
    }
    return attributeScores;
  };

  /**
   * Calculates the attribute score ** NOT USED NOW
   * @function
   */
  this.calculateAttributeScore = function calculateAttributeScore(attribute) {
    let total = 0;

    for (let j = 0; Object.keys(this.attributes).length; j += 1) {
      const beneficiary = Object.keys(this.attributes)[j];
      const percentage = parseInt(
        this.attributes[beneficiary][attribute].percentageOfBeneficiary,
        10
      );
      if (Number.isInteger(percentage) && percentage !== 0) {
        total += percentage * this.beneficiaryScore(beneficiary);
      }
    }
    return total;
  };

  /**
   * return the sum of stakeholder-scores for all stakeholders
   * [stakeholder weight * relative weight / sum of relative weights]
   * @param {string} stakeholder - stakeholder whose
   *  scores are summed
   */
  this.stakeholderPrioritizationScores = function stakeholderPrioritizationScores(stakeholder) {
    const scores = {};
    for (let i = 0; i < this.criteria.length; i += 1) {
      const criterion = this.criteria[i];
      scores[criterion] =
        (this.stakeholders[stakeholder].scores[criterion] * this.scores[criterion]) /
        this.calculateOverallScore();
    }
    return scores;
  };

  /**
   * Calculates the stake holder priorization score for a particular stakeholder
   * @function
   */
  this.stakeholderPrioritizationScoreSum = function stakeholderPrioritizationScoreSum(stakeholder) {
    let score = 0;
    for (let i = 0; i < this.criteria.length; i += 1) {
      const criterion = this.criteria[i];
      score +=
        (this.stakeholders[stakeholder].scores[criterion] * this.scores[criterion]) /
        this.calculateOverallScore();
    }
    return score;
  };

  /**
   * Sums up the stakeholder prioritization scores for all stakeholders
   * @function
   */
  this.sumOfStakeholderPrioritizationScores = function sumOfStakeholderPrioritizationScores() {
    let total = 0;
    for (let i = 0; i < Object.keys(this.stakeholders).length; i += 1) {
      const stakeholder = Object.keys(this.stakeholders)[i];
      total += this.stakeholderPrioritizationScoreSum(stakeholder);
    }
    return total;
  };

  /**
   * return the overall score (sum of relative weights)
   */
  this.calculateOverallScore = function calculateOverallScore() {
    const elements = Object.values(this.scores);
    let overallScore = 0;
    for (let i = 0; i < elements.length; i += 1) {
      overallScore += +elements[i];
    }
    return overallScore;
  };

  /** return current array of extant beneficiaries */
  this.getExtantBeneficiaries = function getExtantBeneficiaries() {
    const extantStakeholders = Object.keys(this.stakeholders);
    const extantBeneficiaries = [];
    for (let i = 0; i < extantStakeholders.length; i += 1) {
      const beneficiaries = Object.keys(this.stakeholders[extantStakeholders[i]].beneficiaries);
      for (let j = 0; j < beneficiaries.length; j += 1) {
        if (
          extantBeneficiaries.indexOf(beneficiaries[j]) === -1 &&
          this.stakeholders[extantStakeholders[i]].beneficiaries[beneficiaries[j]]
            .percentageOfStakeholder !== ''
        ) {
          extantBeneficiaries.push(beneficiaries[j]);
        }
      }
    }
    return extantBeneficiaries;
  };

  /**
   * Updates the name of the project
   * @function
   */
  this.updateName = function updateName(name) {
    this.projectName = name;
    ipcRenderer.send('update-project-name', this.projectName);
  };

  /**
   * Updates the project description
   * @function
   */
  this.updateDescription = function updateDescription(description) {
    this.projectDescription = description;
  };


  // constructor()...
  this.appName = appTitle;
  this.version = app.getVersion() || '1.0.0';
  this.projectName = 'New Project';
  this.projectDescription = '';
  this.notes = {
    criteria: '',
    stakeholders: '',
    beneficiaries: '',
    attributes: ''
  };
  this.filePath = '';
  this.scores = this.makeCriteriaObject('0');
  this.stakeholders = {};
  this.attributes = {};
}; // END PROTOTYPE FEGScopingData

/** Prototype controller of communication between data and view */
const FEGSScopingController = function FEGSScopingController() {
  /** scrape data from the page and save the data */
  this.saveView = function saveView() {
    let returnValue;
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.indexOf(' electron/') > -1) {
      // true if in NODE's ELECTRON
      returnValue = this.saveJSON('data.json', fegsScopingView.scrapePage());
    } else {
      // else is selected if this instance appears to be running in the browser
      returnValue = this.downloadText('data.json', JSON.stringify(fegsScopingView.scrapePage()));
    }
    return returnValue;
  };

  /** save validated data */
  this.saveValidatedData = function saveValidatedData(filename = 'data.json') {
    this.saveJSON(filename, fegsScopingData);
    fegsScopingView.indicateSaved(filename);
  };

  /** update name of an instance of the app */
  this.updateName = function updateName(name) {
    fegsScopingView.updateName(name);
    fegsScopingData.updateName(name);
  };

  /**
   * Updates the project description
   * @function
   */
  this.updateDescription = function updateDescription(description) {
    fegsScopingView.updateDescription(description);
    fegsScopingData.updateDescription(description);
  };

  /**
   * gets the current stakeholder from the #select-stakeholder HTML input
   * @function
   */
  this.getCurrentStakeholder = function getCurrentStakeholder() {
    return fegsScopingView.getCurrentStakeholder();
  };

  /** scrape state of page */
  this.scrapePage = function scrapePage() {
    const scores = {};
    const beneficiaries = {};
    const attributes = {};

    for (let i = 0; i < fegsScopingData.criteria.length; i += 1) {
      // save view-state of #table-scores
      scores[`${fegsScopingData.criteria[i]}-score`] = document.getElementById(
        `${fegsScopingData.criteria[i]}-score`
      ).value;
    }
    if (document.getElementById('table-beneficiaries').rows[0].cells.length > 2) {
      // scrape #table-beneficiaries conditioned upon whether table-beneficiaries is populated
      for (let i = 0; i < fegsScopingData.fegsBeneficiaries.length; i += 1) {
        // loop through each row of the table
        if (+document.getElementById('table-beneficiaries').rows[i + 1].cells.length < 3) {
          // does the row have two th-elements?
          beneficiaries[fegsScopingData.fegsBeneficiaries[i]] = document.getElementById(
            'table-beneficiaries'
          ).rows[i + 1].cells[1].firstChild.value; // scrape this beneficiary's value
        } else {
          // the row appears to have only one th as a label
          beneficiaries[fegsScopingData.fegsBeneficiaries[i]] = document.getElementById(
            'table-beneficiaries'
          ).rows[i + 1].cells[2].firstChild.value; // scrape this beneficiary's value
        }
      }
    } else {
      // no beneficiaries are populated into #table-beneficiaries
      // console.log('no attributes recorded from view');
    }
    for (let i = 0; i < fegsScopingData.fegsBeneficiaries.length; i += 1) {
      attributes[fegsScopingData.fegsBeneficiaries[i]] = {};
      for (let j = 0; j < fegsScopingData.fegsAttributes.length; j += 1) {
        attributes[fegsScopingData.fegsBeneficiaries[i]][
          fegsScopingData.fegsAttributes[j]
        ] = tableAttributes.cellInputValue(
          tableAttributes.cell(
            fegsScopingData.fegsAttributes[j],
            fegsScopingData.fegsBeneficiaries[i]
          )
        );
      }
    }

    const scrapedValues = {
      scores,
      beneficiaries,
      attributes
    };
    return scrapedValues;
  };

  /** save json to file; requires ELECTRON */
  this.saveJSON = function saveJSON(savePath, jsonToBeSaved) {
    let jsonText;
    if (typeof jsonToBeSaved !== 'string') {
      jsonText = JSON.stringify(jsonToBeSaved);
    } else {
      jsonText = jsonToBeSaved;
    }
    fs.writeFileSync(savePath, jsonText);
    ipcRenderer.send('has-been-saved', savePath);
  };

  /** save json to file, then refresh; requires ELECTRON */
  this.saveJSONAndRefresh = function saveJSONAndRefresh(savePath, jsonToBeSaved) {
    let jsonText;
    if (typeof jsonToBeSaved !== 'string') {
      jsonText = JSON.stringify(jsonToBeSaved);
    } else {
      jsonText = jsonToBeSaved;
    }
    fs.writeFileSync(savePath, jsonText);
    ipcRenderer.send('has-been-saved', savePath);
    window.location.reload(true);
  };

  /** download given text to given filename; works in BROWSER */
  this.downloadText = function downloadText(filename, text) {
    const element = document.createElement('a');
    element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`);
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  /** read data-model from disk; requires ELECTRON */
  this.importData = function importData(filename) {
    let fileName = filename;
    if (typeof process === 'undefined' || !process.versions.electron) {
      // console.log('electron is needed for importing data');
      return null;
    }
    if (typeof fileName === 'undefined') {
      fileName = 'data.json';
    }
    let importedData = fs.readFileSync(fileName);
    importedData = JSON.parse(importedData);
    importedData = Object.assign(fegsScopingData, importedData);
    return importedData;
  };
}; // END PROTOTYPE FEGSScopingController

/** Prototype view to encapsulate representation. */
const FEGSScopingView = function FEGSScopingView() {
  /** initialize the view of the application */
  this.initializeView = function initializeView() {
    this.showName.style.display = 'inline-block';
    this.saveNameButton.style.display = 'none';
    this.projectName = fegsScopingData.projectName;
    this.projectNameMenu.innerHTML = this.projectName;
  };

  /** update name displayed in titlebar and header */
  this.updateName = function updateName(name) {
    this.projectNameMenu.innerHTML = name; // update the name shown
    this.projectName = name; // update the name of the view
    this.title = name; // call the name a title, too
    this.showName.style.display = 'inline-block';
    this.inputName.style.display = 'none';
    this.saveNameButton.style.display = 'none';
    this.indicateUnsaved()
  };

  /** update name displayed in titlebar and header */
  this.updateDescription = function updateDescription(description) {
    this.projectDescription = description; // update the description of the view
    this.showDescription.style.display = 'inline-block';
    this.inputDescription.style.display = 'none';
    this.saveDescriptionButton.style.display = 'none';
    this.inputDescription.value = description;
    this.indicateUnsaved()
  };

  /** input the name of this project */
  this.editName = function editName() {
    this.showName.style.display = 'none';
    this.inputName.style.display = 'inline-block';
    this.saveNameButton.style.display = 'inline-block';
    this.inputName.value = this.projectNameMenu.innerText;
  };

  /** save the name of this project */
  this.saveNameButton = function saveNameButton() {
    this.inputName.style.display = 'none';
    this.saveNameButton.style.display = 'none';
    this.showName.style.display = 'inline-block';
    this.changeName.style.display = 'inline-block';
    this.projectNameMenu.innerText = this.inputName.value;
    fegsScopingController.saveValidatedData();
    this.projectName = this.inputName.value;
  };

  /** input the name of this project */
  this.editDescription = function editDescription() {
    this.inputDescription.style.display = 'inline-block';
    this.saveDescriptionButton.style.display = 'inline-block';
  };

  /** save the name of this project */
  this.saveDescriptionButton = function saveDescriptionButton() {
    this.inputDescription.style.display = 'none';
    this.saveDescriptionButton.style.display = 'none';
    this.showDescription.style.display = 'inline-block';
    this.changeDescription.style.display = 'inline-block';
    fegsScopingController.saveValidatedData();
    this.projectDescription = this.inputDescription.value;
  };

  /** restore view's state: each input with a stored value restores that value */
  this.restoreView = function restoreView(filename = 'data.json') {
    let criterion;
    fegsScopingData = fegsScopingController.importData(filename);
    fegsScopingData.filePath = filename;
    fegsScopingController.updateName(fegsScopingData.projectName);
    fegsScopingController.updateDescription(fegsScopingData.projectDescription);
    for (let i = 0; i < fegsScopingData.criteria.length; i += 1) {
      criterion = fegsScopingData.criteria[i];
      const query = `.scoring input[data-criteria="${fegsScopingData.criteriaMapOldToNew[criterion]}"]`
      document.querySelector(query).value = fegsScopingData.scores[criterion];
    }

    // restore notes
    Object.keys(fegsScopingData.notes).forEach(section => {
      if (section in notes) notes[section].set(fegsScopingData.notes[section])
    });

    const hasStakeholder = (Object.keys(fegsScopingData.stakeholders).length > 0)

    // Run d3 chart functions
    if (hasStakeholder) {
      document.getElementById('beneficiary-charts').removeAttribute('hidden');
      document.getElementById('attribute-charts').removeAttribute('hidden');
    } else {
      document.getElementById('beneficiary-charts').setAttribute('hidden', true);
      document.getElementById('attribute-charts').setAttribute('hidden', true);
    }
    updateAllCharts()    

    // Display table data
    fegsScopingView.showStakeholderScores();
    fegsScopingView.displayBeneficiaryScores();
    fegsScopingView.restoreAttributes();
    updateSelectBeneficiary('select-beneficiary');
    showSelectedBeneficiary(document.getElementById('select-beneficiary'));

    // Update the progress on the left menu
    updateWeightingProgress();
    updateStakeholderProgress();
    updateBeneficiaryProgress();
    updateAttributeProgress();

    fegsScopingView.indicateSaved(filename);
  };

  /** indicate saved status */
  this.indicateSaved = function indicateSaved(filename = null) {
    // Set application title
    document.title = `${
      fegsScopingData.filePath !== ''
        ? fegsScopingData.filePath.slice(
          fegsScopingData.filePath.lastIndexOf('\\') + 1,
          fegsScopingData.filePath.length
        )
        : 'Untitled'
      } - ${appTitle}`;
    document.getElementById('unsaved-indicator').setAttribute('hidden', '');
    if (filename !== null) {
      ipcRenderer.send('has-been-saved', filename);
    }
  };

  /** indicate unsaved status */
  this.indicateUnsaved = function indicateUnsaved() {
    // Set application title
    document.title = `${
      fegsScopingData.filePath !== ''
        ? fegsScopingData.filePath.slice(
          fegsScopingData.filePath.lastIndexOf('\\') + 1,
          fegsScopingData.filePath.length
        )
        : 'Untitled'
      }* - ${appTitle}`;
    document.getElementById('unsaved-indicator').removeAttribute('hidden');
    ipcRenderer.send('has-been-changed');
  };

  /** save view's state: each input stores its own data */
  this.saveView = function saveView() {
    const inputs = document.querySelectorAll('input:not([type="radio"])');
    const radioInputs = document.querySelectorAll('input[type="radio"]');
    for (let i = 0; i < inputs.length; i += 1) {
      inputs[i].setAttribute('data-value', inputs[i].value);
    }
    for (let i = 0; i < radioInputs.length; i += 1) {
      radioInputs[i].setAttribute('data-checked', radioInputs[i].checked);
    }
    document.body.setAttribute('data-restore', 'true'); // set flag to automatically restore data on document load
  };

  this.pages = document.querySelectorAll('.page');
  const self = this;

  /** show only the identified page */
  this.focusPage = function focusPage(pageId) {
    const pages = document.querySelectorAll('.page');
    let pageIndex;
    for (pageIndex = 0; pageIndex < pages.length; pageIndex += 1) {
      if (pages[pageIndex].id === pageId) {
        pages[pageIndex].style.display = 'block';
      } else {
        pages[pageIndex].style.display = 'none';
      }
    }
    self.ensureNavigability(pageId);
  };

  /** add navigability if absent */
  this.ensureNavigability = function ensureNavigability(pageId) {
    let navigation;
    let back;
    let forward;
    if (!document.getElementById('sidebar').querySelector('.navigation')) {
      navigation = document.createElement('div');
      navigation.setAttribute('class', 'navigation');
      back = document.createElement('button');
      forward = document.createElement('button');
      back.id = 'back-nav-button';
      forward.id = 'forward-nav-button';
      back.innerHTML = 'Back';
      forward.innerHTML = 'Forward';
      back.style = 'margin-right: .2em;';
      back.onclick = function onclick() {
        const pages = document.querySelectorAll('.page');
        let pageIndex;
        let currentPageIndex;
        for (pageIndex = 0; pageIndex < pages.length; pageIndex += 1) {
          if (pages[pageIndex].style.display === 'block') {
            currentPageIndex = pageIndex;
            break;
          }
        }
        if (currentPageIndex - 1 === 0) {
          document.getElementById('back-nav-button').setAttribute('disabled', '');
        } else {
          document.getElementById('back-nav-button').removeAttribute('disabled');
        }
        if (currentPageIndex - 1 === pages.length - 1) {
          document.getElementById('forward-nav-button').setAttribute('disabled', '');
        } else {
          document.getElementById('forward-nav-button').removeAttribute('disabled');
        }
        if (currentPageIndex > 0) {
          self.focusPage(pages[currentPageIndex - 1].id);
        } else {
          // console.log('there is no page before the first page');
        }
      };
      forward.onclick = function onclick() {
        const pages = document.querySelectorAll('.page');
        // var currentPage = document.querySelector('.page[display="block"]');
        let pageIndex;
        let currentPageIndex;
        for (pageIndex = 0; pageIndex < pages.length; pageIndex += 1) {
          if (pages[pageIndex].style.display === 'block') {
            currentPageIndex = pageIndex;
            break;
          }
        }
        if (currentPageIndex + 1 === 0) {
          document.getElementById('back-nav-button').setAttribute('disabled', '');
        } else {
          document.getElementById('back-nav-button').removeAttribute('disabled');
        }
        if (currentPageIndex + 1 === pages.length - 1) {
          document.getElementById('forward-nav-button').setAttribute('disabled', '');
        } else {
          document.getElementById('forward-nav-button').removeAttribute('disabled');
        }
        if (currentPageIndex < pages.length - 1) {
          self.focusPage(pages[currentPageIndex + 1].id);
        } else {
          // console.log('there is no page after the last page');
        }
      };
      navigation.appendChild(back);
      navigation.appendChild(forward);
      document.getElementById('sidebar').appendChild(navigation);
    }
    if (pageId === 'section-weighting') {
      document.getElementById('back-nav-button').setAttribute('disabled', '');
    }
    if (pageId === 'section-attributes') {
      document.getElementById('forward-nav-button').setAttribute('disabled', '');
    }
  };

  /**
   * Updates the entire stakeholder section
   * @function
   */
  this.showStakeholderScores = function showStakeholderScores() {
    // Clear table
    for (let i = document.getElementById('table-stakeholders').rows.length - 1; i > 0; i -= 1) {
      document.getElementById('table-stakeholders').deleteRow(i);
    }
    // Add the rows
    Object.keys(fegsScopingData.stakeholders).forEach(stakeholder => {
      addRow('table-stakeholders', [stakeholder, fegsScopingData.stakeholders[stakeholder]]);
    });
    document.getElementById('set-stakeholder-values').style.display = 'none';
    document.getElementById('stakeholder-list').style.display = 'none';
    clearStakeholderScores();

    updateStakeholderBarChart();

    updateSelectStakeholder('select-stakeholder');
    const event = new Event('change');
    document.getElementById('select-stakeholder').dispatchEvent(event);
    updateStakeholderProgress();
    
    const display = (Object.keys(fegsScopingData.stakeholders).length > 0) ? 'block' : 'none'
    document.getElementById('stakeholder-table-container').style.display = display

    fegsScopingView.indicateUnsaved();
  };

  /**
   * Gets the current selected stakeholder
   * @function
   */
  this.getCurrentStakeholder = function getCurrentStakeholder() {
    return document.querySelector('#select-stakeholder').value;
  };

  /**
   * Checks if a stake holder is selected ** DEPRECATED **
   * @function
   * @deprecated
   */
  this.stakeholderIsSelected = function stakeholderIsSelected() {
    return Boolean(document.querySelector('#select-stakeholder').selectedIndex);
  };

  /** caculate and display beneficiary-scores */
  this.displayBeneficiaryScores = function displayBeneficiaryScores() {
    const table = tableAttributes;
    const columnNames = fegsScopingData.getExtantBeneficiaries();
    const rowNames = ['Beneficiary Result'];
    let cell;
    let cellValue;
    for (let i = 0; i < columnNames.length; i += 1) {
      cell = table.cell(rowNames[0], columnNames[i]);
      cellValue = fegsScopingData.beneficiaryScore(columnNames[i]);
      if (Number.isNaN(Number.parseFloat(cellValue))) {
        cellValue = 0;
      }
      if (cellValue === 0) {
        table.hideColumn(columnNames[i]);
      } else {
        table.showColumn(columnNames[i]);
      }
      cell.innerText = round(cellValue, 2);
    }
  };

  /**
   * Restores the attributes table from saved data.
   * @function
   */
  this.restoreAttributes = function restoreAttributes() {
    const table = tableAttributes;
    const rowNames = table.rowHeaders;
    const columnNames = table.columnHeaders;
    let cell;
    let input;

    for (let i = 0; i < rowNames.length; i += 1) {
      for (let j = 0; j < columnNames.length; j += 1) {
        if (Object.prototype.hasOwnProperty.call(fegsScopingData.attributes, columnNames[j])) {
          table.showColumn(columnNames[j]);
          cell = table.cell(rowNames[i], columnNames[j]);
          if (cell.querySelector('input') === null) {
            input = document.createElement('input');
            input.type = 'number';
            cell.appendChild(input);
          } else {
            input = cell.querySelector('input');
          }
          input.value =
            fegsScopingData.attributes[columnNames[j]][rowNames[i]].percentageOfBeneficiary;
        }
      }
    }
  };

  // PROCESS IN PROTOTYPE FEGSScopingView

  this.inputName = document.getElementById('input-name');
  this.showName = document.getElementById('show-name');
  this.projectNameMenu = document.getElementById('menu-project-name');
  this.saveNameButton = document.getElementById('save-name');
  this.changeNameButton = document.getElementById('change-name');

  this.inputDescription = document.getElementById('input-description');
  this.showDescription = document.getElementById('show-description');
  this.saveDescriptionButton = document.getElementById('save-description');

  this.initializeView();
}; // END PROTOTYPE FEGSScopingView

/**
 * interface cells indexed by row- and column-headers
 * @param {string} tableId - id of table to interface
 * @param {string[]} rowHeaders - headers of rows
 * @param {string[]} columnHeaders - headers of columns
 * @param {number} rowOffset - offset for tHead
 * @param {number} columnOffset - offset for header in row
 * @property {function} cell - return the HTMLElemtent of
 *  the cell specified by its row-header and column-header
 * @property {function} test - test the arrays of column-
 *  and row-headers against the table's headers
 */
const Table = function Table(tableId, rowHeaders, columnHeaders, rowOffset, columnOffset) {
  this.id = tableId;
  this.rowHeaders = rowHeaders;
  this.columnHeaders = columnHeaders;
  this.rowOffset = rowOffset;
  this.columnOffset = columnOffset;
  this.table = document.getElementById(tableId);
  this.hiddenClassName = 'display-none';
  this.spannedHeaders = this.table.rows[0].cells;
  this.colSpanOriginalValuePropertyName = 'data-colspan-original-value';
  this.cols = this.table.querySelectorAll('col');
  this.colCells = this.table.rows[0].cells;

  /** store an element's initial span in a uniformly named property of the element */
  this.storeInitialSpanOfCols = function storeInitialSpanOfCols() {
    let iCol;
    for (iCol = 0; iCol < this.cols.length; iCol += 1) {
      this.cols[iCol].setAttribute(this.colSpanOriginalValuePropertyName, this.cols[iCol].span);
    }
  };

  /** return the specified cell */
  this.cell = function cell(rowHeader, columnHeader) {
    const rowIndex = rowHeaders.indexOf(rowHeader) + this.rowOffset;
    const columnIndex = columnHeaders.indexOf(columnHeader) + this.columnOffset;
    return this.table.rows[rowIndex].cells[columnIndex];
  };

  /** test the table's construction */
  this.test = function test() {
    const rowHeaderColumnNumber = 0;
    const columnHeaderRowNumber = 1;
    const errors = [];

    for (let i = 0; i < rowHeaders.length; i += 1) {
      // test rowHeaders
      if (rowHeaders[i] !== this.table.rows[i + rowOffset].cells[rowHeaderColumnNumber].innerText) {
        errors.push(
          new Error(
            `rowHeaders mismatch: ${rowHeaders[i]} does not match ${this.table.rows[i + rowOffset].cells[rowHeaderColumnNumber].innerText}`
          )
        );
      }
    }
    for (let i = 0; i < columnHeaders.length; i += 1) {
      // test columnHeaders
      if (
        columnHeaders[i] !==
        this.table.rows[columnHeaderRowNumber].cells[columnOffset + i].innerText
      ) {
        errors.push(
          new Error(
            `columnHeaders mismatch: ${columnHeaders[i]} does not match ${this.table.rows[columnHeaderRowNumber].cells[columnOffset + i].innerText}`
          )
        );
      }
    }
    return errors;
  };

  /** return table's cells in an array of arrays */
  this.cells = function cells() {
    const cellsArray = [];
    for (let i = 0; i < this.table.rows.length; i += 1) {
      if (typeof cellsArray[i] === 'undefined') {
        cellsArray[i] = [];
      }
      for (let j = 0; j < this.table.rows[i]; j += 1) {
        cellsArray[i][j] = this.table.rows[i].cellsArray[j];
      }
    }
    return cellsArray;
  };

  /**
   * get or set value of the input in the supplied cell
   * @param {td or th object} cell - supplied cell containing an input-element
   * @param {string} setterValue - specifies the value to set the input to when present
   */
  this.cellInputValue = function cellInputValue(cell, setterValue) {
    const tableCell = cell;
    // if setterValue is present then set the input's value to setterValue
    if (typeof setterValue !== 'undefined') {
      tableCell.getElementsByTagName('input')[0].value = setterValue;
    }
    return tableCell.getElementsByTagName('input')[0].value;
  };

  /** get index of indicated column assuming numerical args are indices */
  this.getColumnIndex = function getColumnIndex(columnIndicator) {
    let val;
    if (
      Number.isNaN(Number.parseFloat(columnIndicator)) ||
      Number('1') !== Math.round(Number('1'))
    ) {
      // assume the argument is a heading-string if not coercible to NaN
      const unshiftedColumnIndex = this.columnHeaders.indexOf(columnIndicator);
      if (unshiftedColumnIndex === -1) {
        throw new Error(`columnIndicator not found: ${columnIndicator} in Table-instance `, this);
      }
      val = unshiftedColumnIndex + this.columnOffset;
    } else {
      // assume a numerical index was supplied if not coerced to NaN
      val = columnIndicator;
    }
    return val;
  };

  /** true if the indicated column is hidden else false */
  this.isHidden = function isHidden(columnIndicator) {
    return this.table.rows[1].cells[this.getColumnIndex(columnIndicator)].classList.contains(
      this.hiddenClassName
    );
  };

  /** true if the indicated col is hidden else false */
  this.isColHidden = function isColHidden(colIndicator) {
    let colIndex;
    if (Number.isNaN(Number(colIndicator))) {
      colIndex = this.cols.indexOf(colIndicator);
    } else {
      colIndex = colIndicator;
    }
    return this.cols[colIndex].classList.contains(this.hiddenClassName);
  };

  /** get index of col containing the indicated column */
  this.getColIndex = function getColIndex(columnIndicator) {
    const columnIndex = this.getColumnIndex(columnIndicator);
    let currentColOriginalSpan;
    let colIndex = 0;
    let colSpanIndex = 0;
    for (colIndex = 0; colIndex < this.cols.length; colIndex += 1) {
      currentColOriginalSpan = parseFloat(
        this.cols[colIndex].getAttribute(this.colSpanOriginalValuePropertyName)
      );
      if (colSpanIndex + currentColOriginalSpan > columnIndex) {
        return colIndex; // colIndex was the index of the col containing the indicated column
      }
      colSpanIndex += currentColOriginalSpan;
    }
    return null;
  };

  /** get name of indicated column */
  this.getColumnName = function getColumnName(columnIndicator) {
    const columnIndex = this.getColumnIndex(columnIndicator);
    return this.table.rows[rowOffset - 1].cells[columnIndex].innerText;
  };

  /** clear indicated column */
  this.clearColumn = function clearColumn(columnIndicator) {
    let rowIndex;
    const columnIndex = this.getColumnIndex(columnIndicator);
    for (rowIndex = 1; rowIndex < this.table.rows.length; rowIndex += 1) {
      if (this.table.rows[rowIndex].cells[columnIndex].querySelector('input')) {
        this.table.rows[rowIndex].cells[columnIndex].querySelector('input').value = '';
      }
    }
  };

  /** hide columns up to that indicated */
  this.hideColumnsUpTo = function hideColumnsUpTo(columnIndicator) {
    const targetColumnIndex = this.getColumnIndex(columnIndicator);
    for (let i = columnOffset; i < targetColumnIndex; i += 1) {
      this.hideColumn(i);
    }
  };

  /** hide indicated column */
  this.hideColumn = function hideColumn(columnIndicator) {
    let rowIndex;
    const columnIndex = this.getColumnIndex(columnIndicator);
    const colIndex = this.getColIndex(columnIndex);
    if (this.isHidden(columnIndex)) {
      return;
    }
    // hide col and its labelling headers if this is last column
    if (this.cols[colIndex].span === 1) {
      this.cols[colIndex].classList.add(this.hiddenClassName);
      this.colCells[colIndex].classList.add(this.hiddenClassName);
    } else {
      // decrement span and colspan
      this.cols[colIndex].span -= 1;
      this.colCells[colIndex].colSpan -= 1;
    }
    for (rowIndex = 1; rowIndex < this.table.rows.length; rowIndex += 1) {
      this.table.rows[rowIndex].cells[columnIndex].classList.add(this.hiddenClassName);
    }
  };

  /** show indicated column */
  this.showColumn = function showColumn(columnIndicator) {
    let rowIndex;
    const columnIndex = this.getColumnIndex(columnIndicator);
    const colIndex = this.getColIndex(columnIndex);
    if (!this.isHidden(columnIndex)) {
      // do nothing if already shown
      return;
    }
    if (!this.isColHidden(colIndex)) {
      // increment span and colspan
      this.cols[colIndex].span += 1;
      this.colCells[colIndex].colSpan += 1;
    }
    // show col and its labelling headers if this is the first visible column in col
    if (this.cols[colIndex].span === 1) {
      this.cols[colIndex].classList.remove(this.hiddenClassName);
      this.colCells[colIndex].classList.remove(this.hiddenClassName);
    }
    for (rowIndex = 1; rowIndex < this.table.rows.length; rowIndex += 1) {
      this.table.rows[rowIndex].cells[columnIndex].classList.remove(this.hiddenClassName);
    }
  };

  /** show only specified columns */
  this.showOnlyTheseColumns = function showOnlyTheseColumns(columnIndicators = []) {
    const columnIndices = [];
    for (let i = 0; i < columnIndicators.length; i += 1) {
      const columnIndex = this.getColumnIndex(columnIndicators[i]);
      this.showColumn(columnIndex);
      columnIndices.push(columnIndex);
    }
    for (let i = 3; i < this.table.rows[1].cells.length; i += 1) {
      if (columnIndices.indexOf(i) === -1) {
        // this.clearColumn(i);
        this.hideColumn(i);
      }
    }
  };

  this.showAttributeScores = function showAttributeScores() {
    this.showColumn('Attribute Score');
    for (let i = 0; i < this.rowHeaders.length; i += 1) {
      this.cell(
        this.rowHeaders[i],
        'Attribute Score'
      ).innerHTML = fegsScopingData.calculateAttributeScore(this.rowHeaders[i]);
    }
  };

  // this.hideRow = function (rowIndicator) {
  //   //TODO fill in stub s.t. rowIndicator can be a numerical index or a header-name
  // };

  // this.showRow = function (rowIndicator) {
  //   //TODO fill in stub s.t. rowIndicator can be a numerical index or a header-name
  // };

  // Table's PROCESS
  this.storeInitialSpanOfCols();
  let cell;
  for (let i = 0; i < this.table.rows.length; i += 1) {
    for (let j = 0; j < this.table.rows[i].cells.length; j += 1) {
      cell = this.table.rows[i].cells[j];
      if (cell.colSpan > 1) {
        cell.setAttribute(this.colSpanOriginalValuePropertyName, cell.colSpan);
      }
    }
  }
}; // END PROTOTYPE NAMED Table

/** instantiate a Table() for #table-attributes; perform specialized initializations */
const tableAttributesCreator = function tableAttributesCreator(tableId) {
  const rowOffset = 3;
  const columnOffset = 4;
  const rowNames = fegsScopingData.fegsAttributes;
  const columnNames = fegsScopingData.fegsBeneficiaries;
  const table = new Table(tableId, rowNames, columnNames, rowOffset, columnOffset);
  let cell;

  const validateAndSaveData = function validateAndSaveData() {
    const columnIndex = this.parentElement.cellIndex;
    const beneficiaryName = fegsScopingData.fegsBeneficiaries[columnIndex - columnOffset];
    let allBlank = true;
    const attributesObject = {};
    let total = 0; // sum all cells to see if sum is correctly normalized
    const { rows } = this.parentElement.parentElement.parentElement;
    let rowIndex;
    const { value } = this;
    if (value < 1 || value > 100) {
      // value is invalid after change
      for (let i = 0; i < rows.length; i += 1) {
        rows[i].cells[columnIndex].classList.remove('invalid-text-input');
      }
      this.parentElement.classList.add('invalid-text-input');
      accessiblyNotify(
        `"${
        rows[this.parentElement.parentElement.rowIndex - rowOffset].cells[0].innerText
        }" was set to ${value}% of ${
        document.getElementById('table-attributes').rows[1].cells[this.parentElement.cellIndex]
          .innerText
        }. Percentages must be between 1 and 100.`
      );
    } else {
      // individual input is valid
      for (let i = 0; i < rows.length; i += 1) {
        // loop through values in column
        if (
          allBlank === true &&
          rows[i].cells[columnIndex].getElementsByTagName('input')[0].value !== ''
        ) {
          allBlank = false;
        }
        total += +rows[i].cells[columnIndex].getElementsByTagName('input')[0].value;
      }
      if (allBlank === true || String(total) === '100') {
        // pecentages are correctly normalized
        clearNotices(); // clear notices which describe bad input
        for (let i = 0; i < rows.length; i += 1) {
          // clear styling indicating bad input
          rows[i].cells[columnIndex].classList.remove('invalid-text-input');
        }
        for (rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
          rows[rowIndex].cells[columnIndex].classList.remove('invalid-text-input');
          const attributeName = fegsScopingData.fegsAttributes[rowIndex];
          attributesObject[attributeName] = rows[rowIndex].cells[columnIndex].getElementsByTagName(
            'input'
          )[0].value;
        }
        fegsScopingData.addAttributes(beneficiaryName, attributesObject); // save
        updateSelectBeneficiary('select-beneficiary');
        showSelectedBeneficiary(document.getElementById('select-beneficiary'));
        fegsScopingView.indicateUnsaved();
      } else {
        // notify of incorrect normalization
        accessiblyNotify(
          `The percentages for beneficiary ${beneficiaryName} sum to ${total}. Percentages must sum to 100.`
        );
        for (let i = 0; i < rows.length; i += 1) {
          rows[i].cells[columnIndex].classList.add('invalid-text-input');
        }
      }
    }
    updateAttributeProgress();
    updateAttributePieChart();
    updateAttributeBarChart();
  };

  for (let i = 0; i < rowNames.length; i += 1) {
    for (let j = 0; j < columnNames.length; j += 1) {
      // TODO implement excel-compatible keyboard-navigation listeners
      let input;
      cell = table.cell(rowNames[i], columnNames[j]);
      if (cell.querySelector('input') === null) {
        input = document.createElement('input');
        input.type = 'number';
        // store data and set properties including callbacks
        // before insertion into DOM to optimize performance
        cell.appendChild(input);
      } else {
        input = cell.querySelector('input');
      }
      input.oninput = validateAndSaveData; // apply onchange callback late to restore functionality
    }
  }
  table.table.setAttribute('data-initialized', 'true');
  return table;
};

/** clean trailing empty cells from each row then remove last cell from each row */
const removeLastColumnFromTable = tableId => {
  const table = document.getElementById(tableId);
  for (let i = 0; i < table.rows.length; i += 1) {
    for (let j = 0; j < table.rows[i].cells.length; j += 1) {
      if (table.rows[i].cells[table.rows[i].cells.length - 1].innerHTML.trim() === '') {
        table.rows[i].cells[table.rows[i].cells.length - 1].remove(); // trim blank trailing cells
      }
    }
    table.rows[i].cells[table.rows[i].cells.length - 1].remove(); // remove leftmost cell of data
  }
};

/** remove options with text of optionText from selectid */
const removeOptionFromSelect = (selectId, optionText) => {
  const select = document.getElementById(selectId);
  if (select.options[select.selectedIndex].text === optionText) {
    // is the option to be removed selected?
    select.selectedIndex = 0; // if selected => select default option
  }
  for (let i = 0; i < select.options.length; i += 1) {
    // remove option
    if (optionText === select.options[i].text) {
      select.options[i].remove();
    }
  }
  const event = new Event('change');
  select.dispatchEvent(event);
};

/** refresh select-box from data */
const updateSelectStakeholder = selectId => {
  const select = document.getElementById(selectId);
  const stakeholderNames = Object.keys(fegsScopingData.stakeholders);

  for (let i = select.options.length - 1; i >= 0; i -= 1) {
    // remove all options
    select.options[i].remove();
  }

  for (let i = 0; i < stakeholderNames.length; i += 1) {
    // add option for each stakeholder
    addOption(selectId, stakeholderNames[i], stakeholderNames[i]);
  }

  selectStakeholderToSlice();
};


function buildCriteriaTable(tableNode) {
  const thead = element({ tag: 'thead', childs: [
    { tag: 'tr', childs: [
      { tag: 'th', text: 'Color' },
      { tag: 'th', text: 'Criterion' },
      { tag: 'th', text: 'Weight' },
    ] }
  ] })

  const tbody = element({ tag: 'tbody' })

  let i = 0
  Object.entries(CRITERIA).forEach(([key, val]) => {
    const inputId = `score-${i++}`
    const row = element({ tag: 'tr', childs: [
      { tag: 'th', cls: 'legend-cell', childs: [
        { tag: 'span', cls: 'legend', style: `background-color: ${val.color};` },
      ] },
      { tag: 'th', cls: 'tooltip', childs: [
        { tag: 'label', for: inputId, childs: [
          { tag: 'span', text: key },
        ] },
        { tag: 'span', cls: 'tooltiprigth tooltiptext', text: val.tip },
      ] },
      { tag: 'td', childs: [
        { tag: 'input', id: inputId, 'data-criteria': key, type: 'number', min: 0, max: 100 },
      ] },
    ] })
    tbody.appendChild(row)
  })
  
  tableNode.append(thead, tbody)
}

function buildBeneficiaryTable(tableNode) {
  const thead = element({ tag: 'thead', childs: [
    { tag: 'tr', childs: [
      { tag: 'th', style: 'width: 10em;', text: 'Category' },
      { tag: 'th', style: 'width: 10em;', text: 'Subcategory', childs: [
        { tag: 'br' }, 
        { tag: 'button', id: 'table-beneficiaries-toggle', cls: 'btn-no-margin', text: 'Hide Definitions' },
      ] },
      { tag: 'th', cls: 'definition', style: 'width: 15em;', text: 'Definition' },
    ] },
  ] })

  const tbody = element({ tag: 'tbody' })

  Object.entries(BENEFICIARIES).forEach(([key, val]) => {
    let first = true
    const parts = Object.entries(val.parts)
    parts.forEach(([key2, val2]) => {
      const row = element({ tag: 'tr' })
      if (first) row.appendChild(element({ tag: 'th', rowspan: parts.length, style: `background-color: ${val.colorBack}; border-left: 4px solid ${val.color};`, text: key }))
      row.appendChild(element({ tag: 'th', style: `background-color: ${val.colorBack};`, text: key2 }))
      row.appendChild(element({ tag: 'td', cls: 'definition', style: `background-color: ${val.colorBack2};`, text: val2.def }))
      tbody.appendChild(row)
      first = false
    })
  })

  tableNode.append(thead, tbody)
}

function buildBeneficiaryToggles(divNode) {
  Object.keys(BENEFICIARIES).forEach(key => {
    const btn = element({ tag: 'button', 'aria-pressed': false, 'data-beneficiary': key, style: 'margin-right: 0.2rem;', text: key })
    btn.addEventListener('click', event => {
      const pressed = (btn.getAttribute('aria-pressed') === 'true')
      btn.setAttribute('aria-pressed', !pressed);
      toggleBeneficiaryRow(key)
    })
    divNode.appendChild(btn)
  })
}

function buildAttributeTable(tableNode) { // generate html instead of hard-coding it (still spagettied with Table class)
  // Using appendChild instead of innerHTML... possibly more confusing, but faster and secure.
  // The object formatting for elements is meant to look like the HTML structure.

  const colgroup = element({ tag: 'colgroup', childs: [
    { tag: 'col', cls: 'row-labels', span: '2' }, // category
    { tag: 'col', cls: 'row-labels', span: '1' }, // sub-category
    { tag: 'col', cls: 'definition', span: '1' }, // definition
  ] })

  const thead = element({ tag: 'thead' })

  const row1 = element({ tag: 'tr', cls: 'column-name-labels', childs: [
    { tag: 'th', cls: 'row-label-header', colspan: 2 }, // category
    { tag: 'th', cls: 'row-label-header', colspan: 1 }, // sub-category
    { tag: 'th', cls: 'definition', colspan: 1, rowspan: 3, text: 'Definition' }, // definition
  ] })

  const row2 = element({ tag: 'tr', cls: 'column-names', childs: [
    { tag: 'th', colspan: 2, text: 'Attribute Tier 1' }, // category
    { tag: 'th', text: 'Attribute Tier 2', childs: [ // sub-category
      { tag: 'br' }, 
      { tag: 'button', id: 'table-attributes-toggle', cls: 'btn-no-margin', text: 'Show Definitions' },
    ] }, 
    { tag: 'th', 'aria-hidden': true }, // some sort of spacer...?
    { tag: 'th', 'aria-hidden': true }, // some sort of spacer...?
  ] })

  const row3 = element({ tag: 'tr', childs: [
    { tag: 'th', cls: 'row-tier-1', 'aria-hidden': true },
    { tag: 'th', cls: 'row-name', colspan: 3, text: 'Beneficiary Result' },
    { tag: 'th', colspan: 1, 'aria-hidden': true },
    { tag: 'th', colspan: 1, 'aria-hidden': true },
  ] })

  let numBeneficiaries = 0 // used later
  Object.entries(BENEFICIARIES).forEach(([key, val]) => {
    const parts = Object.keys(val.parts) // parts of beneficiary sub-categories
    colgroup.appendChild(element({ tag: 'col', span: parts.length, style: `background-color: ${val.colorBack2};` }))
    row1.appendChild(element({ tag: 'th', colspan: parts.length, style: `background-color: ${val.colorBack}; border-top: 4px solid ${val.color};`, text: key }))
    parts.forEach(key => {
      row2.appendChild(element({ tag: 'th', style: `background-color: ${val.colorBack};`, text: key }))
      row3.appendChild(element({ tag: 'td' }))
      numBeneficiaries += 1
    })
  })
  thead.append(row1, row2, row3)

  const tbody = element({ tag: 'tbody' })

  let darken = true
  Object.entries(ATTRIBUTES).forEach(([key, val]) => {
    let first = true
    const parts = Object.entries(val.parts)
    parts.forEach(([key2, val2]) => {
      const row = element({ tag: 'tr', cls: (darken)?'dark':'' })
      if (first) row.appendChild(element({ tag: 'th', cls: 'row-tier-1', rowspan: parts.length, colspan: 2, text: key }))
      else row.appendChild(element({ tag: 'th', 'aria-hidden': true }))
      row.appendChild(element({ tag: 'th', cls: 'row-name', text: key2 }))
      row.appendChild(element({ tag: 'th', cls: (first)?'row-tier-1':'', 'aria-hidden': true }))
      row.appendChild(element({ tag: 'th', cls: 'definition', text: val2.def }))
      for (let i = 0; i < numBeneficiaries; i++) {
        row.appendChild(element({ tag: 'td' }))
      }
      tbody.appendChild(row)
      first = false
    })
    darken = !darken // alternate
  })

  tableNode.append(colgroup, thead, tbody)
}

function buildAttributeToggles(divNode) {
  Object.keys(ATTRIBUTES).forEach(key => {
    const btn = document.createElement('button')
    btn.setAttribute('aria-pressed', false) // for toggle
    btn.setAttribute('data-attribute', key) // TODO deprecate
    btn.setAttribute('style', 'margin-right: 0.2rem;')
    btn.innerText = key
    btn.addEventListener('click', event => {
      const pressed = (btn.getAttribute('aria-pressed') === 'true')
      btn.setAttribute('aria-pressed', !pressed);
      toggleAttributeRow(key)
    })
    divNode.appendChild(btn)
  })
}

function buildNotes() {
  for (let section of ['criteria', 'stakeholders', 'beneficiaries', 'attributes']) {
    notes[section] = new Note({ 
      node: document.getElementById(`note-${section}`),
      saveFunc: note => {
        fegsScopingData.notes[section] = note
        fegsScopingView.indicateUnsaved()
      }
    })
  }
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

// Declare Data, View, and Controller.
fegsScopingData = new FEGSScopingData(CRITERIA, BENEFICIARIES, ATTRIBUTES); // TODO refactor into ES6 object
fegsScopingView = new FEGSScopingView();
fegsScopingController = new FEGSScopingController();

// Build criteria table
buildCriteriaTable(document.getElementById('table-scores'))

// Build beneficiary table
buildBeneficiaryTable(document.getElementById('table-beneficiaries'))
buildBeneficiaryToggles(document.getElementById('toggle-beneficiaries'))

// Build attributes table
buildAttributeTable(document.getElementById('table-attributes'))
buildAttributeToggles(document.getElementById('toggle-attributes'))
tableAttributes = tableAttributesCreator('table-attributes');

updateSelectBeneficiary('select-beneficiary');
showSelectedBeneficiary(document.getElementById('select-beneficiary'));

// Build notes
buildNotes()

// Update progress
updateStakeholderProgress();
updateWeightingProgress();
updateBeneficiaryProgress();
updateAttributeProgress();

// Create charts
updateAllCharts()

/**
 * Update page zoom level
 * @function
 */
document.getElementById('zoomer').removeAttribute('hidden');
const indicatePageZoom = function indicatePageZoom(event) {
  document.querySelector('#page-zoom-indicator').innerText = `${parseInt(
    event.target.value * 100,
    10
  )}%`;
};

/**
 * Set the zoom factor of the app
 * @function
 */
const pageZoomChange = function pageZoomChange(event) {
  webFrame.setZoomFactor(+event.target.value);
};


function save(filepath) {
  if (document.getElementById('set-stakeholder-values').style.display !== 'none') addStakeholderScores() // greasy hack for in-edit stakeholder creation
  document.querySelectorAll('i[title="Save"]:not([hidden])').forEach(btn => btn.click()) // greasy hack for in-edit stakeholder rows
  Object.values(notes).forEach(note => note.save()) // save in-edit notes
  fegsScopingController.saveJSON(filepath, fegsScopingData)
  fegsScopingView.indicateSaved(filepath)
}

function open(filepath) {
  fegsScopingView.restoreView(filepath)
  fegsScopingView.indicateSaved(filepath)
}

// Listen for save as from main process
ipcRenderer.on('save-as', (event, arg) => {
  fegsScopingData.filePath = arg;
  save(arg)
});

// Listen for save as from main process
ipcRenderer.on('save-as-and-refresh', (event, arg) => {
  fegsScopingData.filePath = arg;
  save(arg)
  window.location.reload(true);
});

// Listen for save as from main process
ipcRenderer.on('save-as-and-open', (event, saveName, openName) => {
  fegsScopingData.filePath = saveName;
  save(saveName)
  open(openName)
});

// Listen for save as from main process then quit
ipcRenderer.on('save-as-and-quit', (event, saveName) => {
  fegsScopingData.filePath = saveName;
  save(saveName)
  ipcRenderer.send('quit');
});

// Listen for save from main process and refresh
ipcRenderer.on('save-and-refresh', () => {
  if (fegsScopingData.filePath !== '') {
    save(fegsScopingData.filePath)
    window.location.reload(true);
  } else {
    ipcRenderer.send('save-as-and-refresh', fegsScopingData.projectName);
  }
});

// Listen for save from main process and quit
ipcRenderer.on('save-and-quit', () => {
  if (fegsScopingData.filePath !== '') {
    save(fegsScopingData.filePath)
    ipcRenderer.send('quit');
  } else {
    ipcRenderer.send('save-as-and-quit', fegsScopingData.projectName);
  }
});

// Listen for save from main process and open
ipcRenderer.on('save-and-open', (event, filePath) => {
  if (fegsScopingData.filePath !== '') {
    save(fegsScopingData.filePath)
    open(filePath)
  } else {
    ipcRenderer.send('save-as-and-open', fegsScopingData.projectName, filePath);
  }
});

// Listen for save from main process
ipcRenderer.on('save', () => {
  if (fegsScopingData.filePath !== '') {
    save(fegsScopingData.filePath)
  } else {
    ipcRenderer.send('save-as', fegsScopingData.projectName);
  }
});

// Listen for open file from main process
ipcRenderer.on('open-file', (event, filePath) => {
  open(filePath)
});

const APP = (function APP() {
  function debounce(func, wait, immediate) {
    let timeout;
    return function appDebounce() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        timeout = null;
        if (!immediate) func.apply(context, args);
      }, wait);
      if (immediate && !timeout) func.apply(context, args);
    };
  }
  const me = {
    onResize: callback => {
      callback();
      window.addEventListener(
        'resize',
        debounce(() => {
          callback();
        }, 60),
        false
      );
    }
  };
  return me;
})();

APP.onResize(() => {
  // ...?
});

/**
 * Listens for scroll and then updates the left menu to the section shown on the screen
 * @listens
 */
window.addEventListener('scroll', () => {
  const scrollPos = window.scrollY;
  const menuItems = document.querySelectorAll('#menu > nav a');
  for (let i = 0; i < menuItems.length; i += 1) {
    const currentItem = menuItems[i];
    const hrefElement = document.getElementById(currentItem.getAttribute('href').replace('#', ''));
    //console.log('hrefElement.offsetTop <= scrollPos + 1');
    //console.log(hrefElement.offsetTop + ' <= ' + +scrollPos + +1);

    //console.log('hrefElement.offsetTop + hrefElement.offsetHeight > scrollPos');
    //console.log(+hrefElement.offsetTop + +hrefElement.offsetHeight + ' > ' + +scrollPos + +1);
    if (
      hrefElement.offsetTop <= scrollPos + 1 &&
      hrefElement.offsetTop + hrefElement.offsetHeight > scrollPos + 1
    ) {
      currentItem.parentNode.classList.add('active');
      //console.log('add');
      //console.log(currentItem.parentNode);
    } else {
      currentItem.parentNode.classList.remove('active');
      //console.log('remove');
      //console.log(currentItem.parentNode);
    }
  }
});
// END PAGE PROCESS

/**
 * Check if value is between min and max (inclusive)
 * @function
 * @return {bool} - A bool
 */
const validateInput = function validateInput(value, min, max) {
  if (!Number.isNaN(Number.parseFloat(value)) && value !== '') {
    if (value > max || value < min) {
      return false;
    }
    return true;
  }
  return false;
};

/**
 * Listens for ENTER key up even on the add stakeholder burron and then adds the stakeholder
 * @listens
 */
document.getElementById('stakeholder-group').addEventListener('keyup', event => {
  event.preventDefault();
  if (event.keyCode === 13) {
    document.getElementById('add-stakeholder').click();
  }
});

/**
 * Adds a stakeholder based on the input data
 * @function
 */
function addStakeholder() {
  const weights = fegsScopingData.makeCriteriaObject({});
  const stakeholderGroupInput = document.getElementById('stakeholder-group');
  const stakeholderGroup = stakeholderGroupInput.value.trim();
  stakeholderGroupInput.value = '';
  // if the stakeholder exists or is blank.
  if (Object.keys(fegsScopingData.stakeholders).indexOf(stakeholderGroup) !== -1) {
    accessiblyNotify('A stakeholder with this name already exists.');
    return;
  }
  if (stakeholderGroup === '') {
    accessiblyNotify("Stakeholder name can't be blank.");
    return;
  }
  if (!Number.isNaN(Number(stakeholderGroup))) {
    accessiblyNotify("Stakeholder can't be a number.");
    return;
  }
  fegsScopingData.addStakeholder(stakeholderGroup, weights); // add the stakeholder to the model
  document.getElementById('set-stakeholder-values').style.display = 'block';
  document.getElementById('stakeholder-list').style.display = 'block';

  const stakeholderList = document.getElementById('stakeholder-list'); // create the stakeholder list
  let li = document.createElement('li');
  li.setAttribute('data-stakeholder', stakeholderGroup);
  li.appendChild(document.createTextNode(stakeholderGroup));

  const button = document.createElement('button');
  button.setAttribute('class', 'remove-stakeholder');
  button.setAttribute('aria-label', 'remove stakeholder');
  button.innerHTML = '&#215;';

  button.addEventListener('click', function removeStakeholderOnClick() {
    // create listeners for the remove stakeholder button
    const stakeholder = this.parentNode.getAttribute('data-stakeholder');
    const elementsToRemove = document.querySelectorAll(`[data-stakeholder="${stakeholder}"]`);
    for (let i = 0, { length } = elementsToRemove; i < length; i += 1) {
      elementsToRemove[i].remove();
    }
    fegsScopingData.removeStakeholders([stakeholder]);
    updateStakeholderProgress();
    if (document.getElementById('stakeholder-list').children.length === 0) {
      document.getElementById('set-stakeholder-values').style.display = 'none';
    }
  });

  li.appendChild(button);
  stakeholderList.appendChild(li); // append the button and li elements to the ul

  const lists = document.getElementsByClassName('stakeholder-value-list');

  for (let i = 0; i < lists.length; i += 1) {
    // Create the score inputs for the added stakeholder
    const ul = lists[i];
    li = document.createElement('li');
    li.setAttribute('class', 'stakeholder-score-item');
    li.setAttribute('data-stakeholder', stakeholderGroup);
    li.appendChild(document.createTextNode(stakeholderGroup));

    const input = document.createElement('input');
    input.setAttribute('type', 'number');
    input.setAttribute('min', '0');
    input.setAttribute('max', '100');
    input.setAttribute('step', '1');
    input.setAttribute('class', 'stakeholder-score-input');
    input.setAttribute('id', `${stakeholderGroup}-${ul.getAttribute('data-criterion')}`);
    input.setAttribute('data-criterion', ul.getAttribute('data-criterion'));
    input.oninput = function oninput() {
      validateStakeholderScore(this);
      updateStakeholderProgress();
    };
    li.appendChild(input);
    ul.appendChild(li);
  }
  updateStakeholderProgress();
  fegsScopingView.indicateUnsaved();
}

/**
 * Adds a stakeholder using data from the Add stakeholder section
 * @function
 */
function addStakeholderScores() {
  const stakeholdersToAdd = scrapeAddStakeholders();
  const stakeholders = Object.keys(stakeholdersToAdd);
  if (stakeholders.length < 1) {
    return;
  }

  for (let i = 0; i < stakeholders.length; i += 1) {
    const stakeholder = stakeholders[i];
    fegsScopingData.addStakeholder(stakeholder, stakeholdersToAdd[stakeholder]);
    addRow('table-stakeholders', [stakeholder, fegsScopingData.stakeholders[stakeholder]]); // table name and array of values to insert
  }

  document.getElementById('set-stakeholder-values').style.display = 'none';
  document.getElementById('stakeholder-list').style.display = 'none';
  clearStakeholderScores();
  updateStakeholderBarChart();
  updateSelectStakeholder('select-stakeholder');
  const event = new Event('input');
  document.getElementById('select-stakeholder').dispatchEvent(event);

  updateStakeholderProgress();
  document.getElementById('stakeholder-table-container').style.display = 'block';
  fegsScopingView.indicateUnsaved();
  document.getElementById('stakeholder-table-container').scrollIntoView();

  // showSection('beneficiaries');
}

// Comments HERE
function clearStakeholderScores() {
  const items = document.getElementsByClassName('stakeholder-score-item');
  for (let i = items.length - 1; i >= 0; i -= 1) {
    items[i].parentNode.removeChild(items[i]);
  }

  const names = document.getElementById('stakeholder-list');
  for (let j = names.children.length - 1; j >= 0; j -= 1) {
    names.removeChild(names.children[j]);
  }
}

/*
  Scrape the values from the stakeholder inputs
*/
function scrapeAddStakeholders() {
  const stakeholdersToAdd = {};
  const stakeholderScoreInputs = document.getElementsByClassName('stakeholder-score-input');
  for (let input of stakeholderScoreInputs) {
    const stakeholder = input.parentNode.getAttribute('data-stakeholder')
    const criteria = input.getAttribute('data-criterion')
    if (!(stakeholder in stakeholdersToAdd)) { // first time adding this stakeholder
      stakeholdersToAdd[stakeholder] = {}
    }
    const value = parseInt(input.value) || ""
    stakeholdersToAdd[stakeholder][criteria] = value
  }
  return stakeholdersToAdd;
}

function validateStakeholderScore(that) {
  clearNotices();
  const { value } = that;
  const isValid = validateInput(value, 0, 100);
  if (!isValid) {
    accessiblyNotify('Please enter a value between 0 and 100');
    that.classList.add('invalid-text-input');
  } else {
    that.classList.remove('invalid-text-input');
    clearNotices();
  }
}

function updateBeneficiaryProgress() {
  const stakeholders = Object.keys(fegsScopingData.stakeholders);
  const stakeholderCount = stakeholders.length;
  if (stakeholderCount === 0) {
    document.getElementById('beneficiaries-progress').innerHTML = 'Add a stakeholder';
    return;
  }
  let completeCount = stakeholderCount;

  for (let i = 0; i < stakeholderCount; i += 1) {
    const stakeholder = stakeholders[i];
    if (!Object.keys(fegsScopingData.stakeholders[stakeholder].beneficiaries).length) {
      completeCount -= 1;
    }
  }

  if (completeCount > 0) {
    let percentageSum = 0;
    const inputs = document.getElementsByClassName('beneficiary-percentage-of-stakeholder');
    if (inputs.length) {
      for (let j = 0; j < inputs.length; j += 1) {
        percentageSum += +inputs[j].value;
      }
      // inform user of unnormalized percentages
      if (percentageSum < 99.95 || percentageSum > 100.05) {
        // completeCount--; // Don't want to decrease count just because they entered data
      }
    }
  }
  document.getElementById(
    'beneficiaries-progress'
  ).innerHTML = `${completeCount} of ${stakeholderCount} stakeholders completed`;
}

function updateWeightingProgress() {
  // Count the empty weights and display a progress counter
  const inputs = document.querySelectorAll('.scoring input');
  const emptyInputs = [];
  for (let i = 0; i < inputs.length; i += 1) {
    if (!inputs[i].value || inputs[i].classList.contains('invalid-text-input')) {
      emptyInputs.push(inputs[i]);
    }
  }
  document.getElementById('weighting-progress').innerHTML = `${inputs.length -
    emptyInputs.length} of ${inputs.length} criteria completed`;
}

/**
 * Gets the checked value of a specified name of ratio inputs.
 * @function
 * @param {string} name - The name of the radio buttons.
 * @return {string} - The value associated with the checked radio button.
 */
function getCheckedValueByName(name) {
  const elements = document.getElementsByName(name);
  for (let i = 0, { length } = elements; i < length; i += 1) {
    if (elements[i].checked) {
      return elements[i].value;
    }
  }
}

/**
 * Adds a row containing the specified data to the table, with appropriate listeners.
 * @function
 * @param {string} tableID - The ID of the table element.
 * @param {array} rowData - An array containing the data to display in the table.
 */
function addRow(tableID, rowData) {
  const tableRef = document.getElementById(tableID).getElementsByTagName('tbody')[0]; // Get a reference to the table
  const newRow = tableRef.insertRow(); // Insert a row in the table at row index 0

  const editBtn = element({ tag: 'i', cls: 'fas fa-edit icon-btn', title: 'Edit' })
  const saveBtn = element({ tag: 'i', cls: 'fas fa-check green icon-btn', title: 'Save' })
  saveBtn.hidden = true
  const removeBtn = element({ tag: 'i', cls: 'fas fa-trash-alt red icon-btn', title: 'Remove' })

  let newCell = newRow.insertCell(); // Insert a cell in the row to hold the buttons

  const wrapper = element({ tag: 'div', cls: 'flexrow', style: 'min-width: 4.5em; justify-content: space-around;' })
  wrapper.append(editBtn, saveBtn, removeBtn)
  newCell.append(wrapper)

  removeBtn.addEventListener('click', () => {
    fegsScopingView.indicateUnsaved();
    // create listeners for the buttons
    const stakeholder = wrapper.parentNode.nextSibling.innerHTML; // I hate this
    fegsScopingData.removeStakeholders([stakeholder]);
    wrapper.parentNode.parentNode.remove();
    removeOptionFromSelect('select-stakeholder', stakeholder);
    updateStakeholderBarChart();
    const stakeholderCount = Object.keys(fegsScopingData.stakeholders).length;
    if (stakeholderCount === 0) {
      document.getElementById('stakeholder-table-container').style.display = 'none';
    }
    updateBeneficiaryView();
    updateAttributeView();
  });

  editBtn.addEventListener('click', () => {
    editBtn.hidden = true
    saveBtn.hidden = false
    removeBtn.hidden = true

    fegsScopingView.indicateUnsaved();
    const row = wrapper.parentNode.parentNode;
    const { cells } = row;
    cells[1].innerHTML = `<input style="min-width: 8rem;" data-original-value="${cells[1].innerText}" type="text" value="${cells[1].innerText}"/>`;
    for (let i = 2, { length } = cells; i < length; i += 1) {
      const cell = cells[i];
      const text = cell.innerText;
      cell.innerHTML = `<input data-original-value="${text}" type="text" value="${text}"/>`; // create an input with the cell value
    }
  });

  saveBtn.addEventListener('click', () => {
    editBtn.hidden = false
    saveBtn.hidden = true
    removeBtn.hidden = false

    fegsScopingView.indicateUnsaved(); // not yet saved to file
    const row = wrapper.parentNode.parentNode;
    const { cells } = row;
    let originalStakeholderName = cells[1].innerText;
    const newStakeholderName = cells[1].firstElementChild.value.trim();

    if (cells[1].firstElementChild.hasAttribute('data-original-value')) {
      originalStakeholderName = cells[1].firstElementChild.getAttribute('data-original-value');
    }

    if (
      newStakeholderName !== originalStakeholderName &&
      Object.keys(fegsScopingData.stakeholders).indexOf(newStakeholderName) !== -1
    ) {
      accessiblyNotify('A stakeholder with this name already exists.');
      return;
    }

    if (newStakeholderName === '') {
      accessiblyNotify("Stakeholder name can't be blank.");
      return;
    }

    cells[1].firstElementChild.classList.remove('invalid-text-input');
    if (!Number.isNaN(Number(newStakeholderName))) {
      accessiblyNotify("Stakeholder name can't be a number.");
      cells[1].firstElementChild.classList.add('invalid-text-input');
      return;
    }

    for (let i = 2, { length } = cells; i < length; i += 1) {
      const cell = cells[i];
      // set the value of the cell to the value of the child input of the cell
      const newVal = +cell.firstElementChild.value;
      cell.firstElementChild.classList.remove('invalid-text-input');
      if (Number.isNaN(newVal) || newVal > 100 || newVal < 0) {
        accessiblyNotify('Value must be a number in the range 0-100.');
        cell.firstElementChild.classList.add('invalid-text-input');
        return;
      }
    }

    for (let i = 1; i < 2; i += 1) {
      const cell = cells[i];
      // set the value of the cell to the value of the child input of the cell
      cell.innerHTML = cell.firstElementChild.value;
    }

    for (let i = 2, { length } = cells; i < length; i += 1) {
      const cell = cells[i];
      // set the value of the cell to the value of the child input of the cell
      const newVal = cell.firstElementChild.value; // may be empty string
      cell.innerHTML = newVal;
    }

    let scores = {};
    for (let j = 0; j < fegsScopingData.criteria.length; j += 1) {
      const cell = document.getElementById(
        `${originalStakeholderName}-${fegsScopingData.criteria[j]}`
      );
      scores[fegsScopingData.criteria[j]] = cell.innerHTML;
      cell.id = `${cells[1].innerText}-${fegsScopingData.criteria[j]}`;
    }
    scores = fegsScopingData.makeCriteriaObject(scores);

    if (newStakeholderName !== originalStakeholderName) {
      fegsScopingData.renameStakeholder(originalStakeholderName, newStakeholderName);
    } else {
      fegsScopingData.updateStakeholder(originalStakeholderName, scores);
    }

    fegsScopingData.stakeholders[newStakeholderName].scores = scores;
    updateSelectStakeholder('select-stakeholder'); // update select-box that its entries have changed
    updateStakeholderBarChart();
    updateBeneficiaryView();
    updateAttributeView();
  });

  newCell = newRow.insertCell(); // Insert a cell in the row at index 0
  let newText = document.createTextNode(rowData[0]); // Append a text node to the cell
  newCell.appendChild(newText);

  for (let i = 0, { length } = fegsScopingData.criteria; i < length; i += 1) {
    newCell = newRow.insertCell(); // Insert a cell in the row at index 0
    // Append a text node to the cell
    newText = document.createTextNode(rowData[1].scores[fegsScopingData.criteria[i]]);
    newCell.id = `${rowData[0]}-${fegsScopingData.criteria[i]}`;
    newCell.appendChild(newText);
  }
}

/**
 * Toggles the visibility of the spefied element.
 * @function
 * @param {string} id - The ID of the element to toggle visiibility.
 */
function toggleVisibility(id) {
  const element = document.getElementById(id);
  if (element.style.display === 'block') {
    element.style.display = 'none';
  } else {
    element.style.display = 'block';
  }
}

function wrap(text, width) {
  text.each(function wrapText() {
    text = d3.select(this);
    const words = text
      .text()
      .split(/\s+/)
      .reverse();
    let line = [];
    let word;
    let lineNumber = 0;
    const lineHeight = 1.1; // ems
    const y = text.attr('y');
    const dy = parseFloat(text.attr('dy'));
    let tspan = text
      .text(null)
      .append('tspan')
      .attr('x', 0)
      .attr('y', y)
      .attr('dy', `${dy}em`);
    while (words.length) {
      word = words.pop();
      line.push(word);
      tspan.text(line.join(' '));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(' '));
        line = [word];
        tspan = text
          .append('tspan')
          .attr('x', 0)
          .attr('y', y)
          .attr('dy', `${(lineNumber += 1) * lineHeight + dy}em`)
          .text(word);
      }
    }
  });
}

/** horizontal bar-chart */
// const initBarChart = {
//   draw(config) {
//     var domEle = config.element;
//     var data = config.data;
//     var colors = config.colors;
//     var margin = {top: 20, right: 20, bottom: 50, left: 300};
//     var divWidth = document.getElementById('beneficiary-charts').offsetWidth;
//     if (divWidth > 1000) {
//       divWidth = 1000;
//     } else if (divWidth < 550) {
//       divWidth = 550;
//     }
//     var width = divWidth - margin.left - margin.right;
//     var height = 750 - margin.top - margin.bottom;
//     var container = d3.select('#' + domEle);
//     container.selectAll('svg').remove();
//     if (data.length === 0) {
//       return; // if there's no data to display don't display anything!
//     }
//     var svg = container
//       .append('svg')
//       .attr('width', width + margin.left + margin.right)
//       .attr('height', height + margin.top + 10 + margin.bottom + 10 + 30)
//       .append('g')
//       .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

//     var yScale = d3.scaleBand().range([height, 0]).padding(0.3);
//     var xScale = d3.scaleLinear().range([0, width]);
//     var yAxis = d3.axisLeft(yScale);
//     var xAxis = d3.axisBottom(xScale);
//     var colorScale = d3.scaleOrdinal(colors);

//     var tip = d3.tip()
//         .attr('class', 'd3-tip bar-chart')
//         .offset([-10, 0])
//         .html(function (d) {
//           return '<div><span>Attribute:</span> <span style="color:white">' + d.label + '</span></div>' +
//                  '<div><span>Value:</span> <span style="color:white">' + round(d.value, 2) + '</span></div>';
//         });

//     svg.call(tip);

//     yScale.domain(data.map(function (d) { return d['label']; }));
//     xScale.domain([0, d3.max(data, function (d) { return d['value']; })]);
//     colorScale.domain(data.map(function (d) { return d['label']; }));

//     svg.append('g')
//         .attr('class', 'y axis')
//         .call(yAxis)
//         .selectAll('.tick text')
//         .call(wrap, 250);

//     d3.selectAll('#' + domEle + ' .y line').remove();

//     svg.append('g')
//         .attr('class', 'x axis')
//         .call(xAxis)
//         .attr('transform', 'translate(0,' + height + ')');

//     svg.selectAll('.bar')
//         .data(data)
//       .enter().append('rect')
//         .attr('class', 'bar')
//         .attr('width', function (d) { return xScale(d['value']); })
//         .attr('y', function (d) { return yScale(d['label']); })
//         .attr('height', yScale.bandwidth())
//         .attr('fill', function (d) { return colorScale(d['label']); })
//         .on('mouseover', tip.show)
//         .on('mouseout', tip.hide);
//   }
// };

const getStakeholderPrioritizationsFromTable = function getStakeholderPrioritizationsFromTable() {
  const table = document.getElementById('table-stakeholders');
  const tbody = table.getElementsByTagName('tbody')[0]; // get all rows of body
  const rows = tbody.getElementsByTagName('tr');
  const data = [];
  if (rows.length > 0) {
    for (let i = 0; i < rows.length; i += 1) {
      data[i] = {};
      const cells = rows[i].getElementsByTagName('td');
      data[i].stakeholder = cells[1].innerText;
      for (let j = 2; j < cells.length; j += 1) {
        data[i][fegsScopingData.criteria[j - 2]] = cells[j].innerText;
      }
    }
  }
  return data; // return data as array of objects with criteria as keys
};

/**
 * Add a column of data to the table with id tableId.
 * @param {string} tableId - id of table
 * @param {string} columnName - name of column to use as header
 * @param {string} dataArray - array whose elements will populate
 *  the columns where column i + 1 gets ith element of the array
 */
const addTableColumn = function addTableColumn(tableId, columnName, dataArray) {
  const table = document.getElementById(tableId);
  const tHead = table.tHead.children[0];
  const th = document.createElement('th');

  th.innerHTML = columnName;
  tHead.appendChild(th);

  for (let i = 0; i < dataArray.length; i += 1) {
    const td = document.createElement('td');
    td.innerHTML = dataArray[i];
    table.tBodies[0].rows[i].appendChild(td);
  }
};

/**
 * Returns the cell of the table by given (x;y) coordinates considering
 *  colSpan and rowSpan of the cells.
 * @param {HTMLElement} table - HTML table
 * @param {number} x - X position in table matrix
 * @param {number} y - Y position in table matrix
 * @returns {HTMLElement|null}
 */
const getTableCell = function getTableCell(table, x, y) {
  const m = [];
  let cell;
  let xx;
  for (let yyy = 0; yyy < table.rows.length; yyy += 1) {
    const row = table.rows[yyy];
    for (let xxx = 0; xxx < row.cells.length; xxx += 1) {
      cell = row.cells[xxx];
      xx = xxx;
      for (let tx = xx; tx < xx + cell.colSpan; tx += 1) {
        for (let ty = yyy; ty < yyy + cell.rowSpan; ty += 1) {
          if (!m[ty]) {
            m[ty] = [];
          }
          m[ty][tx] = true;
        }
      }
      if (xx <= x && x < xx + cell.colSpan && yyy <= y && y < yyy + cell.rowSpan) {
        return cell;
      }
    }
  }
  return null;
};

function toggleTableDefinitions(event, tableID) {
  for (let element of document.querySelectorAll(`#${tableID} .definition`)) {
    if (element.hasAttribute('hidden') || element.classList.contains('display-none')) {
      event.target.innerHTML = 'Hide Definitions';
      element.removeAttribute('hidden');
      element.classList.remove('display-none');
    } else {
      event.target.innerHTML = 'Show Definitions';
      element.setAttribute('hidden', true);
      element.classList.add('display-none');
    }
  }
}

/**
 * Populate a stakeholder's beneficiary-percentages into the view.
 *
 * Put each value in a text-input.
 * Validate data-entry by notifying when sum of inputs > 100.
 */
const selectStakeholderToSlice = function selectStakeholderToSlice() {
  clearNotices();
  const table = document.getElementById('table-beneficiaries');
  const select = document.getElementById('select-stakeholder');
  const stakeholderName = select.value;
  const noBenefit = (stakeholderName) ? fegsScopingData.stakeholders[stakeholderName].noBenefit : null
  const tBody = table.tBodies[0];
  let rowIndex;
  let cell;
  let input;
  // let cellText;
  // let rowspan;
  // let numberOfBeneficiaryColumnsInRow;

  for (let i = tBody.rows[0].cells.length - 1; i > 2; i -= 1) {
    // remove all data columns
    removeLastColumnFromTable(table.id);
  }
  if (!stakeholderName) return // no stakeholder

  // add a column to house the data
  addTableColumn(
    table.id,
    `${stakeholderName}<br /><br />Prioritization Result: ${round(
      fegsScopingData.stakeholderPrioritizationScoreSum(stakeholderName),
      1
    )}`,
    fegsScopingData.fegsBeneficiaries
  );
  for (rowIndex = 0; rowIndex < tBody.rows.length; rowIndex += 1) {
    cell = tBody.rows[rowIndex].cells[tBody.rows[rowIndex].cells.length - 1];
    // create empty inputs for beneficiaries that are not scored for a stakeholder yet
    if (
      !fegsScopingData.stakeholders[stakeholderName] ||
      !('beneficiaries' in fegsScopingData.stakeholders[stakeholderName])
    ) {
      cell.innerHTML = '';
      input = document.createElement('input');
      input.type = 'number';
      input.className = 'beneficiary-percentage-of-stakeholder';
      cell.appendChild(input);
      input.oninput = beneficiaryPercentageOfStakeholderInputValidator;
    } else {
      // if (tBody.rows[rowIndex].cells[0].getAttribute('rowspan') === null) {
      //   // check for spanned row-header
      //   numberOfBeneficiaryColumnsInRow = 0;
      // } else {
      //   numberOfBeneficiaryColumnsInRow = 1;
      // }
      const beneficiaryName =
        tBody.rows[rowIndex].cells[tBody.rows[rowIndex].cells.length - 1].innerText;
      cell.innerHTML = '';
      input = document.createElement('input');
      input.type = 'number';
      input.className = 'beneficiary-percentage-of-stakeholder';
      if (
        fegsScopingData.stakeholders[stakeholderName].beneficiaries[beneficiaryName] &&
        Object.prototype.hasOwnProperty.call(
          fegsScopingData.stakeholders[stakeholderName].beneficiaries[beneficiaryName],
          'percentageOfStakeholder'
        )
      ) {
        input.value =
          fegsScopingData.stakeholders[stakeholderName].beneficiaries[
            beneficiaryName
          ].percentageOfStakeholder;
      }
      input.oninput = beneficiaryPercentageOfStakeholderInputValidator; // save valid input
      cell.appendChild(input);
    }
    input.disabled = noBenefit
  }
  document.getElementById('check-stakeholder-benefits').checked = noBenefit

  updateSelectBeneficiary('select-beneficiary');
  showSelectedBeneficiary(document.getElementById('select-beneficiary'));
  updateBeneficiaryProgress();
};

// validate sum of percentages is 100 +- 0.05 then save
function beneficiaryPercentageOfStakeholderInputValidator() {
  clearNotices();
  const stakeholderName = document.getElementById('select-stakeholder').value;
  let percentageSum = 0;
  // let input;
  const inputs = document.getElementsByClassName('beneficiary-percentage-of-stakeholder');
  for (let j = 0; j < inputs.length; j += 1) {
    const value = parseFloat(inputs[j].value);

    if (value > 100 || value < 0) {
      inputs[j].parentElement.style = 'background-color: #ffcccc';
      accessiblyNotify(`Values must be between 0 and 100. The current value is ${value}.`);
      return;
    }

    if (isNaN(value)) {
      inputs[j].parentElement.style = 'background-color: #ffcccc';
    }
    percentageSum += Number(inputs[j].value);
  }

  // TODO observe checkbox
  const hasBeneficiaries = !document.getElementById('check-stakeholder-benefits').checked
  // TODO checkbox onclick listener calls this fucntion?

  // inform user of unnormalized percentages
  if (hasBeneficiaries && percentageSum < 99.95 || percentageSum > 100.05) {
    accessiblyNotify(`Percentages must sum to 100. The current sum is ${percentageSum}.`);
    for (let j = 0; j < inputs.length; j += 1) {
      inputs[j].parentElement.style = 'background-color: #ffcccc';
    }
  } else {
    // update data with valid input
    for (let j = 0; j < inputs.length; j += 1) {
      inputs[j].parentElement.style = 'background-color: initial';
      const beneficiaryNameForInput =
        inputs[j].parentElement.parentElement.cells[inputs[j].parentElement.cellIndex - 2]
          .innerText;
      if (
        !fegsScopingData.stakeholders[stakeholderName].beneficiaries ||
        !fegsScopingData.stakeholders[stakeholderName].beneficiaries[beneficiaryNameForInput]
      ) {
        fegsScopingData.addBeneficiary(stakeholderName, beneficiaryNameForInput, inputs[j].value);
      }
      fegsScopingData.stakeholders[stakeholderName].beneficiaries[
        beneficiaryNameForInput
      ].percentageOfStakeholder = inputs[j].value;
      fegsScopingView.indicateUnsaved();
    }
    document.getElementById('beneficiary-charts').removeAttribute('hidden');
    document.getElementById('attribute-charts').removeAttribute('hidden');

    updateBeneficiaryView();
    updateAttributeView();

    updateBeneficiaryProgress();
    updateAttributeProgress();

    fegsScopingView.displayBeneficiaryScores(); // update #table-beneficiary-score
    updateSelectBeneficiary('select-beneficiary');
    showSelectedBeneficiary(document.getElementById('select-beneficiary'));
    fegsScopingData.clearOtherAttributes(fegsScopingData.getExtantBeneficiaries());
    // showSection('attributes');
  }
};

// function toggleSection(Id) {
//   const section = document.getElementById('section-' + Id);
//   const nav = document.getElementById('nav-' + Id);
//   if (section.hasAttribute('hidden')) {
//     section.removeAttribute('hidden');
//     nav.removeAttribute('hidden');
//   } else {
//     section.setAttribute('hidden', true);
//     nav.setAttribute('hidden', true);
//   }
// }

// function showSection(Id) {
//   const section = document.getElementById('section-' + Id);
//   const nav = document.getElementById('nav-' + Id);
//   if (section.hasAttribute('hidden')) {
//     section.removeAttribute('hidden');
//     nav.removeAttribute('hidden');
//   }
// }

// function hideSection(Id) {
//   const section = document.getElementById('section-' + Id);
//   const nav = document.getElementById('nav-' + Id);
//   if (!section.hasAttribute('hidden')) {
//     section.setAttribute('hidden', true);
//     nav.setAttribute('hidden', true);
//   }
// }

function toggleBeneficiaryRow(beneficiary) {
  Array.from(document.querySelector('#table-beneficiaries').rows).forEach(row => {
    let beneficiary2 = row.cells[0].innerHTML.replace('&amp;', '&');
    let parent = fegsScopingData.fegsBeneficiariesTier1[beneficiary2];
    if (!parent) {
      beneficiary2 = row.cells[1].innerHTML.replace('&amp;', '&');
      parent = fegsScopingData.fegsBeneficiariesTier1[beneficiary2];
    }

    if (parent === beneficiary) {
      if (row.style.display === 'none') {
        row.style.display = 'table-row';
      } else {
        row.style.display = 'none';
      }
    }
  });
}

function toggleAllBeneficiaries() {
  Array.from(document.querySelector('#table-beneficiaries').rows).forEach(row => {
    const beneficiary2 = row.cells[0].innerHTML.replace('&amp;', '&').trim();

    if (fegsScopingData.fegsBeneficiariesTier1[beneficiary2]) {
      if (row.style.display === 'none') {
        row.style.display = 'table-row';
      } else {
        row.style.display = 'none';
      }
    } else if (
      fegsScopingData.fegsBeneficiariesTier1[row.cells[1].innerHTML.replace('&amp;', '&')]
    ) {
      if (row.style.display === 'none') {
        row.style.display = 'table-row';
      } else {
        row.style.display = 'none';
      }
    }
  });
}

function toggleAttributeRow(attribute) {
  Array.from(document.querySelector('#table-attributes').rows).forEach(row => {
    let attribute2 = row.cells[1].innerHTML.replace('&amp;', '&');
    let parent = fegsScopingData.fegsAttributesTier1[attribute2];

    if (!parent) {
      attribute2 = row.cells[2].innerHTML.replace('&amp;', '&');
      parent = fegsScopingData.fegsAttributesTier1[attribute2];
    }

    if (parent === attribute) {
      if (row.style.display === 'none') {
        row.style.display = 'table-row';
      } else {
        row.style.display = 'none';
      }
    }
  });
}

function toggleAllAttributes() {
  Array.from(document.querySelector('#table-attributes').rows).forEach(row => {
    const attribute = row.cells[1].innerHTML.replace('&amp;', '&').trim();

    if (fegsScopingData.fegsAttributesTier1[attribute]) {
      if (row.style.display === 'none') {
        row.style.display = 'table-row';
      } else {
        row.style.display = 'none';
      }
    } else if (fegsScopingData.fegsAttributesTier1[row.cells[2].innerHTML.replace('&amp;', '&')]) {
      if (row.style.display === 'none') {
        row.style.display = 'table-row';
      } else {
        row.style.display = 'none';
      }
    }
  });
}

function serializeSVG(svgNode) { // returns svg string
  const svg = svgNode.cloneNode(true)
  // ... attach inline styles here as needed
  const serializer = new XMLSerializer()
  return serializer.serializeToString(svg)
}

function rasterizeSVG(svgNode, mime='png', scale=2, pad=5) { // returns png/jpeg buffer promise
  return new Promise((resolve, reject) => {
    const svgString = serializeSVG(svgNode)
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    
    const canvas = document.createElement('canvas')
    canvas.width = svgNode.clientWidth*scale + pad*2
    canvas.height = svgNode.clientHeight*scale + pad*2
    const ctx = canvas.getContext('2d')
    
    const img = new Image()
    img.onerror = reject
    img.onload = () => {
      if (mime === 'jpeg') { // transparency unsupported
        ctx.fillStyle = '#FFF' // background color
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
      ctx.drawImage(img, pad, pad, canvas.width - pad*2, canvas.height - pad*2)
      canvas.toBlob(imgBlob => {
        imgBlob.arrayBuffer().then(result => {
          const buffer = new Buffer(result)
          resolve(buffer)
        })
      }, `image/${mime}`)
    }
    img.src = window.URL.createObjectURL(svgBlob)
  })
}

function downloadChart(svgNode, name='Chart') {
  let filePath = null
  dialog.showSaveDialog({
    defaultPath: `${name}.png`,
    filters: [
      { name: 'PNG',  extensions: ['png'] },
      { name: 'JPEG', extensions: ['jpg', 'jpeg'] },
      { name: 'SVG',  extensions: ['svg'] },
    ]
  }).then(result => {
    if (!result.canceled) {
      filePath = result.filePath
      const ext = filePath.split('.').pop()
      if (ext === 'svg') {
        return serializeSVG(svgNode)
      } else if (ext === 'jpeg' || ext === 'jpg') {
        return rasterizeSVG(svgNode, 'jpeg')
      } else {
        return rasterizeSVG(svgNode, 'png')
      }
    }
  }).then(result => {
    if (filePath) {
      fs.writeFileSync(filePath, result)
    }
  }).catch(err => {
    console.error(err)
  })
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.body.getAttribute('data-restore') === 'true') {
    fegsScopingController.importData();
  }

  document.getElementById('show-name').addEventListener('click', () => {
    fegsScopingView.editName();
  });

  document.getElementById('show-description').addEventListener('click', () => {
    fegsScopingView.editDescription();
  });

  document.getElementById('save-description').addEventListener('click', () => {
    fegsScopingController.updateDescription(document.getElementById('input-description').value);
  });

  document.getElementById('save-name').addEventListener('click', () => {
    fegsScopingController.updateName(document.getElementById('input-name').value);
  });

  document.getElementById('add-stakeholder').addEventListener('click', () => {
    addStakeholder();
  });

  document.getElementById('table-beneficiaries-toggle').addEventListener('click', event => {
    toggleTableDefinitions(event, 'table-beneficiaries');
  });

  document.getElementById('table-attributes-toggle').addEventListener('click', event => {
    toggleTableDefinitions(event, 'table-attributes');
  });

  document.getElementById('page-zoom').addEventListener('change', event => {
    pageZoomChange(event);
  });

  document.getElementById('page-zoom').addEventListener('input', event => {
    indicatePageZoom(event);
  });

  document.getElementById('select-stakeholder').addEventListener('change', () => {
    selectStakeholderToSlice();
    displayBeneficiariesforSelectedStakeholder();
  });

  document.getElementById('select-beneficiary').addEventListener('change', event => {
    showSelectedBeneficiary(event.target);
  });

  document.getElementById('add-stakeholder-scores').addEventListener('click', () => {
    addStakeholderScores();
  });

  document.getElementById('check-stakeholder-benefits').addEventListener('change', event => {
    const stakeholderName = document.getElementById('select-stakeholder').value
    const stakeholder = fegsScopingData.stakeholders[stakeholderName]
    if (event.target.checked) {
      stakeholder.noBenefit = true
      stakeholder.lastBeneficiaries = stakeholder.beneficiaries // save
      stakeholder.beneficiaries = {}
    } else {
      stakeholder.noBenefit = false
      stakeholder.beneficiaries = stakeholder.lastBeneficiaries // restore
      stakeholder.lastBeneficiaries = {}
    }
    selectStakeholderToSlice() // refresh beneficiary table
    beneficiaryPercentageOfStakeholderInputValidator() // refresh eveything else
  })

  const child = id => document.getElementById(id).firstChild // div id -> svg node

  document.getElementById('download-stakeholder-barchart').addEventListener('click', () => {
    downloadChart(child('stakeholder-barchart'), 'Stakeholder Prioritization')
  })

  document.getElementById('download-stakeholder-piechart').addEventListener('click', () => {
    downloadChart(child('stakeholder-piechart'), 'Prioritization Criteria Relative Weights')
  })

  document.getElementById('download-beneficiary-barchart').addEventListener('click', () => {
    downloadChart(child('beneficiary-barchart'), 'Beneficiary Prioritization')
  })

  document.getElementById('download-beneficiary-piechart').addEventListener('click', () => {
    downloadChart(child('beneficiary-piechart'), 'Beneficiary Profile')
  })

  document.getElementById('download-attribute-barchart').addEventListener('click', () => {
    downloadChart(child('attribute-barchart'), 'Environmental Attribute Prioritization')
  })

  document.getElementById('download-attribute-piechart').addEventListener('click', () => {
    downloadChart(child('attribute-piechart'), 'Environmental Attributes Relative Priority')
  })

  document.querySelectorAll('.scoring input').forEach(ele => {
    ele.addEventListener('input', event => {
      clearNotices();
      const inputs = document.querySelectorAll('.scoring input');
      for (let input of inputs) {
        const isValid = validateInput(input.value, 0, 100);
        if (isValid) {
          input.classList.remove('invalid-text-input');
          const criteria = fegsScopingData.criteriaMapNewToOld[input.dataset['criteria']]
          fegsScopingData.scores[criteria] = input.value;
        } else if (event.target === input) { // selected
          input.classList.add('invalid-text-input');
          accessiblyNotify('Enter a number between 0 and 100');
        }
      }
      updateCriteriaPieChart();
      updateStakeholderPieChart();
      updateStakeholderBarChart();
      updateWeightingProgress();
      fegsScopingView.indicateUnsaved();
    });
  });

  toggleAllAttributes();
  toggleAllBeneficiaries();
});

function displayAttributesforSelectedBeneficiary() {
  document.querySelectorAll(`#toggle-attributes button[aria-pressed="true"]`).forEach(ele => {
    ele.click();
  });
  const selected = document.getElementById('select-beneficiary').value;
  const toggled = new Set();
  Object.keys(fegsScopingData.attributes).forEach(beneficiary => {
    const bene = fegsScopingData.fegsBeneficiariesTier1[beneficiary];
    Object.keys(fegsScopingData.attributes[beneficiary]).forEach(at2 => {
      if (
        bene === selected &&
        fegsScopingData.attributes[beneficiary][at2].percentageOfBeneficiary !== '' &&
        !toggled.has(fegsScopingData.fegsAttributesTier1[at2])
      ) {
        document
          .querySelector(
            `#toggle-attributes button[data-attribute="${fegsScopingData.fegsAttributesTier1[at2]}"`
          )
          .click();
        toggled.add(fegsScopingData.fegsAttributesTier1[at2]);
      }
    });
  });
}

function displayBeneficiariesforSelectedStakeholder() {
  document.querySelectorAll(`#toggle-beneficiaries button[aria-pressed="true"]`).forEach(ele => {
    ele.click();
  });
  const selected = document.getElementById('select-stakeholder').value;
  const toggled = new Set();
  Object.keys(fegsScopingData.stakeholders).forEach(stakeholder => {
    Object.keys(fegsScopingData.stakeholders[stakeholder].beneficiaries).forEach(beneficiary => {
      if (
        selected === stakeholder &&
        fegsScopingData.stakeholders[stakeholder].beneficiaries[beneficiary]
          .percentageOfStakeholder !== '' &&
        !toggled.has(fegsScopingData.fegsBeneficiariesTier1[beneficiary])
      ) {
        document
          .querySelector(
            `#toggle-beneficiaries button[data-beneficiary="${fegsScopingData.fegsBeneficiariesTier1[beneficiary]}"`
          )
          .click();
        toggled.add(fegsScopingData.fegsBeneficiariesTier1[beneficiary]);
      }
    });
  });
}

if (remote.process.argv.length > 1) {
  if (remote.process.argv[1].substr(remote.process.argv[1].length - 5) === '.fegs') {
    fegsScopingView.restoreView(remote.process.argv[1]);
    fegsScopingView.indicateSaved(remote.process.argv[1]);
    remote.process.argv = [remote.process.argv[0]];
  }
}


const weightScoreInputs = document.querySelectorAll('#table-scores input')
for(const input of weightScoreInputs) {
  input.addEventListener('change', () => {
    if (Object.keys(fegsScopingData.stakeholders).length < 1) {
      return
    } else {
      fegsScopingView.displayBeneficiaryScores()
      fegsScopingView.showStakeholderScores()
    }
  })
}

