const {WebElement} = require('selenium-webdriver');
const {ObjectFlags} = require('typescript');
const createPromise = require('../../utils/createPromise');
// const findElementFunctions = require('./_findElementFunctions');

class FindElementsFunction {
  constructor({api, transport, deferred}, response) {
    this.api = api;
    this.driver =  transport.driver;
    this.transport = transport;
    this.value = response;
    this.deferred = deferred;
  }

  getElementByIndex(index) {
    let promise;
    if (this.deferred) {
      promise = this.deferred.promise;
    } else {
      promise = Promise.resolve(this);
    }

    this.deferred = createPromise();

    promise.then((elements) => {
      let {value} = elements;
      if (!value) {
        value = elements;
      }

      this.deferred.resolve(value[index]);
    });

    Object.assign(this.deferred.promise, this.value);

    return this.deferred.promise;
  }

  filterVisibleElements() {
    let promise;

    if (this.value instanceof Promise) {
      promise = Promise.resolve(this.value);
    } else {
      promise = Promise.resolve(this);
    }

    promise.response = promise.then(async (elements) => {
      const promises = elements.value.map(async element => {
        const webElement = new WebElement(this.driver, element.getId());

        if (await webElement.isDisplayed()) {
          return element;
        }
      });

      const elementsHasText = (await Promise.all(promises)).filter((element) => {
        return element;
      });
  
      return elementsHasText;
    });

    Object.assign(promise.response, this);

    return promise.response;
  }

  filterByText(text) {
    const promise = Promise.resolve(this);

    promise.response = promise.then(async (elements) => {
      const promises = elements.map(async element => {
        const webElement = new WebElement(this.driver, element.getId());
  
        if ((await webElement.getAttribute('textContent')).includes(text)) {
          return element;
        }
      });

      const elementsHasText = (await Promise.all(promises)).filter((element) => {
        return element;
      });
  
      return elementsHasText;
    });

    // Object.assign(promise.response, result);

    return promise.response;
  }

  filterByCSS(className, result) {
    if (result) {
      this.response = result;
    } else if (this instanceof Promise) {
      const promise = this.then(res => this.filterByCSS(className, res));
      Object.assign(promise, this);

      return promise;
    }

    const promises = this.response.map(async element => {
      const webElement = new WebElement(this.driver, element.getId());

      if ((await webElement.getAttribute('class')).includes(className)) {
        return element;
      }
    });

    const elementsHasText = (async() => (await Promise.all(promises)).filter((element) => {
      return element;
    }))();

    return elementsHasText;
  }
}

module.exports = (elements, response) => {
  if (response instanceof Promise) {
    Object.assign(response, elements);
    const {getElementByIndex, filterVisibleElements, filterByText, filterByCSS} = FindElementsFunction.prototype;

    return {
      getElementByIndex: getElementByIndex.bind(Object.assign(response)),
      filterVisibleElements: filterVisibleElements.bind(Object.assign(response, {filterVisibleElements, getElementByIndex, filterByText, filterByCSS})),
      filterByText: filterByText.bind(Object.assign(response, {filterByText, getElementByIndex, filterVisibleElements, filterByCSS})),
      filterByCSS: filterByCSS.bind(Object.assign(response, {filterByCSS, getElementByIndex, filterVisibleElements, filterByText}))
    };
  }

  const instance = new FindElementsFunction(elements, response);

  return {
    getElementByIndex: instance.getElementByIndex.bind(instance),
    filterVisibleElements: instance.filterVisibleElements.bind(instance),
    filterByText: instance.filterByText.bind(instance),
    filterByCSS: instance.filterByCSS.bind(instance)
  };
};
