describe('Ecosia.org Demo', function() {

  before(async () => {
    await browser
      .url('https://ecosia.org/');
  });

  it('Demo test ecosia.org fail', function(browser) {
    browser.expect.element('body').to.be.visible;
      
    browser
      .waitForElementVisible('body', function(result) {
        browser.waitForElementVisible('body', function(result2) {
          browser.assert.visible('input[type=search]');
        });
      })
      .getTitle(function(result) {
        browser.click('button[type=submit]');
      })
      .ensure.titleMatches(/Ecosia - the search engine that plants trees/)
      .assert.textContains('.layout__content', 'foo')
      .assert.visible('input[type=search]')
      .setValue('input[type=search]', 'nightwatch')
      .assert.visible('button[type=submit]')
      .click('button[type=submit]');
      // .assert.screenshotIdenticalToBaseline('body',  /* Optional */ 'ecosia_search_page', {threshold: 5}, 'VRT custom-name complete.');
  });

  it('Demo test ecosia.org pass', function(browser) {
    browser.expect.element('body').to.be.visible;
    browser.verify.textContains('.layout__content', 'foo');

  });

  after(browser => browser.end());
});
