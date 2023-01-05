/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */


/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  this.width = width;
  this.height = height;
  this.getArea = () => this.width * this.height;
}


/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  const objTypeIsSet = Object.create(proto);
  const objFromJSON = JSON.parse(json);
  return Object.assign(objTypeIsSet, objFromJSON);
}


/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

class CssSelectorBase {
  constructor() {
    this.params = {
      element: [],
      id: [],
      className: [],
      attr: [],
      pseudoClass: [],
      pseudoElement: [],
    };
    this.selectorString = '';
    this.correctOrder = {
      element: false,
      id: false,
      class: false,
      attr: false,
      pseudoClass: false,
      pseudoElement: false,
    };
  }

  element(value) {
    this.checkForOccurance('element');
    this.checkForOrder('element');
    this.params.element.push(value);
    return this;
  }

  id(value) {
    this.checkForOccurance('id');
    this.checkForOrder('id');
    this.params.id.push(value);
    return this;
  }

  class(value) {
    this.checkForOrder('class');
    this.params.className.push(value);
    return this;
  }

  attr(value) {
    this.checkForOrder('attr');
    this.params.attr.push(value);
    return this;
  }

  pseudoClass(value) {
    this.checkForOrder('pseudoClass');
    this.params.pseudoClass.push(value);
    return this;
  }

  pseudoElement(value) {
    this.checkForOrder('pseudoElement');
    this.checkForOccurance('pseudoElement');
    this.params.pseudoElement.push(value);
    return this;
  }

  combine(selector1, combinator, selector2) {
    this.selectorString = `${selector1.stringify()} ${combinator} ${selector2.stringify()}`;
    return this;
  }

  stringify() {
    this.addElementToSelectorString(this.params.element);
    this.addElementToSelectorString(this.params.id, '#', '#');
    this.addElementToSelectorString(this.params.className, '.', '.');
    this.addElementToSelectorString(this.params.attr, '[', '][', ']');
    this.addElementToSelectorString(this.params.pseudoClass, ':', ':');
    this.addElementToSelectorString(this.params.pseudoElement, '::', '::');
    return this.selectorString;
  }

  addElementToSelectorString(param, pre, separator, post) {
    const a = pre || '';
    const b = separator || '';
    const c = post || '';
    if (param.length) this.selectorString += a + param.join(b) + c;
  }

  checkForOccurance(paramName) {
    if (this.params[paramName].length) {
      throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    }
  }

  checkForOrder(paramName) {
    let paramIsActive = false;
    Object.keys(this.correctOrder).forEach((param) => {
      if (param === paramName) {
        this.correctOrder[param] = true;
        paramIsActive = true;
      } else if (paramIsActive && this.correctOrder[param]) {
        throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
      }
    });
  }
}

const cssSelectorBuilder = {
  element(value) {
    return new CssSelectorBase().element(value);
  },

  id(value) {
    return new CssSelectorBase().id(value);
  },

  class(value) {
    return new CssSelectorBase().class(value);
  },

  attr(value) {
    return new CssSelectorBase().attr(value);
  },

  pseudoClass(value) {
    return new CssSelectorBase().pseudoClass(value);
  },

  pseudoElement(value) {
    return new CssSelectorBase().pseudoElement(value);
  },

  combine(selector1, combinator, selector2) {
    return new CssSelectorBase().combine(selector1, combinator, selector2);
  },

  stringify() {
    return '';
  },
};

module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
