const {createPromise} = require('../../utils');
const findElementsFns = require('./_findElementsFunctions.js');

class FindElementFunction {
  constructor({api, transport}, response) {
    this.api = api;
    this.driver = transport.driver;
    this.transport = transport;
    this.value = response;
  }

  get getId() {
    return function() {
      return this.transport.getElementId(this.value);
    };
  }

  findChildElement(...args) {
    return this.createElementChain(false, ...args);
  }

  findChildElements(...args) {
    const promiseOnElements = this.createElementChain(true, ...args);
    const {getElementByIndex, filterByCSS, filterVisibleElements, filterByText} = findElementsFns(this, promiseOnElements);

    Object.assign(promiseOnElements, {getElementByIndex, filterByCSS, filterVisibleElements, filterByText});
    
    // promiseOnElements.getElementByIndex = getElementByIndex;
    // promiseOnElements.filterByCSS = filterByCSS;
    // promiseOnElements.filterVisibleElements = 
    return promiseOnElements;
  }

  createElementChain(multiElements, ...args) {
    this.deferred = createPromise();

    const parentId = () => this.WebdriverElementId ? this.WebdriverElementId : this.getId();

    if (multiElements) {
      this.api.findElements(...args, parentId).then((responses) => {
        const {getElementByIndex, filterVisibleElements, filterByText, filterByCSS} = findElementsFns(this, responses.value);

        Object.assign(responses.value, {getElementByIndex, filterVisibleElements, filterByText, filterByCSS});

        this.deferred.resolve(responses.value);
      });
    }

    this.api.findElement(...args, parentId).then((response) => {
      Object.assign(response.value, {
        getId: this.getId.bind(this), 
        findChildElement: this.findChildElement.bind(this), 
        findChildElements: this.findChildElements.bind(this)
      });

      this.deferred.resolve(response.value);
    });

    this.deferred.findChildElement = this.findChildElement.bind(this);
    this.deferred.findChildElements = this.findChildElements.bind(this);

    return this.deferred.promise;
  }
}

module.exports = (elementInstance, response) => {
  const instance = new FindElementFunction(elementInstance, response);

  return {
    getId: instance.getId.bind(instance),
    findChildElement: instance.findChildElement.bind(instance),
    findChildElements: instance.findChildElements.bind(instance)
  };
};
