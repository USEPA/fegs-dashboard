 /** Prototype data-model and its CRUD-methods. */
    var FEGSScopingData = function() {

      /**
       * This object-factory sets value as specified in arg criteria
       *  else to defaultValue.
       *
       * @param {string|Object.<string, string>} values - a single
       *  string to use as a value for all criteria or an object
       *  specifying each value as a numerical string indexed by
       *  its criterion
       */
      this.makeCriteriaObject = function(values) {
        var valuesObject = {};
        var defaultValue = '';
        var i;
        var valuesCriteria;
        if (typeof(values) === 'string') {
          for (i = 0; i < this.criteria.length; i++) {
            valuesObject[this.criteria[i]] = values;
          }
          return valuesObject;
        } else if (typeof(values) === 'object') {
          if (values.length) {
            throw 'Argument values should be an object or a string but values is neither.';
          }
          valuesCriteria = Object.keys(values);
          for (i = 0; i < valuesCriteria.length; i++) {
            if (String(this.criteria.indexOf(String(valuesCriteria[i]))) === '-1') {
              throw 'An unkown criterion was supplied as a key: ' + valuesCriteria[i];
            }
            valuesObject[valuesCriteria[i]] = values[valuesCriteria[i]];
          }
          for (i = 0; i < this.criteria.length; i++) {
            if (valuesCriteria.indexOf(this.criteria[i]) === -1) {
              valuesObject[this.criteria[i]] = defaultValue;
            }
          }
          return valuesObject;
        } else {
          throw 'expected values to be an object or a string but was neither';
        }
      };

      /**
       * add a stakeholder and its criteria-scores
       * @param {string} stakeholderName - name of stakeholder to add
       * @param {Object <string>.<string>} stakeholderScores -
       *  criteria are keys and respective scores for this
       *  stakeholder are values
       */
      this.addStakeholder = function(stakeholderName, stakeholderScores) {
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
       this.updateStakeholder = function(stakeholderName, stakeholderScores) {
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
      this.renameStakeholder = function(oldStakeholderName, newStakeholderName) {
        this.stakeholders[newStakeholderName] = this.stakeholders[oldStakeholderName];
        this.removeStakeholders([oldStakeholderName]);
      };

      /**
       * add a beneficiary and its percentage of its stakeholder
       * @param {string} stakeholderName - owner of beneficiary
       */
      this.addBeneficiary = function(stakeholderName, beneficiaryName, percentageOfStakeholder) {
        if (typeof(percentageOfStakeholder) === 'undefined') { // validate argument percentageOfStakeholder
          percentageOfStakeholder = '';
        }
        this.stakeholders[stakeholderName]
          .beneficiaries[beneficiaryName] = {
            'percentageOfStakeholder': percentageOfStakeholder
          };
      };

      /**
       * add attributes to this.attributes
       * @param {string} beneficiaryName - owner of attributes
       * @param {Object <string>.<string>} attributes - keys are
       *  attribute-names and values are percentages of the
       *  corresponding attributes' owning beneficiary
       */
      this.addAttributes = function(beneficiaryName, attributes) {
        if (typeof(this.attributes) === 'undefined') {
          this.attributes = {};
        }
        this.attributes[beneficiaryName] = {};
        var keys = Object.keys(attributes)
        for (i = 0; i < keys.length; i++) {
          this.attributes[beneficiaryName][keys[i]] = {
            percentageOfBeneficiary: attributes[keys[i]]
          };
        }
      };

      this.clearOtherAttributes = function(beneficiaries) {
        for (var i = 0; i < fegsScopingData.fegsBeneficiaries.length; i++) {
          if (beneficiaries.indexOf(fegsScopingData.fegsBeneficiaries[i]) < 0) {
            for (var attribute in fegsScopingData.attributes[fegsScopingData.fegsBeneficiaries[i]]) {
              fegsScopingData.attributes[fegsScopingData.fegsBeneficiaries[i]][attribute].percentageOfBeneficiary = '';
            }
          }
        }
      };

      /**
       * remove stakeholders named in an array
       * @param {Array.<string>} stakeholdersArray - names of
       *  stakeholders to be removed
       */
      this.removeStakeholders = function(stakeholdersArray) {
        for (var i = 0; i < stakeholdersArray.length; i++) {
          delete(this.stakeholders[stakeholdersArray[i]]);
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
      this.removeBeneficiariesFromStakeholder = function(beneficiariesObject) {
        var stakeholdersArray = Object.keys(beneficiariesObject);
        for (var i = 0; i < stakeholdersArray.length; i++) {
          var beneficiariesArray = beneficiariesObject[stakeholdersArray[i]];
          for (var j = 0; j < beneficiariesArray.length; j++) {
            delete(this.stakeholders[stakeholdersArray[i]]
              .beneficiaries[beneficiariesArray[j]]);
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
      this.removeBeneficiariesCompletely = function(beneficiariesArray) {
        var stakeholdersArray = Object.keys(this.stakeholders);
        for (var i = 0; i < stakeholdersArray.length; i++) {
          for (var j = 0; j < beneficiariesArray.length; j++) {
            delete(this.stakeholders[stakeholdersArray[i]]
              .beneficiaries[beneficiariesArray[j]]);
            delete(this.attributes[beneficiariesArray[j]]);
          }
        }
      };

      /**
       * remove attributes named in an array
       * @param {Array.<string>} attributesArray -
       *  attributes to be removed specified like
       *  [attributeName]
       */
      this.removeAttributesCompletely = function(attributesArray) {
        var beneficiariesArray = Object.keys(this.attributes);
        for (var j = 0; j < beneficiariesArray.length; j++) {
          for (var k = 0; k < attributesArray.length; k++) {
            delete(this.attributes[benficiariesArray[k]][attributesArray[k]]);
          }
        }
      };

      /** assign properties of valuesObject to this */
      this.add = function(valuesObject) {
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
      this.sumBeneficiaryPercentages = function(stakeholderNames, beneficiaryNames) {
        if (typeof(stakeholderNames) === 'undefined') {
          stakeholderNames = Object.keys(fegsScopingData.stakeholders);
        }
        if (typeof(beneficiaryNames) === 'undefined') {
          beneficiaryArray = fegsScopingData.fegsBeneficiaries;
        } else {
          beneficiaryArray = beneficiaryNames;
        }
        sum = 0;
        for (var i = 0; i < stakeholderNames.length; i++) {
          for (var j = 0; j < beneficiaryArray.length; j++) {
            sum += +fegsScopingData.stakeholders[stakeholderNames[i]]
                    .beneficiaries[beneficiaryArray[j]]
                    .percentageOfStakeholder;
            }
        }
        console.log(sum);
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
      this.sumAttributePercentages = function(beneficiaryNames, attributeNames) {
        if (typeof(beneficiaryNames) === 'undefined') {
          beneficiaryNames = Object.keys(this.attributes);
        }
        sum = 0;
        for (var j = 0; j < beneficiaryNames.length; j++) {
          if (typeof(attributeNames) === 'undefined') {
            attributeArray = Object.keys(this.attributes[beneficiaryNames[j]]);
          } else {
            attributeArray = attributeNames;
          }
          for (var k = 0; k < attributeArray.length; k++) {
            sum += +this.attributes[beneficiaryNames[j]][attributeArray[k]].percentageOfBeneficiary;
          }
        }
        console.log(sum);
      };

      /**
       * return {..., benName_i: percentageOfStakeholder_i, ...}
       *  for the named stakeholder
       */
      this.getEachBeneficiaryPercentage = function(stakeholderName) {
        var percentages = {};
        var beneficiaryNames = Object.keys(this.stakeholders[stakeholderName].beneficiaries);
        for (i = 0; i < beneficiaryNames.length; i++) {
          percentages[beneficiaryNames[i]] = this.stakeholders[stakeholderName].beneficiaries[beneficiaryNames[i]].percentageOfStakeholder;
        }
        return percentages;
      };

      /**
       * return the sum of scores times stakeholder-score
       *  for each criterion
       * @param {string} stakeholders - stakeholder whose scores
       *  will be summed
       */
      this.scoresTimesScoresSum = function(stakeholder) {
        var criteria = Object.keys(this.scores);
        var sum = 0;
        for (var k = 0; k < criteria.length; k++) {
          if (typeof(this.stakeholders[stakeholder].scores[criteria[k]]) === 'undefined') {
            accessiblyNotify(stakeholder + ' has no score for ' + criteria[k]);
            continue;
          }
          sum += parseFloat(this.scores[criteria[k]]) * parseFloat(this.stakeholders[stakeholder].scores[criteria[k]]);
        }
        return sum;
      };

      /**
       * return the sum of beneficiary-scores for all stakeholders
       * @param {string} beneficiary - beneficiary whose
       *  scores are summed
       */
      this.beneficiaryScore = function(beneficiary) {
        var stakeholders = Object.keys(this.stakeholders);
        var numerator = 0;
        var denominator = 0;
        for (var i = 0; i < stakeholders.length; i++) {
          if (Object.keys(this.stakeholders[stakeholders[i]].beneficiaries).length) {
            var percentageOfStakeholder = parseFloat(this.stakeholders[stakeholders[i]].beneficiaries[beneficiary].percentageOfStakeholder);
            if (isNaN(percentageOfStakeholder)) {
              continue;
            }
            numerator += percentageOfStakeholder *
              parseFloat(this.scoresTimesScoresSum(stakeholders[i]));
          }
        }
        for (var j = 0; j < stakeholders.length; j++) {
          denominator += parseFloat(this.scoresTimesScoresSum(stakeholders[j]));
        }
        return numerator / denominator;
      };

      this.calculateAttributeScores = function() {
        var attributeScores = {};
        for (var i = 0; i < this.fegsAttributes.length; i++) {
          var sum = 0;
          for (var beneficiary in this.attributes) {
            var percentage = parseInt(this.attributes[beneficiary][this.fegsAttributes[i]].percentageOfBeneficiary);
            if (Number.isInteger(percentage) && percentage !== 0) {
              console.log("Beneficiary: " + beneficiary);
              console.log("Percentage: " + percentage);
              sum += percentage * this.beneficiaryScore(beneficiary);
            }
          }
          if (sum !== 0) {
            console.log("Attribute: " + this.fegsAttributes[i]);
            console.log("Sum: " + sum);
            attributeScores[this.fegsAttributes[i]] = sum;
          }
        }
        return attributeScores;
      };

      this.calculateAttributeScoresNew = function() {
        var totalSum = 0;
        var attributeScores = {};
        for (var i = 0; i < this.fegsAttributes.length; i++) {
          var attributeSum = 0;
          for (var beneficiary in this.attributes) {
            var percentage = parseInt(this.attributes[beneficiary][this.fegsAttributes[i]].percentageOfBeneficiary);
            if (Number.isInteger(percentage) && percentage !== 0) {
              //console.log("Beneficiary: " + beneficiary);
              //console.log("Percentage: " + percentage);
              attributeSum += percentage * this.beneficiaryScore(beneficiary);
            }
          }
          if (attributeSum !== 0) {
            //console.log("Attribute: " + this.fegsAttributes[i]);
            //console.log("attributeSum: " + attributeSum);	
          }
          attributeScores[this.fegsAttributes[i]] = attributeSum;
          totalSum += attributeSum;
        }
        console.log("Total: " + totalSum);

        for (var attribute in attributeScores) {
          attributeScores[attribute] = attributeScores[attribute] / totalSum * 100;
          console.log(attribute + ": " + attributeScores[attribute] / totalSum * 100);
        }
      };

      this.calculateAttributeScore = function(attribute) {
        var sum = 0;
        for (var beneficiary in this.attributes) {
          var percentage = parseInt(this.attributes[beneficiary][attribute].percentageOfBeneficiary);
          if (Number.isInteger(percentage) && percentage !== 0) {
            //console.log("Beneficiary: " + beneficiary);
            //console.log("Percentage: " + percentage);
            sum += percentage * this.beneficiaryScore(beneficiary);
          }
        }
        if (sum !== 0) {
          //console.log("Attribute: " + attribute);
          //console.log("Sum: " + sum);	
        }
        return sum;
      };

      /**
       * return the sum of stakeholder-scores for all stakeholders [stakeholder weight * relative weight / sum of relative weights]
       * @param {string} stakeholder - stakeholder whose
       *  scores are summed
       */
      this.stakeholderPrioritizationScores = function(stakeholder) {
        var score = 0;
        var overallScore = this.calculateOverallScore(); // sum of relative weights
        return score;
      };

      /**
       * return the overall score (sum of relative weights)
       */
      this.calculateOverallScore = function() {
        var elements = Object.values(fegsScopingData.scores);
        var overallScore = 0;
        for (var i = 0; i < elements.length; i++) {
          overallScore += +elements[i];
        }
        return overallScore;
      };

      /** return current array of extant beneficiaries */
      this.extantBeneficiaries = function() {
        var extantStakeholders = Object.keys(this.stakeholders);
        var extantBeneficiaries = [];
        var stakeholderIndex;
        var beneficiaryIndex;
        var beneficiaries;
        for (stakeholderIndex = 0; stakeholderIndex < extantStakeholders.length; stakeholderIndex++) {
          beneficiaries = Object.keys(this.stakeholders[extantStakeholders[stakeholderIndex]].beneficiaries);
          for (beneficiaryIndex = 0; beneficiaryIndex < beneficiaries.length; beneficiaryIndex++) {
            if (extantBeneficiaries.indexOf(beneficiaries[beneficiaryIndex]) === -1 &&
              this.stakeholders[extantStakeholders[stakeholderIndex]].beneficiaries[beneficiaries[beneficiaryIndex]].percentageOfStakeholder !== '') {
              extantBeneficiaries.push(beneficiaries[beneficiaryIndex]);
            }
          }
        }
        return extantBeneficiaries;
      };

      this.updateName = function(name) {
        this.projectName = name;
      };

      this.appName = 'FEGS Scoping Tool';
      this.version = '0.1.0';
      this.projectName = 'New Project';
      this.filePath = '';
      this.criteria = ['magnitude', 'influence', 'interest', 'urgency', 'proximity', 'economic-interest', 'rights', 'fairness', 'representation'];
      this.fegsCriteria = ['Magnitude & Probability of Impact', 'Level of influence', 'Level of Interest', 'Urgency & Temporal immediacy', 'Proximity', 'Economic interest', 'Rights', 'Fairness', 'Underrepresented & Underserved representation'];
      this.scores = this.makeCriteriaObject('0');
      this.stakeholders = {};
      this.attributes = {};
      this.fegsAttributes = ["Water quality", "Water quantity", "Water movement", "Air quality", "Wind strength / speed", "Precipitation", "Sunlight", "Temperature", "Soil quantity", "Soil quality", "Substrate quantity", "Substrate quality", "Fuel quality", "Fuel quantity", "Fiber material quantity", "Fiber material quality", "Mineral / chemical quantity", "Mineral / chemical quality", "Presence of other natural materials for artistic use or consumption (e.g. shells, acorns, honey)", "Flora community", "Edible flora", "Medicinal flora", "Keystone flora", "Charismatic flora", "Rare flora", "Commercially important flora", "Spiritually / culturally important flora", "Fungal community", "Edible fungi", "Medicinal fungi", "Rare fungi", "Commercially important fungi", "Spiritually/culturally important fungi", "Fauna community", "Edible fauna", "Medicinal fauna", "Keystone fauna", "Charismatic fauna", "Rare fauna", "Pollinating fauna", "Pest predator / depredator fauna", "Commercially important fauna", "Spiritually / culturally important fauna", "Risk of flooding", "Risk of fire", "Risk of extreme weather events", "Risk of earthquakes", "Sounds", "Scents", "Viewscapes", "Phenomena (e.g. sunsets, northern lights, etc)", "Ecological condition", "Acreage"];
      this.fegsBeneficiaries = ['Irrigators', 'CAFO Operators', 'Livestock grazers', 'Agricultural processors', 'Aquaculturalists', 'Farmers', 'Foresters', 'Food extractors', 'Timber / Fiber / Ornamental extractors', 'Industrial processors', 'Industrial dischargers', 'Energy generators', 'Resource dependent businesses', 'Pharmaceutical / Food supplement suppliers', 'Fur / Hide trappers / hunters', 'Municipal drinking water plant operators', 'Wastewater treatment plant operators', 'Residential property owners', 'Military / Coast Guard', 'Transporters of goods', 'Transporters of people', 'Water subsisters', 'Food subsisters', 'Timber / Fiber / Fur / Hide subsisters', 'Building material subsisters', 'Experiencers / viewers', 'Food pickers / gatherers', 'Hunters', 'Anglers', 'Waders / Swimmers / Divers', 'Boaters', 'Spiritual and ceremonial participants', 'Artists', 'Students and educators', 'Researchers', 'People who care (existence)', 'People who care (option, bequest)'];
    }; //////// END PROTOTYPE FEGScopingData ////////

    /** Prototype controller of communication between data and view */
    FEGSScopingController = function() {

      /** scrape data from the page and save the data */
      this.saveView = function(filename = "data.json") {
        var returnValue;
        var userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.indexOf(' electron/') > -1) { // true if in NODE's ELECTRON
          returnValue = fegsScopingController.saveJSON('data.json', fegsScopingView.scrapePage());
        } else { // else is selected if this instance appears to be running in the browser
          returnValue = this.downloadText('data.json', JSON.stringify(fegsScopingView.scrapePage()));
        }
        return returnValue;
      };

      /** save validated data */
      this.saveValidatedData = function(filename) {
        if (!filename) {
          filename = 'data.json'
        }
        this.saveJSON(filename, fegsScopingData);
        fegsScopingView.indicateSaved();
      };

      /** update name of an instance of the app */
      this.updateName = function(name) {
        fegsScopingView.updateName(name);
        fegsScopingData.updateName(name);
      };

      this.getCurrentStakeholder = function() {
        return fegsScopingView.getCurrentStakeholder();
      };

      /** scrape state of page */
      this.scrapePage = function() {
        console.log("scrapePage")
        var scrapedValues;
        var scores = {};
        var beneficiaries = {};
        var attributes = {};
        var i;
        var j;
        for (i = 0; i < fegsScopingData.criteria.length; i++) { // save view-state of #table-scores
          scores[fegsScopingData.criteria[i] + '-score'] = document.getElementById(fegsScopingData.criteria[i] + '-score').value;
        }
        if (document.getElementById('table-beneficiaries').rows[0].cells.length > 2) { // scrape #table-beneficiaries conditioned upon whether table-beneficiaries is populated
          for (i = 0; i < fegsScopingData.fegsBeneficiaries.length; i++) { // loop through each row of the table
            if (+(document.getElementById('table-beneficiaries').rows[i + 1].cells.length) < 3) { // does the row have two th-elements?
              beneficiaries[fegsScopingData.fegsBeneficiaries[i]] = document.getElementById('table-beneficiaries').rows[i + 1].cells[1].firstChild.value; // scrape this beneficiary's value
            } else { // the row appears to have only one th as a label
              beneficiaries[fegsScopingData.fegsBeneficiaries[i]] = document.getElementById('table-beneficiaries').rows[i + 1].cells[2].firstChild.value; // scrape this beneficiary's value
            }
          }
        } else { // no beneficiaries are populated into #table-beneficiaries
          console.log('no attributes recorded from view');
        }
        for (i = 0; i < fegsScopingData.fegsBeneficiaries.length; i++) {
          attributes[fegsScopingData.fegsBeneficiaries[i]] = {};
          for (j = 0; j < fegsScopingData.fegsAttributes.length; j++) {
            attributes[fegsScopingData.fegsBeneficiaries[i]][fegsScopingData.fegsAttributes[j]] = tableAttributes.cellInputValue(tableAttributes.cell(fegsScopingData.fegsAttributes[j], fegsScopingData.fegsBeneficiaries[i]));
          }
        }
        /* //works in BROWSER
        document.getElementById('scrape-page').setAttribute('data-view-state', JSON.stringify({'scores': scores, 'beneficiaries': beneficiaries, 'attributes': attributes})); */
        scrapedValues = {
          'scores': scores,
          'beneficiaries': beneficiaries,
          'attributes': attributes
        };
        return scrapedValues;
      };

      /** save json to file; requires ELECTRON */
      this.saveJSON = function(savePath, jsonToBeSaved) {
        console.log("saveJSON");
        var fs = require('fs');
        var jsonText;
        if (typeof(jsonToBeSaved) !== 'string') {
          jsonText = JSON.stringify(jsonToBeSaved);
        } else {
          jsonText = jsonToBeSaved;
        }
        fs.writeFileSync(savePath, jsonText);
      };

      /** download given text to given filename; works in BROWSER */
      this.downloadText = function(filename, text) {
        console.log("FEGSScopingController downloadText")
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }

      /** read data-model from disk; requires ELECTRON */
      this.importData = function(filename) {
        if (typeof(process) === 'undefined' || !process.versions.electron) {
          console.log('electron is needed for importing data');
          return;
        }
        if (typeof(filename) === 'undefined') {
          filename = 'data.json';
        }
        importedData = require('fs').readFileSync(filename);
        importedData = JSON.parse(importedData);
        importedData = Object.assign(fegsScopingData, importedData);
        return importedData;
      };

    }; //////// END PROTOTYPE FEGSScopingController ////////

    /** sum all values in an object */
    var sum = function(obj) {
      var sum = 0;
      for (var el in obj) {
        if (obj.hasOwnProperty(el)) {
          sum += parseFloat(obj[el]);
        }
      }
      return sum;
    }

    /** pie chart */
    var initPieChart = {
      draw: function(config) {
        var me = this;
        var domEle = config.element;
        var data = config.data;
        var colors = config.colors;
        var width = 400;
        var height = 480;
        var radius = Math.min(width, height) / 2;

        var legendRectSize = 18;
        var legendSpacing = 4;

        var color = d3.scaleOrdinal(colors); // Set the colors

        var pie = d3.pie().value(function(d) {
          return d.value;
        })(data);

        var tip = d3.tip()
          .attr('class', 'd3-tip')
          .offset([50, 0])
          .html(function(d) {
            var index = fegsScopingData.criteria.indexOf(d.data.label);
            var label = d.data.label;
            if (index >= 0) {
              label = fegsScopingData.fegsCriteria[index];
            }
            return label + ": " + round(d.data.value, 1);
          });

        var arc = d3.arc()
          .outerRadius(radius - 10)
          .innerRadius(0);

        d3.selectAll('.' + domEle + ' > *').remove();

        for (var prop in pie) {
          if (pie[prop].value) {
            var element = document.getElementById(domEle);
            if (element) {
              element.removeAttribute("hidden");
            }
            break;
          }
        }

        var svg = d3.selectAll("." + domEle)
          .append("svg")
          .attr("width", width)
          .attr("height", height)
          .append("g")
          .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")"); // Moving the center point. 1/2 the width and 1/2 the height

        svg.call(tip);

        var g = svg.selectAll("arc")
          .data(pie)
          .enter().append("g")
          .attr("class", "arc");

        g.append("path")
          .attr("d", arc)
          .style("fill", function(d) {
            return color(d.index);
          })
          .on('mouseover', tip.show)
          .on('mouseout', tip.hide)
          .each(function(d) {
            this._current = d;
          }); // store the initial angles

        //update
        function change() {
          var pie = d3.pie().sort(null)
            .value(function(d) {
              return d.value;
            })(data);

          var tip = d3.tip()
          .attr('class', 'd3-tip')
          .offset([50, 0])
          .html(function(d) { 
            return d.data.label + ": " + d.data.value;
          });

          svg.call(tip);
            
          function checkD3Data(chart) {
            for (var prop in chart) {
              if (pie[prop].value) {
                return true;
              }
            }
            return false;
          }
          
          var element = document.getElementById(domEle);
          if (element) {
            if (checkD3Data(pie)) {
              document.getElementById(domEle).removeAttribute("hidden");
            } else {
              document.getElementById(domEle).setAttribute("hidden", "");
            }
          }

          path = d3.selectAll("." + domEle)
            .selectAll("path")
            .data(pie)
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);

          path.transition().duration(500).attrTween("d", arcTween); // Smooth transition with arcTween
          updateBeneficiaryView();
          updateAttributeView();
        }

        if (domEle === "criteria-pie") {
          d3.selectAll(".scoring input")
          .on("input", function() {
            clearNotices();
            var inputs = document.querySelectorAll(".scoring input");
            var allValid = true;
            for (var i = 0; i < inputs.length; i++) {
              var selected = false;
              if (this === inputs[i]) {
                selected = true;
              }
              var value = inputs[i].value;
              var isValid = validateInput(value, 1, 100);
              if (isValid) {
                this.classList.remove('invalid-text-input');
                fegsScopingData.scores[this.id.replace('-score', '')] = value;
                data = getScores();
                change();
                stakeholderBarchart();
              } else {
                allValid = false;
                if (selected) {
                  this.classList.add('invalid-text-input');
                  accessiblyNotify('Enter a number between 1 and 100');
                }
              }
            }

            if (allValid && document.getElementById("section-stakeholders").hasAttribute('hidden')) {
              showSection("stakeholders");
            }

            updateWeightingProgress();
            fegsScopingView.indicateUnsaved();
          });
        }

        function arcTween(a) {
          var i = d3.interpolate(this._current, a);
          this._current = i(0);
          return function(t) {
            return arc(i(t));
          };
        }
      }
    };

    /**
     * Check if value is between min and max (inclusive)
     * @function
     * @return {bool} - A bool
     */
    var validateInput = function(value, min, max) {
      if (!isNaN(value)) {
        if (value > max || value < min) {
          return false;
        } else {
          return true;
        }
      } else {
        return false;
      }
    };

    /**
     * Get the data for the global scores and return them in a JSON object.
     * @function
     * @return {object} - A JSON object containing the criteria and their scores. 
     */
    function getScores() {
      var data = [];
      for (var prop in fegsScopingData.scores) {
        data.push({
          label: prop,
          value: fegsScopingData.scores[prop]
        });
      }
      return data;
    }

    function getBeneficiaryScoresForPieChart() {
      var data = [];
      for (var i = 0; i < fegsScopingData.fegsBeneficiaries.length; i++) {
        var bene = {};
        bene.label = fegsScopingData.fegsBeneficiaries[i];
        bene.value = fegsScopingData.beneficiaryScore(fegsScopingData.fegsBeneficiaries[i]);
        data.push(bene);
      }
      return data;
    }

    function getBeneficiaryScoresForBarChart() {
      var data = [];
      for (var i = 0; i < fegsScopingData.fegsBeneficiaries.length; i++) {
        var obj = {};
        var beneficiary = fegsScopingData.fegsBeneficiaries[i];
        for (var stakeholder in fegsScopingData.stakeholders) {
          var percentageOfStakeholders = fegsScopingData.stakeholders[stakeholder].beneficiaries[beneficiary].percentageOfStakeholder;
          if (percentageOfStakeholders) {
            if (!obj.hasOwnProperty("beneficiary")) {
              obj["beneficiary"] = beneficiary;
              obj.total = 0;
            }
            //obj[stakeholder] = percentageOfStakeholders;
            //obj.total += +percentageOfStakeholders;

            obj[stakeholder] = fegsScopingData.beneficiaryScore(beneficiary);
            obj.total += fegsScopingData.beneficiaryScore(beneficiary);
          }
        }
        if (obj.hasOwnProperty("beneficiary")) {
          data.push(obj);
        }
      }
      return data;
    }

    function getAttributeScoresForPieChart() {
      var data = [];
      var sumOfBeneficiaryScores = 0;
      for (var i = 0; i < fegsScopingData.extantBeneficiaries().length; i++) {
        sumOfBeneficiaryScores += fegsScopingData.beneficiaryScore(fegsScopingData.extantBeneficiaries()[i]);
      }
      for (var i = 0; i < fegsScopingData.fegsAttributes.length; i++) {
        var sum = 0;
        for (var beneficiary in fegsScopingData.attributes) {
          var percentage = parseInt(fegsScopingData.attributes[beneficiary][fegsScopingData.fegsAttributes[i]].percentageOfBeneficiary);
          if (Number.isInteger(percentage) && percentage !== 0) {
            sum += percentage * fegsScopingData.beneficiaryScore(beneficiary);
          }
        }
        if (sum !== 0) {
          var datum = {};
          datum.label = fegsScopingData.fegsAttributes[i];
          datum.value = sum / sumOfBeneficiaryScores;
          data.push(datum);
        }
      }
      return data;
    }

    document.getElementById("stakeholder-group").addEventListener("keyup", function(event) {
      event.preventDefault();
      if (event.keyCode === 13) {
        document.getElementById("add-stakeholder").click();
      }
    });

    /**
     * Adds a stakeholder based on the input data
     * @function
     */
    function addStakeholder() {
      var weights = fegsScopingData.makeCriteriaObject({});
      var stakeholderGroupInput = document.getElementById('stakeholder-group');
      var stakeholderGroup = stakeholderGroupInput.value;
      stakeholderGroupInput.value = '';

      if (Object.keys(fegsScopingData.stakeholders).indexOf(stakeholderGroup) !== -1) { // if the stakeholder exists or is blank.
        accessiblyNotify('A stakeholder with this name already exists.');
        return;
      } else if (stakeholderGroup.trim() === "") {
        accessiblyNotify('Enter a valid stakeholder name.');
        return;
      }
      fegsScopingData.addStakeholder(stakeholderGroup, weights); // add the stakeholder to the model
      document.getElementById('set-stakeholder-values').style.display = "block";
      document.getElementById('stakeholder-list').style.display = "block";

      var stakeholderList = document.getElementById('stakeholder-list'); // create the stakeholder list
      var li = document.createElement('li');
      li.setAttribute('data-stakeholder', stakeholderGroup);
      li.appendChild(document.createTextNode(stakeholderGroup));

      var button = document.createElement('button');
      button.setAttribute('class', 'remove-stakeholder');
      button.setAttribute('aria-label', 'remove stakeholder');
      button.innerHTML = '&#215;';

      button.addEventListener("click", function() { // create listeners for the remove stakeholder button
        var stakeholder = this.parentNode.getAttribute('data-stakeholder');
        var elementsToRemove = document.querySelectorAll('[data-stakeholder="' + stakeholder + '"]');
        for (var i = 0, length = elementsToRemove.length; i < length; i++) {
          elementsToRemove[i].remove();
        }
        fegsScopingData.removeStakeholders([stakeholder]);
        updateStakeholderProgress();
        if (document.getElementById("stakeholder-list").children.length === 0) {
          document.getElementById('set-stakeholder-values').style.display = "none";
        }
      });

      li.appendChild(button);
      stakeholderList.appendChild(li); // append the button and li elements to the ul

      var lists = document.getElementsByClassName('stakeholder-value-list');
      for (var i = 0; i < lists.length; i++) { // Create the score inputs for the added stakeholder
        var ul = lists[i];
        var li = document.createElement('li');
        li.setAttribute('class', 'stakeholder-score-item');
        li.setAttribute('data-stakeholder', stakeholderGroup);
        li.appendChild(document.createTextNode(stakeholderGroup));

        var input = document.createElement('input');
        input.setAttribute('type', 'number');
        input.setAttribute('min', '0');
        input.setAttribute('max', '100');
        input.setAttribute('step', '1');
        input.setAttribute('class', 'stakeholder-score-input');
        input.setAttribute('id', stakeholderGroup + '-' + ul.getAttribute('data-criterion'));
        input.setAttribute('data-criterion', ul.getAttribute('data-criterion'));
        input.oninput = function(){validateStakeholderScore(this);updateStakeholderProgress();};
        li.appendChild(input);
        ul.appendChild(li);
      }
      updateStakeholderProgress();
      fegsScopingView.indicateUnsaved();
    }

    function addStakeholderScores() {
      console.log('addStakeholderScores')
      var stakeholdersToAdd = scrapeAddStakeholders();
      if (Object.keys(stakeholdersToAdd).length < 1) {
        return;
      }
      for (var stakeholder in stakeholdersToAdd) {
        fegsScopingData.addStakeholder(stakeholder, stakeholdersToAdd[stakeholder]);
        addRow('table-stakeholders', [stakeholder, fegsScopingData.stakeholders[stakeholder]]); // table name and array of values to insert
      }
      document.getElementById('set-stakeholder-values').style.display = "none";
      document.getElementById('stakeholder-list').style.display = "none";
      clearStakeholderScores();
      stakeholderBarchart();
      updateSelectStakeholder('select-stakeholder');
      document.getElementById('select-stakeholder').onchange();
      updateStakeholderProgress();
      document.getElementById('stakeholder-table-container').style.display = "block";
      fegsScopingView.indicateUnsaved();
      document.getElementById("stakeholder-table-container").scrollIntoView();

      showSection("beneficiaries");
    }

    function clearStakeholderScores() {
      var items = document.getElementsByClassName('stakeholder-score-item');
      for (var i = items.length - 1; i >= 0; i--) {
        items[i].parentNode.removeChild(items[i]);
      }

      var names = document.getElementById('stakeholder-list');
      for (var j = names.children.length - 1; j >= 0; j--) {
        names.removeChild(names.children[j]);
      }
    }

    /*
      Scrape the values from the stakeholder inputs
    */
    function scrapeAddStakeholders() {
      var stakeholdersToAdd = {};
      var stakeholderScoreInputs = document.getElementsByClassName('stakeholder-score-input');
      for (var i = 0; i < stakeholderScoreInputs.length; i++) {
        var stakeholder = stakeholderScoreInputs[i].parentNode.getAttribute('data-stakeholder');
        var criterion = stakeholderScoreInputs[i].getAttribute('data-criterion');
        if (!stakeholdersToAdd.hasOwnProperty(stakeholder)) {
          stakeholdersToAdd[stakeholder] = {};
          var value = parseInt(stakeholderScoreInputs[i].value, 10);
          var isValid = validateInput(value, 0, 100);
          if (isValid) {
            stakeholdersToAdd[stakeholder][criterion] = value;
          } else {
            accessiblyNotify("Invalid inputs. Please review your stakeholder weights.");
            return {};
          }
          // } else if (criterion === "magnitude") {
          //   var sum = +stakeholdersToAdd[stakeholder][criterion] + +stakeholderScoreInputs[i].value;
          //   stakeholdersToAdd[stakeholder][criterion] = (sum >= 20 ? sum - 20 : 0) + '';
        } else {
          stakeholdersToAdd[stakeholder][criterion] = stakeholderScoreInputs[i].value;
        }
      }
      return stakeholdersToAdd;
    }

    function validateStakeholderScore(that) {
      clearNotices();
      var value = that.value;
      var isValid = validateInput(value, 0, 100);
      if (!isValid) {
        accessiblyNotify("Please enter a value between 0 and 100")
        that.classList.add('invalid-text-input');
      } else {
        that.classList.remove('invalid-text-input');
        clearNotices();
      }
    }

    function updateStakeholderProgress() {
      var stakeholderCount = Object.keys(fegsScopingData.stakeholders).length;
      if (stakeholderCount === 0) {
        document.getElementById('stakeholder-progress').innerHTML = "Add a stakeholder";
        return;
      }
      var newText = '';
      for (var stakeholder in fegsScopingData.stakeholders) {
        var completeCount = 0;
        var added = false;
        for (var criterion in fegsScopingData.stakeholders[stakeholder].scores) {
          if (fegsScopingData.stakeholders[stakeholder].scores[criterion]) {
            newText += stakeholder + ': added<br />';
            added = true;
            break;
          } else {
            var inputScore = document.getElementById(stakeholder + '-' + criterion).value;
            if (inputScore !== "" && inputScore <= 100 && inputScore > 0) {
              completeCount++;
            }
          }
        }
        if (!added) {
          newText += stakeholder + ': ' + completeCount + '/' + Object.keys(fegsScopingData.stakeholders[stakeholder].scores).length + ' criteria entered<br />';
        }
      }

      document.getElementById('stakeholder-progress').innerHTML = newText;
      updateBeneficiaryProgress();
    }

    function updateBeneficiaryProgress() {
      var stakeholderCount = Object.keys(fegsScopingData.stakeholders).length;
      if (stakeholderCount === 0) {
        document.getElementById('beneficiaries-progress').innerHTML = "Add a stakeholder";
        return;
      }
      var completeCount = stakeholderCount;
      for (var stakeholder in fegsScopingData.stakeholders) {
        if (!Object.keys(fegsScopingData.stakeholders[stakeholder].beneficiaries).length) {
          completeCount--;
        }
      }
      if (completeCount > 0) {
        var percentageSum = 0;
        var j, inputs, input;
        inputs = document.getElementsByClassName('beneficiary-percentage-of-stakeholder');
		    if (inputs.length) {
          for (j = 0; j < inputs.length; j++) {
            percentageSum += +inputs[j].value;
          }
          if (percentageSum < 99.95 || percentageSum > 100.05) { // inform user of unnormalized percentages
            //completeCount--; // Don't want to decrease count just because they entered data
          }
        }
      }
      document.getElementById('beneficiaries-progress').innerHTML = completeCount + " of " + stakeholderCount + " stakeholders completed";
    }

    function updateAttributeProgress() {
      var beneficiaryCount = fegsScopingData.extantBeneficiaries().length;
      if (beneficiaryCount === 0) {
        document.getElementById('attributes-progress').innerHTML = "Add a beneficiary";
        return;
      }
      var completeCount = 0;
      for (var beneficiary in fegsScopingData.attributes) {
        for (var attribute in fegsScopingData.attributes[beneficiary]) {
          if (fegsScopingData.attributes[beneficiary][attribute].percentageOfBeneficiary !== "") {
            completeCount++;
            break;
          }
        }
      }
      document.getElementById('attributes-progress').innerHTML = completeCount + " of " + beneficiaryCount + " beneficiaries completed";
    }

    function updateWeightingProgress() {
      // Count the empty weights and display a progress counter
      var inputs = document.querySelectorAll('.scoring input');
      var emptyInputs = [];
      for (var i = 0; i < inputs.length; i++) {
        if (!inputs[i].value || inputs[i].classList.contains('invalid-text-input')) {
          emptyInputs.push(inputs[i]);
        }
      }
      document.getElementById('weighting-progress').innerHTML = inputs.length - emptyInputs.length + " of " + inputs.length + " criteria completed";
    }

    var formatStakeholderData = function() {
      var data = [];
      for (var stakeholderGroup in fegsScopingData.stakeholders) {
        var stakeholder = {};
        stakeholder.stakeholder = stakeholderGroup;
        for (var criterion in fegsScopingData.stakeholders[stakeholderGroup].scores) {
          stakeholder[criterion] = +fegsScopingData.stakeholders[stakeholderGroup].scores[criterion] * (+fegsScopingData.scores[criterion] / sum(fegsScopingData.scores));
        }
        data.push(stakeholder);
      }
      return data;
    };

    var formatBeneficiaryData = function() {
      var data = [];
      for (var i = 0; i < fegsScopingData.fegsBeneficiaries.length; i++) {
        var beneficiary = {};
        var beneficiaryName = fegsScopingData.fegsBeneficiaries[i];
        for (var stakeholder in fegsScopingData.stakeholders) {
          if(fegsScopingData.stakeholders[stakeholder].beneficiaries.hasOwnProperty(beneficiaryName) && fegsScopingData.stakeholders[stakeholder].beneficiaries[beneficiaryName].percentageOfStakeholder != '') {
            beneficiary[stakeholder] = fegsScopingData.beneficiaryScore(beneficiaryName);
          }
        }
        if (Object.keys(beneficiary).length !== 0) {
          beneficiary.beneficiary = beneficiaryName;
          data.push(beneficiary);
        }
      }
      return data;
    };

    /**
     * Gets the checked value of a specified name of ratio inputs.
     * @function
     * @param {string} name - The name of the radio buttons.
     * @return {string} - The value associated with the checked radio button.
     */
    function getCheckedValueByName(name) {
      var elements = document.getElementsByName(name);
      for (var i = 0, length = elements.length; i < length; i++) {
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
      var tableRef = document.getElementById(tableID).getElementsByTagName('tbody')[0]; // Get a reference to the table
      var newRow = tableRef.insertRow(); // Insert a row in the table at row index 0

      var editButton = createButton('Edit', 'edit-button'); // Create Buttons
      var saveButton = createButton('Save', 'save-button');
      saveButton.setAttribute("aria-hidden", "true");
      var removeButton = createButton('Remove', 'remove-button');

      var newCell = newRow.insertCell(); // Insert a cell in the row to hold the buttons
      newCell.appendChild(editButton);
      newCell.appendChild(saveButton);
      newCell.appendChild(removeButton);

      removeButton.addEventListener("click", function() { // create listeners for the buttons
      console.log("click remove")
        var stakeholder = this.parentNode.nextSibling.innerHTML;
        fegsScopingData.removeStakeholders([stakeholder]);
        this.parentNode.parentNode.remove();
        removeOptionFromSelect('select-stakeholder', stakeholder);
        stakeholderBarchart();
        var stakeholderCount = Object.keys(fegsScopingData.stakeholders).length;
        if (stakeholderCount === 0) {
          document.getElementById('stakeholder-table-container').style.display = "none";
        }
        updateBeneficiaryView();
        updateAttributeView();
      });

      editButton.addEventListener("click", function() {
        this.setAttribute("aria-hidden", "true"); // hide the edit button
        var row = this.parentNode.parentNode;
        row.getElementsByClassName('save-button')[0].removeAttribute('aria-hidden'); // show the save button
        var cells = row.cells;
        for (var i = 1, length = cells.length; i < length; i++) {
          var cell = cells[i];
          var text = cell.innerHTML;
          cell.innerHTML = '<input class="form-text" data-original-value="' + text + '" type="text" value="' + text + '"/>'; // create an input with the cell value
        }
      });

      saveButton.addEventListener("click", function() {
        console.log("click save");
        this.setAttribute("aria-hidden", "true"); // hide the save button
        var row = this.parentNode.parentNode;
        row.getElementsByClassName('edit-button')[0].removeAttribute('aria-hidden'); // show the edit button
        var cells = row.cells;
        var originalStakeholderName = cells[1].innerText;
        if (cells[1].firstElementChild.hasAttribute("data-original-value")) {
          originalStakeholderName = cells[1].firstElementChild.getAttribute("data-original-value");
        }
        for (var i = 1, length = cells.length; i < length; i++) {
          var cell = cells[i];
          cell.innerHTML = cell.firstElementChild.value; // set the value of the cell to the value of the child input of the cell
        }
        var scores = {};
        for (var j = 0; j < fegsScopingData.criteria.length; j++) {
          var cell = document.getElementById(originalStakeholderName + '-' + fegsScopingData.criteria[j]);
          scores[fegsScopingData.criteria[j]] = cell.innerHTML;
          cell.id = cells[1].innerText + '-' + fegsScopingData.criteria[j];
        }
        scores = fegsScopingData.makeCriteriaObject(scores);
        var inputStakeholderValue = document.getElementById(originalStakeholderName + '-' + fegsScopingData.criteria[j])
        if (cells[1].innerText !== originalStakeholderName) {
          fegsScopingData.renameStakeholder(originalStakeholderName, cells[1].innerText);
        } else {
          fegsScopingData.updateStakeholder(originalStakeholderName, scores);
        }
        fegsScopingData.stakeholders[cells[1].innerText].scores = scores;
        updateSelectStakeholder('select-stakeholder'); // update select-box that its entries have changed
        stakeholderBarchart();
        updateBeneficiaryView();
        updateAttributeView();
      });
      var newCell = newRow.insertCell(); // Insert a cell in the row at index 0
      var newText = document.createTextNode(rowData[0]); // Append a text node to the cell
      newCell.appendChild(newText);
      for (var i = 0, length = fegsScopingData.criteria.length; i < length; i++) {
        var newCell = newRow.insertCell(); // Insert a cell in the row at index 0
        var newText = document.createTextNode(rowData[1].scores[fegsScopingData.criteria[i]]); // Append a text node to the cell
        newCell.id = rowData[0] + '-' + fegsScopingData.criteria[i];
        newCell.appendChild(newText);
      }
    }

    /**
     * Creates an HTML button element with the text and class specified.
     * @function
     * @param {string} text - The text to be displayed on the button.
     * @param {string} className - The class to assign to the button.
     * @return {Element} - The HTML button element.
     */
    function createButton(text, className) {
      var button = document.createElement("button");
      button.innerHTML = text;
      button.className = className;
      return button;
    }

    /**
     * Toggles the visibility of the spefied element.
     * @function
     * @param {string} id - The ID of the element to toggle visiibility.
     */
    function toggleVisibility(id) {
      var element = document.getElementById(id);
      if (element.style.display === "block") {
        element.style.display = "none";
      } else {
        element.style.display = "block";
      }
    }

    /** stacked bar-chart */
    var initStackedBarChart = {
      draw: function(config) {
        var domEle = config.element;
        var stackKey = config.key;
        var legendKey = config.legend;
        var data = config.data;
        var header = config.header;
        var colors = config.colors;
        var margin = {
          top: 20,
          right: 160,
          bottom: 35,
          left: 30
        };

        var divWidth = document.getElementById('beneficiary-charts').offsetWidth;
        if (divWidth > 1000) {
          divWidth = 1000;
        } else if (divWidth < 550) {
          divWidth = 550;
        }
        var width = divWidth - margin.left - margin.right;
        var height = 500 - margin.top - margin.bottom;

        var xScale = d3.scaleBand().range([0, width]).padding(0.1);
        var yScale = d3.scaleLinear().range([height, 0]);
        var color = d3.scaleOrdinal(colors);
        var xAxis = d3.axisBottom(xScale);
        var yAxis = d3.axisLeft(yScale);
        var container = d3.select("#" + domEle);

        container.selectAll('svg').remove();

        if (data.length === 0) {
          return; // if there's no data to display don't display anything!
        }
        var svg = container
          .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + 10 + margin.bottom + 10 + 30)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var tip = d3.tip()
          .attr('class', 'd3-tip')
          .offset([-10, 0])
          .html(function(d) {
            return "<div><span>Value:</span> <span style='color:white'>" + round(d[1] - d[0], 1) + "</span></div>";
          })
        svg.call(tip); 

        var stack = d3.stack()
          .keys(stackKey)
          .order(d3.stackOrderNone)
          .offset(d3.stackOffsetNone);

        var layers = stack(data);
        data.sort(function(a, b) {
          return b.total - a.total;
        });
        xScale.domain(data.map(function(d) {
          return d[header];
        }));
        yScale.domain([0, d3.max(data, function(d) { return Object.values(d).reduce(function(acc, val) { return acc + (isNaN(val) ? 0 : val); }, 0); })]);

        var layer = svg.selectAll(".layer")
          .data(layers)
          .enter().append("g")
          .attr("class", "layer")
          .style("fill", function(d, i) {
            return color(i);
          });

        layer.selectAll("rect")
          .data(function(d) {
            return d;
          })
          .enter().append("rect")
          .attr('class', 'bar')
          .attr("x", function(d) {
            return xScale(d.data[header]);
          })
          .attr("y", function(d) {
            return yScale(d[1]);
          })
          .attr("height", function(d) {
            return yScale(d[0]) - yScale(d[1]);
          })
          .attr("width", xScale.bandwidth())
          .on('click', function(d, i) {
            d3.selectAll('.bar').classed('selected', false);
            d3.select(this).classed('selected', true);
          })
          .on('mouseover', tip.show)
          .on('mouseout', tip.hide);

        svg.append("g")
          .attr("class", "axis axis--x")
          .attr("transform", "translate(0," + (height + 5) + ")")
          .call(xAxis)
          .selectAll(".tick text")
          .call(wrap, xScale.bandwidth());

        svg.append("g")
          .attr("class", "axis axis--y")
          .attr("transform", "translate(0,0)")
          .call(yAxis);

        if (legendKey) {
          var legend = svg.append("g")
          .attr("font-family", "sans-serif")
          .attr("font-size", 10)
          .selectAll("g")
          .data(legendKey)
          .enter().append("g")
          .attr("transform", function(d, i) {
              return "translate(30," + i * 19 + ")";
          });

        legend.append("rect")
          .attr("x", width - 18)
          .attr("width", 18)
          .attr("height", 18)
          .attr("fill", function(d, i) {return colors[i];});

        legend.append("text")
          .attr("x", width + 5)
          .attr("y", 9)
          .attr("dy", "0.35em")
          .attr("text-anchor", "start")
          .text(function(d) {
              return d;
          });
        }

        return container;
      }
    };

    function wrap(text, width) {
      text.each(function() {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            y = text.attr("y"),
            dy = parseFloat(text.attr("dy")),
            tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
        while (word = words.pop()) {
          line.push(word);
          tspan.text(line.join(" "));
          if (tspan.node().getComputedTextLength() > width) {
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", `${++lineNumber * lineHeight + dy}em`).text(word);
          }
        }
      });
    }
    /** horizontal bar-chart */
    var initBarChart = {
      draw: function(config) {
        var domEle = config.element;
        var data = config.data;
        var colors = config.colors;
        var margin = {top: 20, right: 20, bottom: 50, left: 300};
        var divWidth = document.getElementById('beneficiary-charts').offsetWidth;
        if (divWidth > 1000) {
          divWidth = 1000;
        } else if (divWidth < 550) {
          divWidth = 550;
        }
        var width = divWidth - margin.left - margin.right;
        var height = 750 - margin.top - margin.bottom;
        var container = d3.select("#" + domEle);
        container.selectAll('svg').remove();
        if (data.length === 0) {
          return; // if there's no data to display don't display anything!
        }
        var svg = container
          .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + 10 + margin.bottom + 10 + 30)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var yScale = d3.scaleBand().range([height, 0]).padding(0.3);
        var xScale = d3.scaleLinear().range([0, width]);
        var yAxis = d3.axisLeft(yScale);
        var xAxis = d3.axisBottom(xScale);
        var colorScale = d3.scaleOrdinal(colors);

        var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
              return "<div><span>Attribute:</span> <span style='color:white'>" + d.label + "</span></div>" +
                     "<div><span>Value:</span> <span style='color:white'>" + round(d.value, 2) + "</span></div>";
            });

        svg.call(tip); 

        yScale.domain(data.map(function(d) { return d["label"]; }));
        xScale.domain([0, d3.max(data, function(d) { return d["value"]; })]);
        colorScale.domain(data.map(function(d) { return d["label"]; }));

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .selectAll(".tick text")
            .call(wrap, 250);

        d3.selectAll('#' + domEle + ' .y line').remove();

        svg.append("g")
            .attr("class", "x axis")
            .call(xAxis)
            .attr("transform", "translate(0," + height + ")");

        svg.selectAll(".bar")
            .data(data)
          .enter().append("rect")
            .attr("class", "bar")
            .attr("width", function(d) { return xScale(d["value"]); })
            .attr("y", function(d) { return yScale(d["label"]); })
            .attr("height", yScale.bandwidth())
            .attr("fill", function (d){ return colorScale(d["label"])})
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);
      }
    };

    var getStakeholderPrioritizationsFromTable = function() {
      var table = document.getElementById('table-stakeholders');
      var tbody = table.getElementsByTagName('tbody')[0]; // get all rows of body
      var rows = tbody.getElementsByTagName('tr');
      var data = [];
      if (rows.length > 0) {
        for (var i = 0; i < rows.length; i++) {
          data[i] = {};
          cells = rows[i].getElementsByTagName('td');
          data[i]['stakeholder'] = cells[1].innerText;
          for (var j = 2; j < cells.length; j++) {
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
    var addTableColumn = function(tableId, columnName, dataArray) {
      var table = document.getElementById(tableId);
      table.tHead.rows[0].innerHTML += '<th>' + columnName + '</th>';
      for (var i = 0; i < dataArray.length; i++) {
        table.tBodies[0].rows[i].innerHTML += '<td>' + dataArray[i] + '</td>';
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
    var getTableCell = function(table, x, y) {
      var m = [],
        row, cell, xx, tx, ty, xxx, yyy;
      for (yyy = 0; yyy < table.rows.length; yyy++) {
        row = table.rows[yyy];
        for (xxx = 0; xxx < row.cells.length; xxx++) {
          cell = row.cells[xxx];
          xx = xxx;
          for (; m[yyy] && m[yyy][xx]; ++xx) {}
          for (tx = xx; tx < xx + cell.colSpan; ++tx) {
            for (ty = yyy; ty < yyy + cell.rowSpan; ++ty) {
              if (!m[ty])
                m[ty] = [];
              m[ty][tx] = true;
            }
          }
          if (xx <= x &&
            x < xx + cell.colSpan &&
            yyy <= y &&
            y < yyy + cell.rowSpan)
            return cell;
        }
      }
      return null;
    };

    /** Add an option with given value and text to a given select-box. */
    var addOption = function(selectId, optionText, optionValue) {
      var select = document.getElementById(selectId);
      var optionToAdd = document.createElement('option');
      optionToAdd.innerText = optionText;
      optionToAdd.value = optionValue;
      select.add(optionToAdd);
    };

    /** update select-element's options */
    /** DUPE of updateSelectStakeholder unless modified **/
    updateSelect = function(selectId, options) {
      var options = Object.keys(fegsScopingData.stakeholders);
      var oldOptions = document.querySelectorAll('#' + selectId + ' option:not([disabled="disabled"])');
      var i;
      for (i = 0; i < oldOptions.length; i++) {
        oldOptions[i].parentNode.removeChild(oldOptions[i]);
      }
      for (i = 0; i < options.length; i++) {
        addOption(selectId, options[i], options[i]);
      }
      selectStakeholderToSlice();
    };

    /**
     * Populate a stakeholder's beneficiary-percentages into the view.
     *
     * Put each value in a text-input.
     * Validate data-entry by notifying when sum of inputs > 100.
     */
    var selectStakeholderToSlice = function() {
      clearNotices();
      var table = document.getElementById('table-beneficiaries');
      var select = document.getElementById('select-stakeholder');
      var stakeholderName = select.value;
      var tBody = table.tBodies[0];
      var rowIndex, cell, input, cellText, rowspan, numberOfBeneficiaryColumnsInRow;

      var beneficiaryPercentageOfStakeholderInputValidator = function() { // validate sum of percentages is 100 +- 0.05 then save
        console.log("beneficiaryPercentageOfStakeholderInputValidator")
        clearNotices();
        var percentageSum = 0;
        var j, inputs, input;
        inputs = document.getElementsByClassName('beneficiary-percentage-of-stakeholder');
        for (j = 0; j < inputs.length; j++) {
          if (isNaN(parseFloat(inputs[j].value))) {
            inputs[j].parentElement.style = 'background-color: red';
          }
          percentageSum += +inputs[j].value;
        }
        if (percentageSum < 99.95 || percentageSum > 100.05) { // inform user of unnormalized percentages
          accessiblyNotify('Percentages must sum to 100. The current sum is ' + percentageSum);
          for (j = 0; j < inputs.length; j++) {
            inputs[j].parentElement.style = 'background-color: red';
          }
        } else { // update data with valid input
          for (j = 0; j < inputs.length; j++) {
            inputs[j].parentElement.style = 'background-color: initial';
            beneficiaryNameForInput = inputs[j].parentElement.parentElement.cells[inputs[j].parentElement.cellIndex - 2].innerText;
            if (!fegsScopingData.stakeholders[stakeholderName].beneficiaries || !fegsScopingData.stakeholders[stakeholderName].beneficiaries[beneficiaryNameForInput]) {
              fegsScopingData.addBeneficiary(stakeholderName, beneficiaryNameForInput, inputs[j].value);
            }
            fegsScopingData.stakeholders[stakeholderName]
              .beneficiaries[beneficiaryNameForInput]
              .percentageOfStakeholder = inputs[j].value;
            fegsScopingView.indicateUnsaved();
          }

          document.getElementById("beneficiary-charts").removeAttribute('hidden');
          beneficiaryBarchart();

          beneficiaryPiechart();
          updateAttributeProgress();
          fegsScopingView.displayBeneficiaryScores(); // update #table-beneficiary-score
          tableAttributes.showOnlyTheseColumns(fegsScopingData.extantBeneficiaries());
          fegsScopingData.clearOtherAttributes(fegsScopingData.extantBeneficiaries());
          showSection("attributes");
        }

        //updateBeneficiaryProgress();
        
      };

      for (i = tBody.rows[0].cells.length - 1; i > 2; i--) { // remove all data columns
        removeLastColumnFromTable(table.id);
      }
      if (select.selectedIndex === 0) { // default selection => do nothing further
        return;
      }
      addTableColumn(table.id, stakeholderName, fegsScopingData.fegsBeneficiaries); // add a column to house the data
      for (rowIndex = 0; rowIndex < tBody.rows.length; rowIndex++) {
        cell = tBody.rows[rowIndex].cells[tBody.rows[rowIndex].cells.length - 1];
        if (!fegsScopingData.stakeholders[stakeholderName] || !('beneficiaries' in fegsScopingData.stakeholders[stakeholderName])) { // create empty inputs for beneficiaries that are not scored for a stakeholder yet
          cell.innerHTML = '';
          input = document.createElement('input');
          input.type = 'number';
          input.className = 'beneficiary-percentage-of-stakeholder';
          cell.appendChild(input);
          input.oninput = beneficiaryPercentageOfStakeholderInputValidator;
          continue;
        }
        if (tBody.rows[rowIndex].cells[0].getAttribute('rowspan') === null) { // check for spanned row-header
          numberOfBeneficiaryColumnsInRow = 0;
        } else {
          numberOfBeneficiaryColumnsInRow = 1;
        }
        beneficiaryName = tBody.rows[rowIndex].cells[tBody.rows[rowIndex].cells.length - 1].innerText;
        cell.innerHTML = '';
        input = document.createElement('input');
        input.type = 'number';
        input.className = 'beneficiary-percentage-of-stakeholder';
        if (fegsScopingData.stakeholders[stakeholderName].beneficiaries[beneficiaryName] &&
          fegsScopingData.stakeholders[stakeholderName].beneficiaries[beneficiaryName].hasOwnProperty('percentageOfStakeholder')) {
          input.value = fegsScopingData.stakeholders[stakeholderName]
            .beneficiaries[beneficiaryName]
            .percentageOfStakeholder;
        }
        input.oninput = beneficiaryPercentageOfStakeholderInputValidator; // save valid input
        cell.appendChild(input);
      }
      tableAttributes.showOnlyTheseColumns(fegsScopingData.extantBeneficiaries());
      updateBeneficiaryProgress();
    };

    /**
     * Populate test data to verify calculations
     * Access data as fegsScopingData.stakeholders['foo']
     *                               .beneficiaries['Irrigators']
     *                               .attributes['Weather']
     */
    var prepopulatedData = function() {
      var literal = {
        'stakeholders': {
          'Residents': {
            'scores': {
              'magnitude': '40',
              'influence': '100',
              'interest': '25',
              'urgency': '0',
              'proximity': '75',
              'economic-interest': '100',
              'rights': '100',
              'fairness': '100',
              'representation': '100'
            },
            'beneficiaries': {
              'Farmers': {
                'percentageOfStakeholder': '20',
                'attributes': {
                  'Weather': '15',
                  'Air': '5',
                  'Soil': '15',
                  'Water': '25',
                  'Fungi': '25',
                  'Polinators': '10',
                  'Depredators and (Pest) Predators': '5'
                }
              },
              'Timber / Fiber / Ornamental extractors': {
                'percentageOfStakeholder': '25'
              },
              'Military / Coast Guard': {
                'percentageOfStakeholder': '2'
              },
              'Water subsisters': {
                'percentageOfStakeholder': '3'
              },
              'Students and educators': {
                'percentageOfStakeholder': '30'
              },
              'People who care (existence)': {
                'percentageOfStakeholder': '10'
              },
              'People who care (option, bequest)': {
                'percentageOfStakeholder': '10'
              }
            },
          },
          'Timber Industry': {
            'scores': {
              'magnitude': '60',
              'influence': '50',
              'interest': '75',
              'urgency': '60',
              'proximity': '100',
              'economic-interest': '100',
              'rights': '60',
              'fairness': '0',
              'representation': '0'
            },
            'beneficiaries': {
              'Timber / Fiber / Ornamental extractors': {
                'percentageOfStakeholder': '100'
              }
            }
          },
          'Fishing and Crabbing Industry': {
            'scores': {
              'magnitude': '60',
              'influence': '50',
              'interest': '75',
              'urgency': '60',
              'proximity': '100',
              'economic-interest': '100',
              'rights': '60',
              'fairness': '0',
              'representation': '0'
            },
            'beneficiaries': {
              'Food extractors': {
                'percentageOfStakeholder': '100'
              }
            }
          }
        },
        'attributes': {
          'Farmers': {
            'Weather': '15',
            'Air': '5',
            'Water': '15',
            'Soil': '25',
            'Fungi': '25',
            'Pollinators': '10'
          },
          'Food extractors': {
            'Fauna': '100'
          },
          'Timber / Fiber / Ornamental extractors': {
            'Flora': '100'
          },
          'Military / Coast Guard': {
            'Water': '100'
          },
          'Water subsisters': {
            'Water': '100'
          },
          'Students and educators': {
            'Sounds and Scents': '10',
            'Viewscapes': '50',
            'Open Space': '10',
            'Presence of the Environment': '30',
          },
          'People who care (existence)': {
            'Sounds and Scents': '10',
            'Viewscapes': '50',
            'Open Space': '10',
            'Presence of the Environment': '30',
          },
          'People who care (option, bequest)': {
            'Sounds and Scents': '10',
            'Viewscapes': '50',
            'Open Space': '10',
            'Presence of the Environment': '30',
          },
        }
      };
      var data = new FEGSScopingData();
      data.attributes = JSON.parse(JSON.stringify(literal.attributes));
      data.stakeholders = JSON.parse(JSON.stringify(literal.stakeholders));
      return data;
    };

    /**
     * Populate sample data into app for development.
     * Access data as fegsScopingData.stakeholders['foo']
     *                               .beneficiaries['Irrigators']
     *                               .attributes['Weather']
     */
    var populateDevData = function(stakeholderNames) {
      if (typeof(stakeholderNames) === 'undefined') {
        var stakeholderNames = ['foo', 'bar', 'baz', 'qux'];
      }
      for (var i = 0; i < stakeholderNames.length; i++) {
        var stakeholderName = stakeholderNames[i];
        var beneficiarySlices = [];
        var iBen, iAttr;
        var benSum = 0;
        var sliceSum = 0;
        var attrSum = 0;
        var normalizedSlice;
        var unnormalizedPercentages = [];
        var AttributesObject = {};
        fegsScopingData.addStakeholder(stakeholderName, fegsScopingData.makeCriteriaObject({}));
        for (iBen = 0; iBen < fegsScopingData.fegsBeneficiaries.length; iBen++) {
          beneficiarySlices.push(Math.random());
          benSum += beneficiarySlices[iBen];
        }
        for (iBen = 0; iBen < fegsScopingData.fegsBeneficiaries.length; iBen++) {
          normalizedSlice = parseFloat(round((beneficiarySlices[iBen] * benSum ** -1 * 100), 2));
          fegsScopingData.addBeneficiary(stakeholderName, fegsScopingData.fegsBeneficiaries[iBen], normalizedSlice);
          attrSum = 0;
          for (iAttr = 0; iAttr < fegsScopingData.fegsAttributes.length; iAttr++) {
            AttributesObject[fegsScopingData.fegsAttributes[iAttr]] = Math.random();
            attrSum += AttributesObject[fegsScopingData.fegsAttributes[iAttr]];
          }
          for (iAttr = 0; iAttr < fegsScopingData.fegsAttributes.length; iAttr++) {
            AttributesObject[fegsScopingData.fegsAttributes[iAttr]] = AttributesObject[fegsScopingData.fegsAttributes[iAttr]] * attrSum ** -1 * 100;
          }
          fegsScopingData.addAttributes(stakeholderName, fegsScopingData.fegsBeneficiaries[iBen], AttributesObject);
        }
        for (iBen = 0; iBen < fegsScopingData.fegsBeneficiaries.length - 1; iBen++) {
          normalizedSlice = parseFloat(round((beneficiarySlices[iBen] * benSum ** -1 * 100), 2));
          sliceSum += normalizedSlice;
          fegsScopingData.stakeholders[stakeholderName]
            .beneficiaries[fegsScopingData.fegsBeneficiaries[iBen]]
            .percentageOfStakeholder = normalizedSlice;
        }
        fegsScopingData.stakeholders[stakeholderName]
          .beneficiaries[fegsScopingData.fegsBeneficiaries[fegsScopingData.fegsBeneficiaries.length - 1]]
          .percentageOfStakeholder = round((100 - sliceSum), 2);
      };
      return fegsScopingData;
    };

    var testy = function() {
      var select = document.getElementById('select-stakeholder');
      var stakeholdersArray;
      populateDevData();
      stakeholdersArray = Object.keys(fegsScopingData.stakeholders);
      for (var i = 0; i < stakeholdersArray.length; i++) {
        addOption('select-stakeholder', stakeholdersArray[i], stakeholdersArray[i]);
      }
      select.selectedIndex = 1;
      selectStakeholderToSlice();
    };

    /** clean trailing empty cells from each row then remove last cell from each row */
    var removeLastColumnFromTable = function(tableId) {
      table = document.getElementById(tableId);
      for (var i = 0; i < table.rows.length; i++) {
        for (var j = 0; j < table.rows[i].cells.length; j++) {
          if (table.rows[i].cells[table.rows[i].cells.length - 1].innerHTML.trim() === '') {
            table.rows[i].cells[table.rows[i].cells.length - 1].remove(); // trim blank trailing cells
          }
        }
        table.rows[i].cells[table.rows[i].cells.length - 1].remove(); // remove leftmost cell of data
      }
    };

    /** remove options with text of optionText from selectid */
    var removeOptionFromSelect = function(selectId, optionText) {
      select = document.getElementById(selectId);
      if (select.options[select.selectedIndex].text === optionText) { // is the option to be removed selected?
        select.selectedIndex = 0; // if selected => select default option
      }
      for (var i = 0; i < select.options.length; i++) { // remove option
        if (optionText === select.options[i].text) {
          select.options[i].remove();
        }
      }
      select.onchange(); // fire select's onchange callback
    };

    /** refresh select-box from data */
    var updateSelectStakeholder = function(selectId) {
      var i;
      var select = document.getElementById(selectId);
      var stakeholderNames = Object.keys(fegsScopingData.stakeholders);
      for (i = select.options.length - 1; i > 0; i--) { // remove all options
        select.options[i].remove();
      }
      for (i = 0; i < stakeholderNames.length; i++) { // add option for each stakeholder
        addOption(selectId, stakeholderNames[i], stakeholderNames[i]);
      }
      selectStakeholderToSlice();
    };

    /** return HTMLElement of accessible notice of text */
    var accessiblyNotify = function(text) {
      var notices = document.getElementsByClassName('accessible-notification');
      var notice = document.createElement('div');
      var textNode = document.createTextNode(text);
      clearNotices();
      notice.appendChild(textNode);
      notice.setAttribute('aria-live', 'polite');
      notice.addEventListener('click', function() {
        this.remove()
      });
      notice.className = 'accessible-notification';
      document.getElementsByTagName('body')[0].appendChild(notice);
      return notice;
    };

    /** clear all notices */
    var clearNotices = function() {
      var notices = document.getElementsByClassName('accessible-notification');
      for (var i = 0; i < notices.length; i++) {
        notices[i].remove();
      }
    };

    var tablesome = function(columnNames, rowNames) {
      var mapString = function(inputString) {
        return inputString.toLocaleLowerCase().replace(/[^a-zA-Z0-9]$/, '').replace(/[ -/(]+/g, '-');
      };
      var mapper = function(arrayOfNames) {
        var map = {};
        for (var i = 0; i < arrayOfNames; i++) {
          map[arrayOfNames[i]] = {
            'id': mapString(columnNames[i]),
            'number': i,
          }
        }
        return map;
      };
      if (typeof(columnNames) !== 'undefined') {
        columnMap = mapper(columnNames);
      }
      if (typeof(rowNames) !== 'undefined') {
        rowMap = mapper(rowNames);
      }
      console.log('invoked tablesome()');
      return [columnMap, rowMap];
    };

    /** exemplify testing to a spec on the function that
     *   digests data to cleanse ugly characters
     */
    var tablesomeSpec = function(tablesome) { // a spec is a set of tests that define an API
      // sanitize arrays in url-friendly ways
      console.log('expecting', 'foo-bar-baz-qux');
      console.log("tablesome(['Foo - Bar/Baz(Qux)'], ['Foo - Bar/Baz(Qux)']):");
      console.log(tablesome(['Foo - Bar/Baz(Qux)'], ['Foo - Bar/Baz(Qux)']));
      return tablesome(['Foo- Bar / Baz(Qux )'], ['Foo - Bar/Baz (Qux)']) === [
        ['foo-bar-baz-qux'],
        ['foo-bar-baz-qux']
      ]; // should do something like array.replace(/\s*[-/\)\(]*\s*/, '-')
    };

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
    var Table = function(tableId, rowHeaders, columnHeaders, rowOffset, columnOffset) {
      this.id = tableId;
      this.rowHeaders = rowHeaders;
      this.columnHeaders = columnHeaders;
      this.rowOffset = rowOffset;
      this.columnOffset = columnOffset;
      this.table = document.getElementById(tableId);
      this.hiddenClassName = 'display-none';
      this.spannedHeaders = this.table.rows[0].cells
      this.colSpanOriginalValuePropertyName = 'data-colspan-original-value';
      this.cols = this.table.querySelectorAll('col');
      this.colCells = this.table.rows[0].cells;

      /** populate given data into columns */
      this.populateAttributeData = function() {
        console.log("populateAttributeData");
        var stakeholder = fegsScopingController.getCurrentStakeholder();
        var rowIndex;
        if (!fegsScopingView.stakeholderIsSelected() || this.id !== 'table-attributes') {
          return;
        }
        for (columnIndex in this.columnHeaders) { // cycle through beneficiaries
          beneficiary = this.columnHeaders[columnIndex];
          if (this.isHidden(this.columnHeaders[columnIndex])) {
            continue;
          }
          for (rowIndex = 0; rowIndex < this.rowHeaders.length; rowIndex++) { // cycle through attributes
            attribute = this.rowHeaders[rowIndex];
            console.log('beneficiary: ', beneficiary);
            console.log('attribute: ', attribute);
            console.log('this.isHidden(' + beneficiary + '): ', this.isHidden(beneficiary));
            console.log('fegsScopingData.stakeholders[stakeholder].beneficiaries[beneficiary].attributes[attribute]: ', fegsScopingData.stakeholders[stakeholder].beneficiaries[beneficiary].attributes[attribute]);
            this.cellInputValue(this.cell(attribute, beneficiary), fegsScopingData.stakeholders[stakeholder].beneficiaries[beneficiary].attributes[attribute].percentageOfBeneficiary); // set value of input in cell FIXME SET INPUT VALUE
          }
        }
      };

      /** store an element's initial span in a uniformly named property of the element */
      this.storeInitialSpanOfCols = function storeInitialSpanOfCols() {
        var iCol;
        for (iCol = 0; iCol < this.cols.length; iCol++) {
          this.cols[iCol].setAttribute(this.colSpanOriginalValuePropertyName, this.cols[iCol].span);
        }
      };

      /** return the specified cell */
      this.cell = function(rowHeader, columnHeader) {
        var rowIndex = rowHeaders.indexOf(rowHeader) + this.rowOffset;
        var columnIndex = columnHeaders.indexOf(columnHeader) + this.columnOffset;
        return this.table.rows[rowIndex].cells[columnIndex];
      };

      /** test the table's construction */
      this.test = function() {
        var rowHeaderColumnNumber = 0;
        var columnHeaderRowNumber = 1;
        var errors = [];
        var i;
        for (i = 0; i < rowHeaders.length; i++) { // test rowHeaders
          if (rowHeaders[i] !== this.table.rows[i + rowOffset].cells[rowHeaderColumnNumber].innerText) {
            errors.push(new Error('rowHeaders mismatch: ' + rowHeaders[i] + ' does not match ' + this.table.rows[i + rowOffset].cells[rowHeaderColumnNumber].innerText));
          }
        }
        for (i = 0; i < columnHeaders.length; i++) { // test columnHeaders
          if (columnHeaders[i] !== this.table.rows[columnHeaderRowNumber].cells[columnOffset + i].innerText) {
            errors.push(new Error('columnHeaders mismatch: ' + columnHeaders[i] + ' does not match ' + this.table.rows[columnHeaderRowNumber].cells[columnOffset + i].innerText));
          }
        }
        return errors;
      };

      /** return table's cells in an array of arrays */
      this.cells = function() {
        var cells = [];
        for (i = 0; i < this.table.rows.length; i++) {
          if (typeof(cells[i]) === 'undefined') {
            cells[i] = [];
          }
          for (j = 0; j < this.table.rows[i]; j++) {
            cells[i][j] = this.table.rows[i].cells[j];
          }
        }
        return cells;
      };

      /**
       * get or set value of the input in the supplied cell
       * @param {td or th object} cell - supplied cell containing an input-element
       * @param {string} setterValue - specifies the value to set the input to when present
       */
      this.cellInputValue = function(cell, setterValue) { // setterValue is optional parameter to make this a setter
        if (typeof(setterValue) === 'undefined') {
          return cell.getElementsByTagName('input')[0].value;
        } else { // if setterValue is present then set the input's value to setterValue
          cell.getElementsByTagName('input')[0].value = setterValue;
        }
      };

      /** get index of indicated column assuming numerical args are indices */
      this.getColumnIndex = function(columnIndicator) {
        if (isNaN(columnIndicator) || Number('1') !== Math.round(Number('1'))) { // assume the argument is a heading-string if not coercible to NaN
          unshiftedColumnIndex = this.columnHeaders.indexOf(columnIndicator);
          if (unshiftedColumnIndex === -1) {
            throw new Error('columnIndicator not found: ' + columnIndicator + 'in Table-instance ', this);
          }
          return unshiftedColumnIndex + this.columnOffset;
        } else { // assume a numerical index was supplied if not coerced to NaN
          return columnIndicator;
        }
      };

      /** true if the indicated column is hidden else false */
      this.isHidden = function(columnIndicator) {
        return this.table.rows[1].cells[this.getColumnIndex(columnIndicator)].classList.contains(this.hiddenClassName);
      };

      /** true if the indicated col is hidden else false */
      this.isColHidden = function(colIndicator) {
        var colIndex;
        if (+colIndicator === NaN) {
          colIndex = this.cols.indexOf(colIndicator);
        } else {
          colIndex = colIndicator;
        }
        return this.cols[colIndex].classList.contains(this.hiddenClassName);
      };

      /** get index of col containing the indicated column */
      this.getColIndex = function(columnIndicator) {
        var columnIndex = this.getColumnIndex(columnIndicator);
        var currentColOriginalSpan;
        var colIndex = 0;
        var colSpanIndex = 0;
        for (colIndex = 0; colIndex < this.cols.length; colIndex++) {
          currentColOriginalSpan = parseFloat(this.cols[colIndex].getAttribute(this.colSpanOriginalValuePropertyName));
          if (colSpanIndex + currentColOriginalSpan > columnIndex) {
            return colIndex; // colIndex was the index of the col containing the indicated column
          } else {
            colSpanIndex += currentColOriginalSpan;
          }
        }
      };

      /** get name of indicated column */
      this.getColumnName = function(columnIndicator) {
        var columnIndex = this.getColumnIndex(columnIndicator);
        return this.table.rows[rowOffset - 1].cells[columnIndex].innerText;
      };

      /** clear indicated column */
      this.clearColumn = function(columnIndicator) {
        var rowIndex;
        var columnIndex = this.getColumnIndex(columnIndicator);
        for (rowIndex = 1; rowIndex < this.table.rows.length; rowIndex++) {
          if (this.table.rows[rowIndex].cells[columnIndex].querySelector('input')) {
            this.table.rows[rowIndex].cells[columnIndex].querySelector('input').value = '';
          }
        }
      };

      /** hide columns up to that indicated */
      this.hideColumnsUpTo = function(columnIndicator) {
        var targetColumnIndex = this.getColumnIndex(columnIndicator);
        var currentColumnIndex;
        for (currentColumnIndex = columnOffset; currentColumnIndex < targetColumnIndex; currentColumnIndex++) {
          this.hideColumn(currentColumnIndex);
        }
      };

      /** hide indicated column */
      this.hideColumn = function(columnIndicator) {
        var rowIndex;
        var columnIndex = this.getColumnIndex(columnIndicator);
        var colIndex = this.getColIndex(columnIndex);
        if (this.isHidden(columnIndex)) {
          return;
        }
        if (this.cols[colIndex].span === 1) { // hide col and its labelling headers if this is last column
          this.cols[colIndex].classList.add(this.hiddenClassName);
          this.colCells[colIndex].classList.add(this.hiddenClassName);
        } else { // decrement span and colspan
          this.cols[colIndex].span -= 1;
          this.colCells[colIndex].colSpan -= 1;
        }
        for (rowIndex = 1; rowIndex < this.table.rows.length; rowIndex++) {
          this.table.rows[rowIndex].cells[columnIndex].classList.add(this.hiddenClassName);
        }
      };

      /** show indicated column */
      this.showColumn = function(columnIndicator) {
        var rowIndex;
        var columnIndex = this.getColumnIndex(columnIndicator);
        var colIndex = this.getColIndex(columnIndex);
        if (!this.isHidden(columnIndex)) { // do nothing if already shown
          return;
        }
        if (!this.isColHidden(colIndex)) { // increment span and colspan
          this.cols[colIndex].span += 1;
          this.colCells[colIndex].colSpan += 1;
        }
        if (this.cols[colIndex].span === 1) { // show col and its labelling headers if this is the first visible column in col
          this.cols[colIndex].classList.remove(this.hiddenClassName);
          this.colCells[colIndex].classList.remove(this.hiddenClassName);
        }
        for (rowIndex = 1; rowIndex < this.table.rows.length; rowIndex++) {
          this.table.rows[rowIndex].cells[columnIndex].classList.remove(this.hiddenClassName);
        }
      };

      /** show only specified columns */
      this.showOnlyTheseColumns = function(columnIndicators) {
        columnIndicators = (typeof columnIndicators !== 'undefined') ? columnIndicators : [];
        var columnIndices = [];
        for (var i = 0; i < columnIndicators.length; i++) {
          columnIndex = this.getColumnIndex(columnIndicators[i]);
          this.showColumn(columnIndex);
          columnIndices.push(columnIndex);
        }
        for (var i = 3; i < this.table.rows[1].cells.length; i++) {
          if (columnIndices.indexOf(i) === -1) {
            this.clearColumn(i);
            this.hideColumn(i);
          }
        }
      };

      this.showAttributeScores = function() {
        this.showColumn("Attribute Score");
        for (var i = 0; i < this.rowHeaders.length; i++) {
          this.cell(this.rowHeaders[i], "Attribute Score").innerHTML = fegsScopingData.calculateAttributeScore(this.rowHeaders[i]);
        }
      };

      this.hideRow = function(rowIndicator) {
        //TODO fill in stub s.t. rowIndicator can be a numerical index or a header-name
      };

      this.showRow = function(rowIndicator) {
        //TODO fill in stub s.t. rowIndicator can be a numerical index or a header-name
      };

      ////////////////// Table'S PROCESS ////////////////////
      this.storeInitialSpanOfCols();
      var cell;
      for (i = 0; i < this.table.rows.length; i++) {
        for (j = 0; j < this.table.rows[i].cells.length; j++) {
          cell = this.table.rows[i].cells[j];
          if (cell.colSpan > 1) {
            cell.setAttribute(this.colSpanOriginalValuePropertyName, cell.colSpan);
          }
        }
      }
    }; ////// END PROTOTYPE NAMED Table ////////////

    /** instantiate a Table() for #table-attributes; perform specialized initializations */
    var tableAttributesCreator = function(tableId) {
      var rowOffset = 3; // introduce fragility by duplicating initializion via literal or break the callback's encapsulation?
      var columnOffset = 4; // introduce fragility by duplicating initializion via literal or break the callback's encapsulation?
      var rowNames = fegsScopingData.fegsAttributes;
      var columnNames = fegsScopingData.fegsBeneficiaries;
      var table = new Table(tableId, rowNames, columnNames, rowOffset, columnOffset);
      var cell;

      var validateAndSaveData = function() {
        var columnIndex = this.parentElement.cellIndex;
        var beneficiaryName = fegsScopingData.fegsBeneficiaries[columnIndex - columnOffset];
        var allBlank = true;
        var attributesObject = {};
        var sum = 0; // sum all cells to see if sum is correctly normalized
        var rows = this.parentElement.parentElement.parentElement.rows;
        var rowIndex;
        var input;
        if (this.value < 0 || this.value > 100) { // value is invalid after change
          for (i = 0; i < rows.length; i++) {
            rows[i].cells[columnIndex].classList.remove('invalid-text-input');
          }
          this.parentElement.classList.add('invalid-text-input');
          accessiblyNotify('Attribute ' + rows[this.parentElement.parentElement.rowIndex].cells[0].innerText + ' was input as ' + this.value + ' percent of beneficiary-group ' + document.getElementById('table-attributes').rows[1].cells[this.parentElement.cellIndex].innerText + '. Percentages must be between 0 and 100.');
        } else { // individual input is valid
          for (i = 0; i < rows.length; i++) { // loop through values in column
            if (allBlank === true && rows[i].cells[columnIndex].getElementsByTagName('input')[0].value !== '') {
              allBlank = false;
            }
            sum += +rows[i].cells[columnIndex].getElementsByTagName('input')[0].value;
          }
          if (allBlank === true || String(sum) === '100') { // pecentages are correctly normalized
            clearNotices(); // clear notices which describe bad input
            for (i = 0; i < rows.length; i++) { // clear styling indicating bad input
              rows[i].cells[columnIndex].classList.remove('invalid-text-input');
            }
            for (rowIndex = 0; rowIndex < rows.length; rowIndex++) {
              rows[rowIndex].cells[columnIndex].classList.remove('invalid-text-input');
              attributeName = fegsScopingData.fegsAttributes[rowIndex];
              attributesObject[attributeName] = rows[rowIndex].cells[columnIndex].getElementsByTagName('input')[0].value;
            }
            fegsScopingData.addAttributes(beneficiaryName, attributesObject); // save
            tableAttributes.showOnlyTheseColumns(fegsScopingData.extantBeneficiaries()); // update beneficiaries shown in #table-attributes
            fegsScopingView.indicateUnsaved();
          } else { // notify of incorrect normalization
            accessiblyNotify('The percentages for beneficiary ' + beneficiaryName + ' sum to ' + sum + '.  Percentages must sum to 100.');
            for (i = 0; i < rows.length; i++) {
              rows[i].cells[columnIndex].classList.add('invalid-text-input');
            }
          }
        }
        updateAttributeProgress();
        attributePiechart();

        attributeBarchart();
      };

      for (var i = 0; i < rowNames.length; i++) {
        for (var j = 0; j < columnNames.length; j++) {
          //TODO implement excel-compatible keyboard-navigation listeners
          cell = table.cell(rowNames[i], columnNames[j]);
          if (cell.querySelector('input') === null) {
            input = document.createElement('input');
            input.type = 'number';
            cell.appendChild(input); // store data and set properties including callbacks before insertion into DOM to optimize performance
          } else {
            input = cell.querySelector('input');
          }
          input.oninput = validateAndSaveData; // apply onchange callback late to restore functionality
        }
      }
      table.table.setAttribute('data-initialized', "true");
      return table;
    };

    /** Prototype view to encapsulate representation. */
    var FEGSScopingView = function() {

      /** initialize the view of the application */
      this.initializeView = function() {
        this.showName.style.display = 'inline-block';
        //this.changeNameButton.style.display = 'inline-block';
        //this.inputName.style.display = 'none';
        this.saveNameButton.style.display = 'none';
        this.projectName = fegsScopingData.projectName;
        this.projectNameMenu.innerHTML = this.projectName;
      };

      /** update name displayed in titlebar and header */
      this.updateName = function(name) {
        this.projectNameMenu.innerHTML = name; // update the name shown
        this.projectName = name; // update the name of the view
        this.title = name; // call the name a title, too
        this.showName.style.display = 'inline-block';
        //this.changeNameButton.style.display = 'inline-block';
        this.inputName.style.display = 'none';
        this.saveNameButton.style.display = 'none';
      };

      /** input the name of this project */
      this.editName = function() {
        this.showName.style.display = 'none';
        //this.changeNameButton.style.display = 'none';
        this.inputName.style.display = 'inline-block';
        this.saveNameButton.style.display = 'inline-block';
        this.inputName.value = this.projectNameMenu.innerText;
      };

      /** save the name of this project */
      this.saveNameButton = function() {
        this.inputName.style.display = 'none';
        this.saveNameButton.style.display = 'none';
        this.showName.style.display = 'inline-block';
        this.changeName.style.display = 'inline-block';
        this.projectNameMenu.innerText = inputName.value;
        fegsScopingController.saveValidatedData();
        this.projectName = inputName.value;
      };

      /** restore view's state: each input with a stored value restores that value */
      this.restoreView = function(filename) {
        console.log("restoreView")
        if (typeof(filename) === 'undefined') {
          filename = 'data.json'
        }
        var criterion;
        fegsScopingData = fegsScopingController.importData(filename);
        fegsScopingController.updateName(fegsScopingData.projectName);
        for (i = 0; i < fegsScopingData.criteria.length; i++) {
          criterion = fegsScopingData.criteria[i];
          document.querySelector('#' + criterion + '-score').value = fegsScopingData.scores[criterion];
        }

        criteriaPiechart();
        document.getElementById("beneficiary-charts").removeAttribute('hidden');
        beneficiaryBarchart();
        beneficiaryPiechart();
        attributePiechart();
        attributeBarchart();

        fegsScopingView.showStakeholderScores();
        fegsScopingView.displayBeneficiaryScores();
        fegsScopingView.restoreAttributes();
        tableAttributes.showOnlyTheseColumns(fegsScopingData.extantBeneficiaries());

        updateStakeholderProgress();
        updateWeightingProgress();
        updateBeneficiaryProgress();
        updateAttributeProgress();

        //TODO FIXME LOAD DATA ABOVE HERE ^ ^ ^ ^ ^ ^ ^
        fegsScopingView.indicateSaved();
      };

      /** indicate saved status */
      this.indicateSaved = function() {
        document.title = fegsScopingData.projectName;
        document.getElementById('unsaved-indicator').setAttribute("hidden" , "");
      };

      /** indicate unsaved status */
      this.indicateUnsaved = function() {
        document.title = fegsScopingData.projectName + '*';
        document.getElementById('unsaved-indicator').removeAttribute("hidden");
      };

      /** save view's state: each input stores its own data */
      this.saveView = function() {
        var i;
        var inputs = document.querySelectorAll('input:not([type="radio"])');
        var radioInputs = document.querySelectorAll('input[type="radio"]');
        for (i = 0; i < inputs.length; i++) {
          inputs[i].setAttribute('data-value', inputs[i].value);
        }
        for (i = 0; i < radioInputs.length; i++) {
          radioInputs[i].setAttribute('data-checked', radioInputs[i]['checked']);
        }
        document.body.setAttribute('data-restore', 'true'); // set flag to automatically restore data on document load
      };

      this.pages = document.querySelectorAll('.page');
      var self = this;
      /** show only the identified page */
      this.focusPage = function(pageId) {
        var pages = document.querySelectorAll('.page');
        var pageIndex;
        for (pageIndex = 0; pageIndex < pages.length; pageIndex++) {
          if (pages[pageIndex].id === pageId) {
            pages[pageIndex].style.display = 'block';
          } else {
            pages[pageIndex].style.display = 'none';
          }
        }
        self.ensureNavigability(pageId);
      };

      /** add navigability if absent */
      this.ensureNavigability = function(pageId) {
        var navigation;
        var back;
        var forward;
        if (!document.getElementById(pageId).querySelector('.navigation')) {
          navigation = document.createElement('div');
          navigation.setAttribute('class', 'navigation');
          back = document.createElement('button');
          forward = document.createElement('button');
          back.innerHTML = 'back';
          forward.innerHTML = 'forward';
          back.onclick = function() {
            var pages = document.querySelectorAll('.page');
            var pageIndex;
            var currentPageIndex;
            for (pageIndex = 0; pageIndex < pages.length; pageIndex++) {
              if (pages[pageIndex].style.display === 'block') {
                currentPageIndex = pageIndex;
                break;
              }
            }
            if (currentPageIndex > 0) {
              self.focusPage(pages[currentPageIndex - 1].id)
            } else {
              console.log('there is no page before the first page');
            }
          };
          forward.onclick = function() {
            var pages = document.querySelectorAll('.page');
            var currentPage = document.querySelector('.page[display="block"]');
            var pageIndex;
            var currentPageIndex;
            for (pageIndex = 0; pageIndex < pages.length; pageIndex++) {
              if (pages[pageIndex].style.display === 'block') {
                currentPageIndex = pageIndex;
                break;
              }
            }
            if (currentPageIndex < pages.length - 1) {
              self.focusPage(pages[currentPageIndex + 1].id)
            } else {
              console.log('there is no page after the last page');
            }
          };
          navigation.appendChild(back);
          navigation.appendChild(forward);
          document.getElementById(pageId).appendChild(navigation);
        }
      };

      this.showStakeholderScores = function() {
        console.log("showStakeholderScores")
        for (var i = document.getElementById('table-stakeholders').rows.length - 1; i > 0; i--) {
          document.getElementById('table-stakeholders').deleteRow(i);	
        }
        for (var stakeholder in fegsScopingData.stakeholders) {
          addRow('table-stakeholders', [stakeholder, fegsScopingData.stakeholders[stakeholder]]); // table name and array of values to insert
        }
        document.getElementById('set-stakeholder-values').style.display = "none";
        document.getElementById('stakeholder-list').style.display = "none";
        clearStakeholderScores();

        stakeholderBarchart();

        updateSelectStakeholder('select-stakeholder');
        document.getElementById('select-stakeholder').onchange();
        updateStakeholderProgress();
        document.getElementById('stakeholder-table-container').style.display = "block";
        fegsScopingView.indicateUnsaved();
      };

      this.getCurrentStakeholder = function() {
        return document.querySelector('#select-stakeholder').value;
      };

      this.stakeholderIsSelected = function() {
        return Boolean(document.querySelector('#select-stakeholder').selectedIndex);
      };

      /** caculate and display beneficiary-scores */
      this.displayBeneficiaryScores = function() {
        var table = tableAttributes;
        var columnNames = fegsScopingData.extantBeneficiaries();
        var rowNames = ["Beneficiary Score"];
        var cell;
        var cellValue;
        for (var i = 0; i < columnNames.length; i++) {
          cell = table.cell(rowNames[0], columnNames[i]);
          cellValue = fegsScopingData.beneficiaryScore(columnNames[i]);
          if (isNaN(cellValue)) {
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

      this.restoreAttributes = function() {
        var table = tableAttributes;
        var rowNames = table.rowHeaders;
        var columnNames = table.columnHeaders;
        var cell;

        for (var i = 0; i < rowNames.length; i++) {
          for (var j = 0; j < columnNames.length; j++) {
            if (fegsScopingData.attributes.hasOwnProperty(columnNames[j])) {
              table.showColumn(columnNames[j]);
              cell = table.cell(rowNames[i], columnNames[j]);
              if (cell.querySelector('input') === null) {
                input = document.createElement('input');
                input.type = 'number';
                cell.appendChild(input);
              } else {
                input = cell.querySelector('input');
              }
              input.value = fegsScopingData.attributes[columnNames[j]][rowNames[i]].percentageOfBeneficiary;
            }
          }
        }
      };

      //////////// PROCESS IN PROTOTYPE FEGSScopingView ///////////////

      this.inputName = document.getElementById('input-name');
      this.showName = document.getElementById('show-name');
      this.projectNameMenu = document.getElementById('menu-project-name');
      this.saveNameButton = document.getElementById('save-name');
      this.changeNameButton = document.getElementById('change-name');
      this.initializeView();
    }; ////////////// END PROTOTYPE FEGSScopingView /////////////////////

    function toggleTableDefinitions(event, tableID) {
      for (var i = 0; i < document.querySelectorAll('#' + tableID + ' .definition').length; i++) {
        var element = document.querySelectorAll('#' + tableID + ' .definition')[i];
        if (element.hasAttribute('hidden') || element.classList.contains('display-none')) {
          event.target.innerHTML = 'Hide definitions';
          element.removeAttribute('hidden');
          element.classList.remove('display-none');
        } else {
          event.target.innerHTML = 'Show definitions';
          element.setAttribute('hidden', true);
          element.classList.add('display-none');
        }
      }
    }

    var getDocument = function() {
      var documentText = '<!DOCTYPE html>' + '\n' + document.documentElement.outerHTML;
      return documentText;
    }

    var downloadText = function(filename, text) {
      console.log("downloadText")
      var element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
      element.setAttribute('download', filename);

      element.style.display = 'none';
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);
    }

    function updateBeneficiaryView() {
      beneficiaryBarchart();
      beneficiaryPiechart();
    }

    function updateAttributeView() {
      fegsScopingView.displayBeneficiaryScores(); // table-attributes
      fegsScopingView.restoreAttributes(); // table-attributes
      tableAttributes.showOnlyTheseColumns(fegsScopingData.extantBeneficiaries()); // table-attributes

      attributePiechart();
      attributeBarchart();
    }

    function criteriaPiechart() {
      initPieChart.draw({
        data: getScores(), // Get the score data
        colors: criteriaColors,
        element: 'criteria-pie'
      });
    }

    function stakeholderBarchart() {
      initStackedBarChart.draw({
        data: formatStakeholderData(),
        key: fegsScopingData.criteria,
        legend: fegsScopingData.fegsCriteria,
        element: 'stakeholder-barchart',
        header: 'stakeholder',
        colors: criteriaColors
      });
    }

    function beneficiaryBarchart() {
      initStackedBarChart.draw({
        data: formatBeneficiaryData(),
        key: Object.keys(fegsScopingData.stakeholders),
        legend: Object.keys(fegsScopingData.stakeholders),
        element: 'beneficiary-barchart',
        header: 'beneficiary',
        colors: d3.schemeSet3
      });
    }

    function attributeBarchart() {
      initBarChart.draw({
        data: getAttributeScoresForPieChart(),
        element: 'attribute-barchart', // attribute-barchart
        colors: d3.schemeSet3
      });
    }

    function beneficiaryPiechart() {
      initPieChart.draw({
        data: getBeneficiaryScoresForPieChart(),
        colors: beneficiaryColors,
        element: 'beneficiary-pie'
      });
    }

    function attributePiechart() {
      initPieChart.draw({
        data: getAttributeScoresForPieChart(), // attribute-pie
        colors: d3.schemeSet3,
        element: 'attribute-pie'
      });
    }

    function toggleSection(Id) {
      var section = document.getElementById("section-" + Id);
      var nav = document.getElementById("nav-" + Id);
      if (section.hasAttribute('hidden')) {
        section.removeAttribute('hidden');
        nav.removeAttribute('hidden');
      } else {
        section.setAttribute('hidden', true);
        nav.setAttribute('hidden', true);
      }
    }

    function showSection(Id) {
      var section = document.getElementById("section-" + Id);
      var nav = document.getElementById("nav-" + Id);
      if (section.hasAttribute('hidden')) {
        section.removeAttribute('hidden');
        nav.removeAttribute('hidden');
      }
    }

    function hideSection(Id) {
      var section = document.getElementById("section-" + Id);
      var nav = document.getElementById("nav-" + Id);
      if (!section.hasAttribute('hidden')) {
        section.setAttribute('hidden', true);
        nav.setAttribute('hidden', true);
      }
    }

    ////////// PAGE-PROCESS //////////////////////////////////////
    var fegsScopingData = new FEGSScopingData();
    var fegsScopingView = new FEGSScopingView();
    var fegsScopingController = new FEGSScopingController();
    var criteriaColors = ["#4f81bd", "#c0504d", "#9bbb59", "#8064a2", "#4bacc6", "#f79646", "#2c4d75", "#772c2a", "#5f7530"];
    var beneficiaryColors = ["#DDD9C3", "#C4BD97", "#948A54", "#948A54", "#4A452A", "#1E1C11", "#050503", "#DCE6F2", "#C6D9F1", "#8EB4E3", "#558ED5", "#376092", "#1F497D", "#254061", "#10253F", "#CCC1DA", "#B3A2C7", "#604A7B", "#403152", "#D99694", "#953735", "#F9FDD1", "#F9F383", "#F5F018", "#FFFF00", "#DBEEF4", "#B7DEE8", "#93CDDD", "#4BACC6", "#31859C", "#215968", "#C3D69B", "#77933C", "#FAC090", "#E46C0A", "#D9D9D9", "#A6A6A6"];
    var tableAttributes = tableAttributesCreator('table-attributes');
    tableAttributes.showOnlyTheseColumns();
    document.addEventListener('DOMContentLoaded', function() {
      criteriaPiechart();
      if (document.body.getAttribute('data-restore') === 'true') {
        fegsScopingController.importData();
      }
    });

    hideSection("stakeholders");
    hideSection("beneficiaries");
    hideSection("attributes");

    updateStakeholderProgress();
    updateWeightingProgress();
    updateBeneficiaryProgress();
    updateAttributeProgress();

    function round(number, precision) {
      var shift = function(number, precision, reverseShift) {
        if (reverseShift) {
          precision = -precision;
        }
        var numArray = ("" + number).split("e");
        return +(numArray[0] + "e" + (numArray[1] ? (+numArray[1] + precision) : precision));
      };
      return shift(Math.round(shift(number, precision, false)), precision, true);
    }
//////////////////////////////////////////////
    var userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.indexOf(' electron/') > -1) { // true if in NODE's ELECTRON
      document.getElementById('zoomer').removeAttribute('hidden');
      var {
        ipcRenderer,
        remote
      } = require('electron');

      var webFrame = require('electron').webFrame

      var indicatePageZoom = function(event) {
        document.querySelector('#page-zoom-indicator').innerText = parseInt(event.target.value * 100) + "%";
      };

      var pageZoomChange = function(event) {
        webFrame.setZoomFactor(+event.target.value);
      };
      if (remote.process.argv.length > 1) {
        if (remote.process.argv[1].substr(remote.process.argv[1].length - 5) === ".fegs") {
          fegsScopingView.restoreView(remote.process.argv[1]);
          fegsScopingView.indicateSaved();
        }
      }

      // Listen for save as from main process
      ipcRenderer.on('save-as', (event, arg) => {
        fegsScopingData.filePath = arg;
        fegsScopingController.saveJSON(arg, fegsScopingData);
        fegsScopingView.indicateSaved();
      });

      // Listen for save from main process
      ipcRenderer.on('save', (event, arg) => {
        if (fegsScopingData.filePath != '') {
          fegsScopingController.saveJSON(fegsScopingData.filePath, fegsScopingData);
          fegsScopingView.indicateSaved();
        } else {
          ipcRenderer.send('save-as');
        }
      });

      // Listen for open file from main process
      ipcRenderer.on('open-file', (event, arg) => {
        fegsScopingView.restoreView(arg[0]);
        fegsScopingView.indicateSaved();
      });
    }

    var APP = (function () {
      function debounce(func, wait, immediate) {
        var timeout;
        return function() {
          var context = this, args = arguments;
          clearTimeout(timeout);
          timeout = setTimeout(function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
          }, wait);
          if (immediate && !timeout) func.apply(context, args);
        };
      }
      var me = {onResize : function(callback) {
        callback();
        window.addEventListener('resize', debounce(function() {
          callback();
        }, 60), false);
      }};
      return me;
    })();
    var bodyEl = document.getElementsByTagName('body')[0];
    APP.onResize(function() {
      beneficiaryBarchart();
      attributeBarchart();
    });