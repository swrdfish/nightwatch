const {WebElement} = require('selenium-webdriver');
const { ObjectFlags } = require('typescript');
// const findElementFunctions = require('./_findElementFunctions');

class FindElementsFunction {
  constructor({api, transport}, response) {
    this.api = api;
    this.driver =  transport.driver;
    this.transport = transport;
    this.value = response;
  }

  getElementByIndex(index) {
    // if (result) {
    //   this.response = result;
    // } else if (this instanceof Promise) {
    //   const promise = this.then(res => this.getElementByIndex(index, res));
    //   Object.assign(promise, this);
    //   return promise;
    // }

    // return this.response[index];

    let promise;

    if (this.value instanceof Promise) {
      promise = Promise.resolve(this.response);
    } else {
      promise = Promise.resolve(this);
    }

    // const promise = Promise.resolve(this);
    
    promise.response = promise.then((elements) => {
      let {value} = elements;
      if (!value) {
        value = elements;
      }

      return value[index];
    })

    Object.assign(promise.response, this.value);

    return promise.response;
    
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
    })

    Object.assign(promise.response, this.value);

    return promise.response;



    // let promise;

    // if (this.response instanceof Promise) {
    //   promise = Promise.resolve(this.response);
    // } else if (this instanceof Promise) {
    //   promise = Promise.resolve(this);
    // } else {
    //   promise = Promise.resolve(async () => {
    //     const promises = this.response.map(async element => {
    //       const webElement = new WebElement(this.driver, element.getId());
    
    //       if (await webElement.isDisplayed()) {
    //         return element;
    //       }
    //     });
  
    //     const visibleElements = (await Promise.all(promises)).filter((element) => {
    //       return element;
    //     });
    
    //     return visibleElements;
    //   });
    // } 

    // promise.response = promise.then(async (elements) => {
    //   let {response} = elements;
    //   if (!response) {
    //     response = elements;
    //   }

    //   const promises = response.map(async element => {
    //     const webElement = new WebElement(this.driver, element.getId());
  
    //     if (await webElement.isDisplayed()) {
    //       return element;
    //     }
    //   });

    //   const visibleElements = (await Promise.all(promises)).filter((element) => {
    //     return element;
    //   });
  
    //   return visibleElements;
    // })

    // if (this.response instanceof Promise) {
    //   Object.assign(promise.response, this);
    // } else {
    //   const {filterByText, filterByCSS, getElementByIndex} = this.response;
    //   Object.assign(promise.response, {filterByText, filterByCSS, getElementByIndex});
    // }

    // // if (this.response instanceof Promise) {
    // //   Object.assign(promise.response, this.response);
    // // } else {
    // //   Object.assign(promise.response, this);
    // // }

    // return promise.response;
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
    })

    Object.assign(promise.response, result);

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
  if(response instanceof Promise) {
    Object.assign(response, elements);
    const {getElementByIndex, filterVisibleElements, filterByText, filterByCSS} = FindElementsFunction.prototype;
    
    return {
      getElementByIndex: getElementByIndex.bind(Object.assign(response)),
      filterVisibleElements: filterVisibleElements.bind(Object.assign(response, {filterVisibleElements, getElementByIndex, filterByText, filterByCSS})),
      filterByText: filterByText.bind(Object.assign(response, {filterByText, getElementByIndex, filterVisibleElements, filterByCSS})),
      filterByCSS: filterByCSS.bind(Object.assign(response, {filterByCSS, getElementByIndex, filterVisibleElements, filterByText})),
    }
  }

  const instance = new FindElementsFunction(elements, response);

  return {
    getElementByIndex: instance.getElementByIndex.bind(instance),
    filterVisibleElements: instance.filterVisibleElements.bind(instance),
    filterByText: instance.filterByText.bind(instance),
    filterByCSS: instance.filterByCSS.bind(instance),
  }
};
