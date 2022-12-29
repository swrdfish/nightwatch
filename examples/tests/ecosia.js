describe('Ecosia.org Demo', function() {

  before(browser => {
    browser
      // .navigateTo('https://bstackdemo.com/')
      .navigateTo('http://localhost:8000/z.html');
  });

  it('Demo test ecosia.org', async function() {
    const element = await browser.findElements('input');
    const res = await element.filterVisibleElements().getElementByIndex(1)
    
    // .getElementByIndex(1).findChildElement('li')

    console.log(res)
  });

  after(browser => browser.end());
});
