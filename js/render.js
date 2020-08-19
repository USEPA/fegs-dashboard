const fs = require('fs');
const electron = require('electron');

const { ipcRenderer, remote, webFrame } = electron;
const { app } = electron.remote;
const d3 = require('d3');
d3.tip = require('d3-tip');

let fegsScopingData;
let fegsScopingView;
let fegsScopingController;
let tableAttributes;
const appTitle = `FEGS Scoping Tool ${app.getVersion()} | BETA | US EPA`;

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

// Set the colors used in d3 visualizations
const criteriaColors = [
  '#4f81bd',
  '#c0504d',
  '#9bbb59',
  '#8064a2',
  '#4bacc6',
  '#f79646',
  '#2c4d75',
  '#772c2a',
  '#5f7530'
];
const beneficiaryColors = [
  '#DDD9C3',
  '#C4BD97',
  '#948A54',
  '#948A54',
  '#4A452A',
  '#1E1C11',
  '#050503',
  '#DCE6F2',
  '#C6D9F1',
  '#8EB4E3',
  '#558ED5',
  '#376092',
  '#1F497D',
  '#254061',
  '#10253F',
  '#CCC1DA',
  '#B3A2C7',
  '#604A7B',
  '#403152',
  '#D99694',
  '#953735',
  '#F9FDD1',
  '#F9F383',
  '#F5F018',
  '#FFFF00',
  '#DBEEF4',
  '#B7DEE8',
  '#93CDDD',
  '#4BACC6',
  '#31859C',
  '#215968',
  '#C3D69B',
  '#77933C',
  '#FAC090',
  '#E46C0A',
  '#D9D9D9',
  '#A6A6A6'
];

const beneTier1Colors = [
  '#663300',
  '#0000cc',
  '#660066',
  '#ff0000',
  '#ff9900',
  '#00ffff',
  '#70ad47',
  '#ffff66',
  '#b2b2b2'
];

/**
 * Get the data for the global scores and return them in a JSON object.
 * @function
 * @return {object} - A JSON object containing the criteria and their scores.
 */
const getScores = function getScores() {
  const data = [];
  Object.entries(fegsScopingData.scores).forEach(row => {
    data.push({
      label: row[0],
      value: row[1]
    });
  });
  return data;
};

/** sum all values in an object */
const sum = function sum(obj) {
  let total = 0;
  const keys = Object.keys(obj);
  keys.forEach(el => {
    total += parseFloat(obj[el]);
  });
  return total;
};

// Format the stakeholder data for use in the stakeholder bar chart
const formatStakeholderData = function formatStakeholderData() {
  const data = [];

  Object.entries(fegsScopingData.stakeholders).forEach(entry => {
    const stakeholder = {};
    [stakeholder.stakeholder] = entry;

    Object.entries(entry[1].scores).forEach(criterion => {
      stakeholder[criterion[0]] =
        +criterion[1] * (+fegsScopingData.scores[criterion[0]] / sum(fegsScopingData.scores));
    });

    data.push(stakeholder);
  });
  return data;
};

