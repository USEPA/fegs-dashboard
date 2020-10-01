/**
 * Populate test data to verify calculations
 * Access data as fegsScopingData.stakeholders['foo']
 *                               .beneficiaries['Irrigators']
 *                               .attributes['Weather']
 */
const prepopulatedData = function prepopulatedData() {
  const literal = {
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
          'Timber / Fiber / Ornamental Extractors': {
            'percentageOfStakeholder': '25'
          },
          'Military / Coast Guard': {
            'percentageOfStakeholder': '2'
          },
          'Water Subsisters': {
            'percentageOfStakeholder': '3'
          },
          'Students and Educators': {
            'percentageOfStakeholder': '30'
          },
          'People Who Care (Existence)': {
            'percentageOfStakeholder': '10'
          },
          'People Who Care (Option, Bequest)': {
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
          'Timber / Fiber / Ornamental Extractors': {
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
          'Food Extractors': {
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
      'Food Extractors': {
        'Fauna': '100'
      },
      'Timber / Fiber / Ornamental Extractors': {
        'Flora': '100'
      },
      'Military / Coast Guard': {
        'Water': '100'
      },
      'Water Subsisters': {
        'Water': '100'
      },
      'Students and Educators': {
        'Sounds and Scents': '10',
        'Viewscapes': '50',
        'Open Space': '10',
        'Presence of the Environment': '30',
      },
      'People Who Care (Existence)': {
        'Sounds and Scents': '10',
        'Viewscapes': '50',
        'Open Space': '10',
        'Presence of the Environment': '30',
      },
      'People Who Care (Option, Bequest)': {
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
var populateDevData = function (stakeholderNames) {
  if (typeof stakeholderNames === 'undefined') {
    stakeholderNames = ['foo', 'bar', 'baz', 'qux'];
  }
  for (let i = 0; i < stakeholderNames.length; i += 1) {
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
  }
  return fegsScopingData;
};

const runTest = function () {
  var select = document.getElementById('select-stakeholder');
  var stakeholdersArray;
  populateDevData();
  stakeholdersArray = Object.keys(fegsScopingData.stakeholders);
  for (let i = 0; i < stakeholdersArray.length; i += 1) {
    addOption('select-stakeholder', stakeholdersArray[i], stakeholdersArray[i]);
  }
  select.selectedIndex = 1;
  selectStakeholderToSlice();
};

var tablesome = function (columnNames, rowNames) {
  var mapString = function (inputString) {
    return inputString.toLocaleLowerCase().replace(/[^a-zA-Z0-9]$/, '').replace(/[ -/(]+/g, '-');
  };
  var mapper = function (arrayOfNames) {
    var map = {};
    for (let i = 0; i < arrayOfNames; i += 1) {
      map[arrayOfNames[i]] = {
        'id': mapString(columnNames[i]),
        'number': i,
      };
    }
    return map;
  };
  if (typeof columnNames !== 'undefined') {
    columnMap = mapper(columnNames);
  }
  if (typeof rowNames !== 'undefined') {
    rowMap = mapper(rowNames);
  }
  console.log('invoked tablesome()');
  return [columnMap, rowMap];
};

/** exemplify testing to a spec on the function that
 *   digests data to cleanse ugly characters
 */
var tablesomeSpec = function (tablesome) { // a spec is a set of tests that define an API
  // sanitize arrays in url-friendly ways
  console.log('expecting', 'foo-bar-baz-qux');
  console.log("tablesome(['Foo - Bar/Baz(Qux)'], ['Foo - Bar/Baz(Qux)']):");
  console.log(tablesome(['Foo - Bar/Baz(Qux)'], ['Foo - Bar/Baz(Qux)']));
  return tablesome(['Foo- Bar / Baz(Qux )'], ['Foo - Bar/Baz (Qux)']) === [
    ['foo-bar-baz-qux'],
    ['foo-bar-baz-qux']
  ]; // should do something like array.replace(/\s*[-/\)\(]*\s*/, '-')
};