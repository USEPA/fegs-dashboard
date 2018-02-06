const Application = require('spectron').Application
const assert = require('assert')
const electronPath = require('electron') // Require Electron from the binaries included in node_modules.
const path = require('path')
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

describe('Isolation testbeds', function() {
  this.timeout(30000);

  global.before(function() {
    chai.should();
    chai.use(chaiAsPromised);
  });

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

  it('shows an initial window', function() {
    return this.app.client.getWindowCount().then(function (count) {
      assert.equal(count, 1)
      // Please note that getWindowCount() will return 2 if `dev tools` are opened.
      // assert.equal(count, 2)
    })
  });

  it('scrapes view', function() {
    return this.app.client.getValue('#magnitude-score').should.become('1');
  });

  it('saves to a file', function() {
    var fs = require('fs');
    return this.app.client.getValue('fegsScopingData').should.eventually.contain('criteria');
  });

  it('opens from a file');

  it('hides unrepresented beneficiaries automatically');

  it('style app with EPA\'s web-style');

  it('shows project-name as app\'s title', function() {
    this.app.client.waitUntilWindowLoaded()
    this.app.client.document.title = 'foo';
    return this.app.client.waitUntilWindowLoaded()
      .getTitle().should.eventually.equal('FEGS Scoping Tool');
  });

  it('allows users to change project name where it\'s shown');

  after(function() {
    if (this.app && this.app.isRunning()) {
      return this.app.stop()
    }
  });

})