/** pie chart - used for all pie charts in the app */
const initPieChart = {
  draw(config) {
    Array.from(document.getElementsByClassName(`d3-tip ${config.element}`)).forEach(element => {
      element.parentNode.removeChild(element);
    });

    const domEle = config.element;
    let { data } = config;
    const { colors } = config;
    const width = 310;
    const height = 485;
    const radius = Math.min(width, height) / 2;

    const color = d3.scaleOrdinal(colors); // Set the colors

    const pie = d3.pie().value(d => {
      const keyName = d.label
        .replace(/\s*([/])\s*/g, '$1')
        .replace(/[&,()]/g, '')
        .replace(/\s+|[/]/g, '-')
        .toLowerCase();
      const element = document.querySelector(`.key.${keyName}`);
      if (element) {
        if (d.value !== 0) {
          document.querySelector(`.key.${keyName}`).parentElement.removeAttribute('hidden');
        } else {
          document.querySelector(`.key.${keyName}`).parentElement.setAttribute('hidden', '');
        }
      }
      return d.value;
    })(data);

    const tip = d3
      .tip()
      .attr('class', `d3-tip ${config.element}`)
      .offset([50, 0])
      .html(d => {
        const index = fegsScopingData.criteria.indexOf(d.data.label);
        let { label } = d.data;
        if (index >= 0) {
          label = fegsScopingData.fegsCriteria[index];
        }
        return `${label}: ${round(d.data.value, 1)}`;
      });

    const arc = d3
      .arc()
      .outerRadius(radius - 10)
      .innerRadius(0);

    d3.selectAll(`.${domEle} > *`).remove();

    Object.values(pie).forEach(prop => {
      if (prop.value) {
        const element = document.getElementById(domEle);
        if (element) {
          element.removeAttribute('hidden');
        }
        // break;
      }
    });

    const svg = d3
      .selectAll(`.${domEle}`)
      .append('div')
      .classed('svg-container', true) // container class to make it responsive
      .append('svg')
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('viewBox', `0 0 ${width} ${width}`)
      .classed('svg-content-responsive', true)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g').attr('transform', `translate(${width / 2}, ${height / 2})`); // Moving the center point. 1/2 the width and 1/2 the height

    g.call(tip);

    const arcg = g
      .selectAll('arc')
      .data(pie)
      .enter()
      .append('g')
      .attr('class', 'arc');

    arcg
      .append('path')
      .attr('d', arc)
      .style('fill', d => {
        return color(d.index);
      })
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)
      .each(function storeAngles(d) {
        this._current = d;
      }); // store the initial angles

    // used when there's an update to the pie charts
    function change() {
      const updatedPie = d3
        .pie()
        .sort(null)
        .value(d => d.value)(data);

      function checkD3Data(chart) {
        for (let i = 0; i < Object.keys(chart).length; i += 1) {
          if (updatedPie[Object.keys(chart)[i]].value) {
            return true;
          }
        }
        return false;
      }

      const element = document.getElementById(domEle);
      if (element) {
        if (checkD3Data(updatedPie)) {
          document.getElementById(domEle).removeAttribute('hidden');
        } else {
          document.getElementById(domEle).setAttribute('hidden', '');
        }
      }

      const path = d3
        .selectAll(`.${domEle}`)
        .selectAll('path')
        .data(updatedPie)
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);

      path
        .transition()
        .duration(500)
        .attrTween('d', arcTween); // Smooth transition with arcTween
      updateBeneficiaryView();
      updateAttributeView();
    }

    // Code for just the criteria pie
    if (domEle === 'criteria-pie') {
      d3.selectAll('.scoring input').on('input', function criteriaPieInput() {
        clearNotices();
        const inputs = document.querySelectorAll('.scoring input');
        let allValid = true;
        for (let i = 0; i < inputs.length; i += 1) {
          let selected = false;
          if (this === inputs[i]) {
            selected = true;
          }
          const { value } = inputs[i];
          const isValid = validateInput(value, 0, 100);
          if (isValid) {
            inputs[i].classList.remove('invalid-text-input');
            fegsScopingData.scores[inputs[i].id.replace('-score', '')] = value;
          } else {
            allValid = false;
            if (selected) {
              inputs[i].classList.add('invalid-text-input');
              accessiblyNotify('Enter a number between 0 and 100');
            }
          }
        }

        data = getScores();
        change();
        stakeholderBarchart();

        if (allValid && document.getElementById('section-stakeholders').hasAttribute('hidden')) {
          // showSection('stakeholders');
        }

        updateWeightingProgress();
        fegsScopingView.indicateUnsaved();
      });
    }

    function arcTween(a) {
      const i = d3.interpolate(this._current, a);
      this._current = i(0);
      return function innerArcTween(t) {
        return arc(i(t));
      };
    }
  }
};

