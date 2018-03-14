const Application = require('spectron').Application;
const electronPath = require('electron'); // Require Electron from the binaries included in node_modules.
const path = require('path');
const chai = require('chai');
const { assert } = require('chai');
const chaiAsPromised = require('chai-as-promised');
const fs = require('fs');
const should = require('chai').should();
const sinon = require('sinon');

chai.use(chaiAsPromised);

describe('Tests which require spectron to test electron', function() {
  this.timeout(0);

  before(function() {
    this.app = new Application({
      // Your electron path can be any binary
      // i.e for OSX an example path could be '/Applications/MyApp.app/Contents/MacOS/MyApp'
      // But for the sake of the example we fetch it from our node_modules.
      path: electronPath,
 
      // Assuming you have the following directory structure
 
      //  |__ my project
      //     |__ ...
      //     |__ main.js
      //     |__ package.json
      //     |__ index.html
      //     |__ ...
      //     |__ test
      //        |__ spec.js  <- You are here! ~ Well you should be.
 
      // The following line tells spectron to look and use the main.js file
      // and the package.json located 1 level above.
      args: [path.join(__dirname, '..')]
    })
    return this.app.start()
  });

  after(function() {
    if (this.app && this.app.isRunning()) {
      return this.app.stop()
    }
  });

  /* THIS COMMENT DOCUMENTS USAGE OF THE TESTING-FRAMEWORK
  it('tests access to variables from embedded script within HTML the application', function() {
    return this.app.foo == 'foo'; // manually assert global variable named foo has value 'foo'
  });

  it('tests behavior obvious to any user in true BDD-style', function() {
    return this.app.client.click('#getStuffAsynchronously').element('#elementCreatedToContainDataReturnedAsynchronously').should.eventually.exist; // demonstrates BDD with promise-handling
  });
  */

  it('shows an initial window', function() {
    return this.app.client.getWindowCount().then(function (count) {
      assert.equal(count, 1);
      // Please note that getWindowCount() will return 2 if `dev tools` are opened.
      // assert.equal(count, 2)
    })
  });

  it('shows project-name as app\'s title', function() {
    return Promise.resolve(this.app.client.getTitle()).should.eventually.equal('FEGS Scoping Tool');
  });

  it('allows users to change project name where it\'s shown', function() {
    return this.app.client.click('#change-name').element('#input-name').setValue('42').click('#save-name').getTitle().should.eventually.equal('42');
  });

  it('hides unrepresented beneficiaries automatically', function() {
    return this.app.client.waitUntilWindowLoaded();
  });

  it('saves state of application to a file', function() { // scrape page, save data to #scrape-page.data-view-state, and getAttribute(#scrape-page, data-view-state)
    if (require('fs').exists('data.json')) { // given there is no data.json
      require('fs').rename('data.json', 'data-renamed.json');
    }
    this.app.client.click('#scrape-page'); // when #scrape-page.click()
    return require('fs').exists('data.json') // then data.json should be true
  });

  it('opens from a file');

  it('styles app with EPA\'s web-style');

  it('given weights, stakeholder-name, and stakeholder-weights have been entered RUNFLAG', function() {
    // populate inputs in #table-scores with ones to support later calculation
    var UNICODE_BACKSPACE = "\uE003";
    var i;
    var inputs = this.app.client.elements('#table-scores input');
    for (i = 0; i < inputs.length; i++) {
      inputs[i].value = '1';
    }
    this.app.client.setValue('#stakeholder-group', 'foo');
    this.app.client.click('#add-stakeholder');
    inputs = this.app.client.elements('#set-stakeholder-values input');
    for (i = 0; i < inputs.length; i++) {
      inputs[i].value = '1';
    }
    this.app.client.click('#set-stakeholder-values button');
    this.app.client.setValue('#select-stakeholder-to-slice-into-beneficiaries', 'foo');
    this.app.client.element('#select-stakeholder-to-slice-into-beneficiaries').deviceKeyEvent(UNICODE_BACKSPACE);
  });

  describe('when valid data are entered into input.beneficiary-percentage-of-stakeholder RUNFLAG', function() {
    //FIXME uncomment if it() not working;
    //var client = this.app.client;
    //document.querySelectorAll('.beneficiary-percentage-of-stakeholder')[0].value = '100';
    //spy = sinon.spy(tableAttributes.showOnlyTheseColumns);
    //document.querySelectorAll('.beneficiary-percentage-of-stakeholder')[0].onchange();
  });

  it('then unrepresented beneficiaries are hidden within #table-attributes RUNFLAG', function() {
    this.app.client.elements('.beneficiary-percentage-of-stakeholder')[0] = '100';
    spy = sinon.spy(this.tableAttributes.showOnlyTheseColumns());//TODO FIXME FIND GLOBAL VARIABLES!!!
    document.querySelectorAll('.beneficiary-percentage-of-stakeholder')[0].onchange();
    return spy.called() //TODO assert call of tableAttributes.showOnlyTheseColumns(fegsScopingData.extantBeneficiaries())
  });

});