/** stacked bar-chart - used for all stacked barcharts */
const initStackedBarChart = {
  draw(config) {
    const domEle = config.element;
    const stackKey = config.key;
    const legendKey = config.legend;
    const { data } = config;
    const { header } = config;
    const { colors } = config;
    const margin = {
      top: 20,
      right: 350,
      bottom: 20,
      left: 350
    };

    Array.from(document.getElementsByClassName(`d3-tip ${config.element}`)).forEach(element => {
      element.parentNode.removeChild(element);
    });

    let divWidth = document.getElementById('main-content').offsetWidth;
    if (divWidth > 1395) {
      divWidth = 1395;
    } else if (divWidth < 550) {
      divWidth = 550;
    }
    const width = divWidth - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const yScale = d3
      .scaleBand()
      .range([height, 0])
      .padding(0.1);
    const xScale = d3.scaleLinear().range([0, width]);
    const color = d3.scaleOrdinal(colors);
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);
    const container = d3.select(`#${domEle}`);

    container.selectAll('svg').remove();

    if (data.length === 0) {
      return null; // if there's no data to display don't display anything!
    }
    const svg = container
      .append('svg')
      .attr('class', 'barchart')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + 10 + margin.bottom + 10 + 30)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const tip = d3
      .tip()
      .attr('class', 'd3-tip stacked-bar-chart')
      .offset([-10, 0])
      .html(function tooltipHtml(d) {
        const index = fegsScopingData.criteria.indexOf(this.parentNode.getAttribute('data-label'));
        let label = this.parentNode.getAttribute('data-label');
        if (index >= 0) {
          label = fegsScopingData.fegsCriteria[index];
        }
        return `<div><span>${label}:</span> <span style="color:white">${round(d[1] - d[0], 1)}</span></div>`;
      });
    svg.call(tip);

    const stack = d3
      .stack()
      .keys(stackKey)
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone);

    const layers = stack(data);
    data.sort(function (a, b) {
      return b.total - a.total;
    });
    yScale.domain(
      data.map(function (d) {
        return d[header];
      })
    );
    xScale.domain([
      0,
      d3.max(data, function (d) {
        return Object.values(d).reduce(function (acc, val) {
          return acc + (isNaN(val) ? 0 : val);
        }, 0);
      })
    ]);

    const layer = svg
      .selectAll('.layer')
      .data(layers)
      .enter()
      .append('g')
      .attr('class', 'layer')
      .style('fill', function (d, i) {
        return color(i);
      })
      .attr('data-label', function (d, i) {
        return stackKey[i];
      });

    layer
      .selectAll('rect')
      .data(function (d) {
        return d;
      })
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('y', function (d) {
        return yScale(d.data[header]);
      })
      .attr('x', function (d) {
        if (isNaN(d[0])) {
          return xScale(0);
        }
        return xScale(d[0]);
      })
      .attr('width', function (d) {
        if (isNaN(d[0])) {
          return xScale(0) - xScale(0);
        }
        if (isNaN(d[1])) {
          return xScale(0) - xScale(0);
        }
        return xScale(d[1]) - xScale(d[0]);
      })
      .attr('height', yScale.bandwidth())
      .on('click', function () {
        d3.selectAll('.bar').classed('selected', false);
        d3.select(this).classed('selected', true);
      })
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);

    svg
      .append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', `translate(0,${height + 5})`)
      .call(xAxis)
      .selectAll('.tick text')
      .style('text-anchor', 'middle')
      .attr('dy', '0.8em');

    svg
      .append('g')
      .attr('class', 'axis axis--y')
      .attr('transform', 'translate(0,0)')
      .call(yAxis);

    if (legendKey) {
      const legend = svg
        .append('g')
        .attr('class', 'chart-legend')
        .selectAll('g')
        .data(legendKey)
        .enter()
        .append('g')
        .attr('transform', function (d, i) {
          return `translate(30,${i * 19})`;
        });

      legend
        .append('rect')
        .attr('x', width - 18)
        .attr('width', 18)
        .attr('height', 18)
        .attr('fill', function (d, i) {
          return colors[i];
        });

      legend
        .append('text')
        .attr('x', width + 5)
        .attr('y', 9)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'start')
        .text(function (d) {
          return d;
        });
    }

    return container;
  }
};

// Draw or update the stakeholder bar chart
function stakeholderBarchart() {
  initStackedBarChart.draw({
    data: formatStakeholderData(),
    key: fegsScopingData.criteria,
    element: 'stakeholder-barchart',
    header: 'stakeholder',
    colors: criteriaColors
  });
}

// Format the beneficiary data for use in the beneficiary bar chart
const formatBeneficiaryData = function formatBeneficiaryData() {
  const data = [];
  const stakeholders = Object.entries(fegsScopingData.stakeholders);
  for (let i = 0; i < fegsScopingData.fegsBeneficiaries.length; i += 1) {
    const beneficiary = {};
    const beneficiaryName = fegsScopingData.fegsBeneficiaries[i];

    for (let j = 0; j < stakeholders.length; j += 1) {
      const stakeholder = stakeholders[j];
      if (
        Object.prototype.hasOwnProperty.call(stakeholder[1].beneficiaries, beneficiaryName) &&
        stakeholder[1].beneficiaries[beneficiaryName].percentageOfStakeholder !== ''
      ) {
        beneficiary[stakeholder[0]] = fegsScopingData.beneficiaryScoreForStakeholder(
          beneficiaryName,
          stakeholder[0]
        );
      }
    }

    if (Object.keys(beneficiary).length !== 0) {
      beneficiary.beneficiary = beneficiaryName;
      data.push(beneficiary);
    }
  }
  return data;
};

// Format the attribute data for use in the attribute bar chart
function formatAttributeData() {
  const data = [];

  Object.keys(fegsScopingData.calculateAttributeScores()).forEach(attribute => {
    data.push(fegsScopingData.calculateAttributeScoresTier1(attribute));
  });

  // for (const attribute in fegsScopingData.calculateAttributeScores()) {
  //   data.push(fegsScopingData.calculateAttributeScoresTier1(attribute));
  // }
  return data;
}

// Create or update the beneficiary bar chart
const beneficiaryBarchart = function beneficiaryBarchart() {
  initStackedBarChart.draw({
    data: formatBeneficiaryData(),
    key: Object.keys(fegsScopingData.stakeholders),
    legend: Object.keys(fegsScopingData.stakeholders),
    element: 'beneficiary-barchart',
    header: 'beneficiary',
    colors: [
      '#e6194b',
      '#3cb44b',
      '#ffe119',
      '#0082c8',
      '#f58231',
      '#911eb4',
      '#46f0f0',
      '#f032e6',
      '#d2f53c',
      '#fabebe',
      '#008080',
      '#e6beff',
      '#aa6e28',
      '#fffac8',
      '#800000',
      '#aaffc3',
      '#808000',
      '#ffd8b1',
      '#000080',
      '#808080',
      '#000000'
    ]
  });
};

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

// Draw or update the beneficiary bar chart
function beneficiaryPiechart() {
  initPieChart.draw({
    data: getTier1BeneficiaryScoresForPieChart(),
    colors: beneTier1Colors,
    element: 'beneficiary-pie',
    legend: [...new Set(Object.values(fegsScopingData.fegsBeneficiariesTier1))]
  });
}

// Updates the beneficiary section charts
const updateBeneficiaryView = function updateBeneficiaryView() {
  beneficiaryBarchart();
  beneficiaryPiechart();
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

function attributeBarChartBeneficiaries() {
  const arr = [];
  const benes = fegsScopingData.getExtantBeneficiaries();
  for (let i = 0; i < benes.length; i += 1) {
    if (arr.indexOf(fegsScopingData.fegsBeneficiariesTier1[benes[i]]) < 0) {
      arr.push(fegsScopingData.fegsBeneficiariesTier1[benes[i]]);
    }
  }
  return arr;
}

/**
 * Creates or updates the attribute pie chart
 * @function
 */
function attributeBarchart() {
  initStackedBarChart.draw({
    data: formatAttributeData(),
    key: attributeBarChartBeneficiaries(),
    legend: attributeBarChartBeneficiaries(),
    element: 'attribute-barchart', // attribute-barchart
    header: 'attribute',
    colors: [
      '#e6194b',
      '#3cb44b',
      '#ffe119',
      '#0082c8',
      '#f58231',
      '#911eb4',
      '#46f0f0',
      '#f032e6',
      '#d2f53c',
      '#fabebe',
      '#008080',
      '#e6beff',
      '#aa6e28',
      '#fffac8',
      '#800000',
      '#aaffc3',
      '#808000',
      '#ffd8b1',
      '#000080',
      '#808080',
      '#000000'
    ]
  });
}

/**
 * Creates or updates the attribute pie chart with TIER 1 attributes
 * @function
 */
function attributePiechartTier1() {
  initPieChart.draw({
    data: getTier1AttributeScoresForPieChart(), // attribute-pie
    colors: d3.schemeCategory10,
    element: 'tier1-attribute-pie'
  });
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

  attributePiechartTier1();
  attributeBarchart();
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
 * Creates or updates the criteria pie chart
 * @function
 */
function criteriaPiechart() {
  initPieChart.draw({
    data: getScores(), // Get the score data
    colors: criteriaColors,
    element: 'criteria-pie'
  });
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
const FEGSScopingData = function FEGSScopingData() {
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
      beneficiaries: {}
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

        if (attributes) {
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
    const criteria = Object.keys(this.scores);
    let total = 0;
    for (let k = 0; k < criteria.length; k += 1) {
      if (typeof this.stakeholders[stakeholder].scores[criteria[k]] === 'undefined') {
        accessiblyNotify(`${stakeholder} has no score for ${criteria[k]}`);
      } else {
        total +=
          parseFloat(this.scores[criteria[k]]) *
          parseFloat(this.stakeholders[stakeholder].scores[criteria[k]]);
      }
    }
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

  this.appName = appTitle;
  this.version = app.getVersion() || '1.0.0';
  this.projectName = 'New Project';
  this.projectDescription = '';
  this.notes = {
    weights: '',
    stakeholders: '',
    beneficiaries: '',
    attributes: ''
  };
  this.filePath = '';
  this.criteria = [
    'magnitude',
    'influence',
    'interest',
    'urgency',
    'proximity',
    'economic-interest',
    'rights',
    'fairness',
    'representation'
  ];
  this.fegsCriteria = [
    'Magnitude & Probability of Impact',
    'Level of influence',
    'Level of Interest',
    'Urgency & Temporal immediacy',
    'Proximity',
    'Economic interest',
    'Rights',
    'Fairness',
    'Underrepresented & Underserved representation'
  ];
  this.scores = this.makeCriteriaObject('0');
  this.stakeholders = {};
  this.attributes = {};
  this.attributeDefs = { // {tier1: {attribute: def, ...}, ...}
    'Water': {
      'Water Quality': '',
      'Water Quantity': '',
      'Water Movement': '',
    },
    'Air & Weather': {
      'Air Quality': '',
      'Wind Strength / Speed': '',
      'Precipitation': '',
      'Sunlight': '',
      'Temperature': '',
    },
    'Soil & Substrate': {
      'Soil Quantity': '',
      'Soil Quality': '',
      'Substrate Quantity': '',
      'Substrate Quality': '',
    },
    'Natural Materials': {
      'Fuel Quality': '',
      'Fuel Quantity': '',
      'Fiber Material Quantity': '',
      'Fiber Material Quality': '',
      'Mineral / Chemical Quantity': '',
      'Mineral / Chemical Quality': '',
      'Presence of Other Natural Materials for Artistic Use or Consumption (e.g. Shells, Acorns, Honey)': '',
    },
    'Flora': {
      'Flora Community': '',
      'Edible Flora': '',
      'Medicinal Flora': '',
      'Keystone Flora': '',
      'Charismatic Flora': '',
      'Rare Flora': '',
      'Commercially Important Flora': '',
      'Spiritually / Culturally Important Flora': '',
    },
    'Fungi': {
      'Fungal Community': '',
      'Edible Fungi': '',
      'Medicinal Fungi': '',
      'Rare Fungi': '',
      'Commercially Important Fungi': '',
      'Spiritually / Culturally Important Fungi': '',
    },
    'Fauna': {
      'Fauna Community': '',
      'Edible Fauna': '',
      'Medicinal Fauna': '',
      'Keystone Fauna': '',
      'Charismatic Fauna': '',
      'Rare Fauna': '',
      'Pollinating Fauna': '',
      'Pest Predator / Depredator Fauna': '',
      'Commercially Important Fauna': '',
      'Spiritually / Culturally Important Fauna': '',
    },
    'Extreme Events': {
      'Risk of Flooding': '',
      'Risk of Fire': '',
      'Risk of Extreme Weather Events': '',
      'Risk of Earthquakes': '',
    },
    'Composite': {
      'Sounds': '',
      'Scents': '',
      'Viewscapes': '',
      'Phenomena (e.g. Sunsets, Northern Lights, etc)': '',
      'Ecological Condition': '',
      'Acreage': '',
    },
  }
  this.tier1 = [] // [tier, ...]
  this.fegsAttributes = [] // [attribute, ...]
  this.fegsAttributesTier1 = {} // {attribute: tier, ...}
  for (let tier1 in this.attributeDefs) {
    this.tier1.push(tier1)
    for (let attribute in this.attributeDefs[tier1]) {
      this.fegsAttributes.push(attribute)
      this.fegsAttributesTier1[attribute] = tier1
    }
  }
  this.beneficiaryDefs = { // {tier1: {beneficiary: def, ...}, ...}
    'Agricultural': {
      'Livestock Grazers': '',
      'Agricultural Processors': '',
      'Aquaculturalists': '',
      'Farmers': '',
      'Foresters': '',
    },
    'Commercial / Industrial': {
      'Food Extractors': '',
      'Timber / Fiber / Ornamental Extractors': '',
      'Industrial Processors': '',
      'Energy Generators': '',
      'Pharmaceutical / Food Supplement Suppliers': '',
      'Fur / Hide Trappers / Hunters': '',
      'Commercial Property Owners': '',
      'Private Drinking Water Plant Operators': '',
    },
    'Governmental / Municipal / Residential': {
      'Municipal Drinking Water Plant Operators': '',
      'Public Energy Generators': '',
      'Residential Property Owners': '',
      'Military / Coast Guard': '',
    },
    'Transportation': {
      'Transporters of Goods': '',
      'Transporters of People': '',
    },
    'Subsistence': {
      'Water Subsisters': '',
      'Food and Medicinal Subsisters': '',
      'Timber / Fiber / Ornamental Subsisters': '',
      'Building Material Subsisters': '',
    },
    'Recreational': {
      'Experiencers / Viewers': '',
      'Food Pickers / Gatherers': '',
      'Hunters': '',
      'Anglers': '',
      'Waders / Swimmers / Divers': '',
      'Boaters': '',
    },
    'Inspirational': {
      'Spiritual and Ceremonial Participants': '',
      'Artists': '',
    },
    'Learning': {
      'Students and Educators': '',
      'Researchers': '',
    },
    'Non-Use': {
      'People Who Care': '',
    },
  }
  this.fegsBeneficiaries = [] // [beneficiary, ...]
  this.fegsBeneficiariesTier1 = {} // {beneficiary: tier, ...}
  for (let tier1 in this.beneficiaryDefs) {
    for (let beneficiary in this.beneficiaryDefs[tier1]) {
      this.fegsBeneficiaries.push(beneficiary)
      this.fegsBeneficiariesTier1[beneficiary] = tier1
    }
  }
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
      document.querySelectorAll('button.save-button:not([aria-hidden="true"])').forEach(btn => btn.click()) // greasy hack for in-edit stakeholder rows
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
  };

  /** update name displayed in titlebar and header */
  this.updateDescription = function updateDescription(description) {
    this.projectDescription = description; // update the description of the view
    this.showDescription.style.display = 'inline-block';
    this.inputDescription.style.display = 'none';
    this.saveDescriptionButton.style.display = 'none';
    this.inputDescription.value = description;
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
      document.querySelector(`#${criterion}-score`).value = fegsScopingData.scores[criterion];
    }

    // restore notes
    Object.keys(fegsScopingData.notes).forEach(note => {
      document.querySelector(`#${note}-note`).value = fegsScopingData.notes[note];
    });

    // Run d3 chart functions
    criteriaPiechart();
    document.getElementById('beneficiary-charts').removeAttribute('hidden');
    beneficiaryBarchart();
    beneficiaryPiechart();
    attributePiechartTier1();
    attributeBarchart();

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

    stakeholderBarchart();

    updateSelectStakeholder('select-stakeholder');
    const event = new Event('change');
    document.getElementById('select-stakeholder').dispatchEvent(event);
    updateStakeholderProgress();
    document.getElementById('stakeholder-table-container').style.display = 'block';
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
    attributePiechartTier1();
    attributeBarchart();
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

// Declare Data, View, and Controller.
fegsScopingData = new FEGSScopingData();
fegsScopingView = new FEGSScopingView();
fegsScopingController = new FEGSScopingController();

// Declare attributes table
tableAttributes = tableAttributesCreator('table-attributes');

updateSelectBeneficiary('select-beneficiary');
showSelectedBeneficiary(document.getElementById('select-beneficiary'));

// Update progress
updateStakeholderProgress();
updateWeightingProgress();
updateBeneficiaryProgress();
updateAttributeProgress();

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

// Listen for save as from main process
ipcRenderer.on('save-as', (event, arg) => {
  fegsScopingData.filePath = arg;
  fegsScopingController.saveJSON(arg, fegsScopingData);
  fegsScopingView.indicateSaved(arg);
});

// Listen for save as from main process
ipcRenderer.on('save-as-and-refresh', (event, arg) => {
  fegsScopingData.filePath = arg;
  fegsScopingController.saveJSON(arg, fegsScopingData);
  fegsScopingView.indicateSaved(arg);
  window.location.reload(true);
});

// Listen for save as from main process
ipcRenderer.on('save-as-and-open', (event, saveName, openName) => {
  fegsScopingData.filePath = saveName;
  fegsScopingController.saveJSON(saveName, fegsScopingData);
  fegsScopingView.indicateSaved(saveName);

  fegsScopingView.restoreView(openName);
  fegsScopingView.indicateSaved(openName);
});

// Listen for save as from main process then quit
ipcRenderer.on('save-as-and-quit', (event, saveName) => {
  fegsScopingData.filePath = saveName;
  fegsScopingController.saveJSON(saveName, fegsScopingData);
  fegsScopingView.indicateSaved(saveName);

  ipcRenderer.send('quit');
});

// Listen for save from main process and refresh
ipcRenderer.on('save-and-refresh', () => {
  if (fegsScopingData.filePath !== '') {
    fegsScopingController.saveJSON(fegsScopingData.filePath, fegsScopingData);
    fegsScopingView.indicateSaved(fegsScopingData.filePath);
    window.location.reload(true);
  } else {
    ipcRenderer.send('save-as-and-refresh', fegsScopingData.projectName);
  }
});

// Listen for save from main process and quit
ipcRenderer.on('save-and-quit', () => {
  if (fegsScopingData.filePath !== '') {
    fegsScopingController.saveJSON(fegsScopingData.filePath, fegsScopingData);
    fegsScopingView.indicateSaved(fegsScopingData.filePath);
    ipcRenderer.send('quit');
  } else {
    ipcRenderer.send('save-as-and-quit', fegsScopingData.projectName);
  }
});

// Listen for save from main process and open
ipcRenderer.on('save-and-open', (event, arg) => {
  if (fegsScopingData.filePath !== '') {
    fegsScopingController.saveJSON(fegsScopingData.filePath, fegsScopingData);
    fegsScopingView.indicateSaved(fegsScopingData.filePath);
    fegsScopingView.restoreView(arg[0]);
    fegsScopingView.indicateSaved(arg[0]);
  } else {
    ipcRenderer.send('save-as-and-open', fegsScopingData.projectName, arg[0]);
  }
});

// Listen for save from main process
ipcRenderer.on('save', () => {
  if (fegsScopingData.filePath !== '') {
    fegsScopingController.saveJSON(fegsScopingData.filePath, fegsScopingData);
    fegsScopingView.indicateSaved(fegsScopingData.filePath);
  } else {
    ipcRenderer.send('save-as', fegsScopingData.projectName);
  }
});

// Listen for open file from main process
ipcRenderer.on('open-file', (event, arg) => {
  fegsScopingView.restoreView(arg[0]);
  fegsScopingView.indicateSaved(arg[0]);
  //updateWeightingProgress()
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
  stakeholderBarchart();
  beneficiaryBarchart();
  attributeBarchart();
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
  stakeholderBarchart();
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
  for (let i = 0; i < stakeholderScoreInputs.length; i += 1) {
    const stakeholder = stakeholderScoreInputs[i].parentNode.getAttribute('data-stakeholder');
    const criterion = stakeholderScoreInputs[i].getAttribute('data-criterion');

    if (!Object.prototype.hasOwnProperty.call(stakeholdersToAdd, stakeholder)) {
      stakeholdersToAdd[stakeholder] = {};
      const value = parseInt(stakeholderScoreInputs[i].value, 10);
      const isValid = validateInput(value, 0, 100);
      if (isValid) {
        stakeholdersToAdd[stakeholder][criterion] = value;
      } else {
        accessiblyNotify('Invalid inputs. Please review your stakeholder weights.');
        return {};
      }
    } else {
      stakeholdersToAdd[stakeholder][criterion] = stakeholderScoreInputs[i].value;
    }
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
 * Creates an HTML button element with the text and class specified.
 * @function
 * @param {string} text - The text to be displayed on the button.
 * @param {string} className - The class to assign to the button.
 * @return {Element} - The HTML button element.
 */
const createButton = function createButton(text, className) {
  const button = document.createElement('button');
  button.innerHTML = text;
  button.className = className;
  return button;
};

/**
 * Adds a row containing the specified data to the table, with appropriate listeners.
 * @function
 * @param {string} tableID - The ID of the table element.
 * @param {array} rowData - An array containing the data to display in the table.
 */
function addRow(tableID, rowData) {
  const tableRef = document.getElementById(tableID).getElementsByTagName('tbody')[0]; // Get a reference to the table
  const newRow = tableRef.insertRow(); // Insert a row in the table at row index 0

  const editButton = createButton('Edit', 'edit-button'); // Create Buttons
  const saveButton = createButton('Save', 'save-button');
  saveButton.setAttribute('aria-hidden', 'true');
  const removeButton = createButton('Remove', 'remove-button');

  let newCell = newRow.insertCell(); // Insert a cell in the row to hold the buttons
  newCell.appendChild(editButton);
  newCell.appendChild(saveButton);
  newCell.appendChild(removeButton);

  removeButton.addEventListener('click', function clickRemoveStakeholder() {
    fegsScopingView.indicateUnsaved();
    // create listeners for the buttons
    const stakeholder = this.parentNode.nextSibling.innerHTML;
    fegsScopingData.removeStakeholders([stakeholder]);
    this.parentNode.parentNode.remove();
    removeOptionFromSelect('select-stakeholder', stakeholder);
    stakeholderBarchart();
    const stakeholderCount = Object.keys(fegsScopingData.stakeholders).length;
    if (stakeholderCount === 0) {
      document.getElementById('stakeholder-table-container').style.display = 'none';
    }
    updateBeneficiaryView();
    updateAttributeView();
  });

  editButton.addEventListener('click', function clickEditStakeholder() {
    fegsScopingView.indicateUnsaved();
    this.setAttribute('aria-hidden', 'true'); // hide the edit button
    const row = this.parentNode.parentNode;
    row.getElementsByClassName('save-button')[0].removeAttribute('aria-hidden'); // show the save button
    const { cells } = row;
    cells[1].innerHTML = `<input style="min-width: 8rem;" data-original-value="${cells[1].innerText}" type="text" value="${cells[1].innerText}"/>`;
    for (let i = 2, { length } = cells; i < length; i += 1) {
      const cell = cells[i];
      const text = cell.innerText;
      cell.innerHTML = `<input data-original-value="${text}" type="text" value="${text}"/>`; // create an input with the cell value
    }
  });

  saveButton.addEventListener('click', function clickSaveStakeholder() {
    fegsScopingView.indicateUnsaved(); // not yet saved to file
    const row = this.parentNode.parentNode;
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
      const newVal = +cell.firstElementChild.value;
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

    this.setAttribute('aria-hidden', 'true'); // hide the save button
    row.getElementsByClassName('edit-button')[0].removeAttribute('aria-hidden'); // show the edit button

    fegsScopingData.stakeholders[newStakeholderName].scores = scores;
    updateSelectStakeholder('select-stakeholder'); // update select-box that its entries have changed
    stakeholderBarchart();
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
  for (let i = 0; i < document.querySelectorAll(`#${tableID} .definition`).length; i += 1) {
    const element = document.querySelectorAll(`#${tableID} .definition`)[i];
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

function attributePiechart() {
  initPieChart.draw({
    data: getAttributeScoresForPieChart(), // attribute-pie
    colors: d3.schemeSet3,
    element: 'attribute-pie'
  });
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
  const tBody = table.tBodies[0];
  let rowIndex;
  let cell;
  let input;
  // let cellText;
  // let rowspan;
  // let numberOfBeneficiaryColumnsInRow;

  // validate sum of percentages is 100 +- 0.05 then save
  const beneficiaryPercentageOfStakeholderInputValidator = function beneficiaryPercentageOfStakeholderInputValidator() {
    clearNotices();
    let percentageSum = 0;
    // let input;
    const inputs = document.getElementsByClassName('beneficiary-percentage-of-stakeholder');
    for (let j = 0; j < inputs.length; j += 1) {
      const value = parseFloat(inputs[j].value);

      if (value > 100 || value < 1) {
        inputs[j].parentElement.style = 'background-color: #ffcccc';
        accessiblyNotify(`Values must be between 1 and 100. The current value is ${value}.`);
        return;
      }

      if (isNaN(value)) {
        inputs[j].parentElement.style = 'background-color: #ffcccc';
      }
      percentageSum += Number(inputs[j].value);
    }
    // inform user of unnormalized percentages
    if (percentageSum < 99.95 || percentageSum > 100.05) {
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

  for (let i = tBody.rows[0].cells.length - 1; i > 2; i -= 1) {
    // remove all data columns
    removeLastColumnFromTable(table.id);
  }
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
  }

  updateSelectBeneficiary('select-beneficiary');
  showSelectedBeneficiary(document.getElementById('select-beneficiary'));
  updateBeneficiaryProgress();
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

document.addEventListener('DOMContentLoaded', () => {
  criteriaPiechart();
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

  document.querySelectorAll('.add-note-btn').forEach(ele => {
    ele.addEventListener('click', event => {
      const notetype = event.target.dataset.noteId;
      const label = document.querySelector(`#${notetype}-note-label`);
      const note = document.querySelector(`#${notetype}-note`);
      const saveBtn = document.querySelector(`#${notetype}-save-btn`);
      const pressed = event.target.getAttribute('aria-pressed') === 'true';
      let hidden = false;

      event.target.setAttribute('aria-pressed', !pressed);

      hidden = !label.hidden;
      label.hidden = hidden;
      note.hidden = hidden;
      saveBtn.hidden = hidden;
    });
  });

  document.querySelectorAll('.save-note-btn').forEach(ele => {
    ele.addEventListener('click', event => {
      const notetype = event.target.dataset.noteId;
      const label = document.querySelector(`#${notetype}-note-label`);
      const note = document.querySelector(`#${notetype}-note`);
      const saveBtn = document.querySelector(`#${notetype}-save-btn`);
      const pressed = event.target.getAttribute('aria-pressed') === 'true';
      const hidden = !label.hidden;

      event.target.setAttribute('aria-pressed', !pressed);

      // save note
      fegsScopingData.notes[`${notetype}`] = note.value;

      // hide menu
      label.hidden = hidden;
      note.hidden = hidden;
      saveBtn.hidden = hidden;
    });
  });

  document.querySelectorAll('#toggle-attributes button').forEach(ele => {
    ele.addEventListener('click', event => {
      const element = event.target;
      const pressed = element.getAttribute('aria-pressed') === 'true';
      element.setAttribute('aria-pressed', !pressed);
      toggleAttributeRow(element.innerText);
    });
  });

  toggleAllAttributes();

  document.querySelectorAll('#toggle-beneficiaries button').forEach(ele => {
    ele.addEventListener('click', event => {
      const element = event.target;
      const pressed = element.getAttribute('aria-pressed') === 'true';
      element.setAttribute('aria-pressed', !pressed);
      toggleBeneficiaryRow(element.innerText);
    });
  });

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

