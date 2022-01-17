/* ==== src/adm ==== Advance Dom Manager ==== */

/* ==== Elmn ==== */

const Elmn = function (el) {
    this.el = el || null;
};

// Public Static API

Elmn.fromEl = function (el) {
    return new Elmn(el);
};

// Public API

// ---- Select

Elmn.prototype.byTagName = function (tagName) {
    return byTagName(tagName, this.el);
};

Elmn.prototype.byClassName = function (className) {
    return byClassName(className, this.el);
};

Elmn.prototype.one = function (selector) {
    return one(selector, this.el);
};

Elmn.prototype.all = function (selector) {
    return all(selector, this.el);
};

// ---- Traverse

Object.defineProperties(Elmn.prototype, {

    parent: {
        get: function () {
            return Elmn.fromEl(this.el.parentNode);
        }
    },

    parentEl: {
        get: function () {
            return Elmn.fromEl(this.el.parentElement);
        }
    },

    nextSibling: {
        get: function () {
            return Elmn.fromEl(this.el.nextSibling);
        }
    },

    nextSiblingEl: {
        get: function () {
            return Elmn.fromEl(this.el.nextElementSibling);
        }
    },

    prevSibling: {
        get: function () {
            return Elmn.fromEl(this.el.previousSibling);
        }
    },

    prevSiblingEl: {
        get: function () {
            return Elmn.fromEl(this.el.previousElementSibling);
        }
    },

    firstChild: {
        get: function () {
            return Elmn.fromEl(this.el.firstChild);
        }
    },

    firstChildEl: {
        get: function () {
            return Elmn.fromEl(this.el.firstElementChild);
        }
    },

    lastChild: {
        get: function () {
            return Elmn.fromEl(this.el.lastChild);
        }
    },

    lastChildEl: {
        get: function () {
            return Elmn.fromEl(this.el.lastElementChild);
        }
    },

    children: {
        get: function () {
            return List.fromEls(this.el.childNodes);
        }
    },

    childrenEl: {
        get: function () {
            return List.fromEls(this.el.children);
        }
    }

});

// ---- Manipulate

Object.defineProperties(Elmn.prototype, {

    content: {
        get: function () {
            return this.el.textContent;
        },
        set: function (content) {
            return this.el.textContent = content;
        }
    },

    text: {
        get: function () {
            return this.el.innertext;
        },
        set: function (text) {
            return this.el.innertext = text;
        }
    },

    HTML: {
        get: function () {
            return this.el.innerHTML;
        },
        set: function (HTML) {
            return this.el.innerHTML = HTML;
        }
    }

});

Elmn.prototype.create = function (tagName, options) {
    return Elmn.fromEl(this.el.createElement(tagName, options));
};

Elmn.prototype.frag = function () {
    return Elmn.fromEl(this.el.createDocumentFragment());
};

Elmn.prototype.appendChild = function (elmn) {
    this.el.appendChild(elmn);
    return this;
};

Elmn.prototype.insertBeforeChild = function (newElmn, refElmn) {
    this.el.insertBefore(newElmn.el, refElmn.el);
    return this;
};

Elmn.prototype.insertBefore = function (newElmn) {
    this.parent.insertBeforeChild(newElmn, this);
    return this;
};

Elmn.prototype.insertAfterChild = function (newElmn, refElmn) {
    this.insertBeforeChild(newElmn, refElmn.nextSibling);
    return this;
};

Elmn.prototype.insertAfter = function (newElmn) {
    this.parent.insertAfterChild(newElmn, this);
    return this;
};

Elmn.prototype.append = function (...elmns) {
    this.el.append(...elmns.map(elmn => elmn.el));
    return this;
};

Elmn.prototype.prepend = function (...elmns) {
    this.el.prepend(...elmns.map(elmn => elmn.el));
    return this;
};

Elmn.prototype.adjText = function (pos, text) {
    this.el.insertAdjacentText(pos, text);
    return this;
};

Elmn.prototype.adjHTML = function (pos, HTML) {
    this.el.insertAdjacentHTML(pos, HTML);
    return this;
};

Elmn.prototype.clone = function (deep) {
    return Elmn.fromEl(this.el.cloneNode(deep));
};

Elmn.prototype.replaceChild = function (newElmn, refElmn) {
    this.el.replaceChild(newElmn.el, refElmn.el);
    return this;
};

Elmn.prototype.replace = function (newElmn) {
    this.parent.replaceChild(newElmn, this);
    return this;
};

Elmn.prototype.removeChild = function (refElmn) {
    this.el.removeChild(refElmn.el);
    return this;
};

Elmn.prototype.remove = function () {
    this.parent.removeChild(this);
    return this;
};

/* ---- Attribute */

Object.defineProperties(Elmn.prototype, {

    dataset: {
        get: function () {
            return this.el.dataset;
        }
    },

    attr: {
        get: function () {
            return this.el.attributes;
        }
    }

});

Elmn.prototype.setAttr = function (attr, value) {
    this.el.setAttribute(attr, value);
    return this;
};

Elmn.prototype.getAttr = function (attr) {
    return this.el.getAttribute(attr);
};

Elmn.prototype.remAttr = function (attr) {
    this.el.removeAttribute(attr);
    return this;
};

Elmn.prototype.hasAttr = function (...attrs) {
    return attrs.every(attr => this.el.hasAttribute(attr));
};

// ---- Style

Elmn.prototype.css = function (styles) {
    for (const prop of styles) {
        this.el.style[prop] = styles[prop];
    }
    return this;
};

Elmn.prototype.computedStyle = function (pseudoEl) {
    return window.getComputedStyle(this.el, pseudoEl);
}

Elmn.prototype.setStyle = function (prop, value) {
    this.el.style.setProperty(prop, value);
    return this;
};

Elmn.prototype.remStyle = function (prop) {
    this.el.style.removeProperty(prop);
    return this;
};

Elmn.prototype.getStyle = function (prop) {
    return this.el.style.getPropertyValue(prop);
};

Elmn.prototype.addCls = function (...cls) {
    this.el.classList.add(...cls);
    return this;
};

Elmn.prototype.remCls = function (...cls) {
    this.el.classList.remove(...cls);
    return this;
};

Elmn.prototype.repCls = function (newCls, oldCls) {
    this.el.classList.replace(oldCls, newCls);
    return this;
};

Elmn.prototype.hasCls = function (...cls) {
    return cls.every(cl => this.el.classList.contains(cl));
};

Elmn.prototype.togCls = function (cls, force) {
    this.el.classList.toggle(cls, force);
    return this;
};

Object.defineProperties(Elmn.prototype, {

    cls: {
        get: function () {
            return this.el.classList;
        }
    },

    offsetWidth: {
        get: function () {
            return this.el.offsetWidth;
        }
    },

    offsetHeight: {
        get: function () {
            return this.el.offsetHeight;
        }
    },

    clientWidth: {
        get: function () {
            return this.el.clientWidth;
        }
    },

    clientHeight: {
        get: function () {
            return this.el.clientHeight;
        }
    }

});

// ---- Event

Elmn.prototype.on = function (event, handler, options) {
    this.el.addEventListener(event, handler, options);
    return this;
};

Elmn.prototype.off = function (event, handler, options) {
    this.el.removeEventListener(event, handler, options);
    return this;
};

/* ==== List ====  */

const List = function (elmns) {
    this.elmns = elmns || [];
};

// Public Static API

List.fromEls = function (els) {
    const elmns = [...els].map(el => new Elmn(el));
    return new List(elmns);
};

List.fromElmns = function (elmns) {
    return new List(elmns);
};

// Public API

// ---- Select

Object.defineProperties(List.prototype, {

    elmn: {
        get: function () {
            return this.elmns[0];
        },
        set: function (elmn) {
            return this.elmns[0] = elmn;
        }
    },

    el: {
        get: function () {
            return this.elmn.el;
        },
        set: function (el) {
            return this.elmn.el = el;
        }
    }

});

List.prototype.byTagName = function (tagName) {
    return byTagName(tagName, this.el);
};

List.prototype.byClassName = function (className) {
    return byClassName(className, this.el);
};

List.prototype.one = function (selector) {
    return one(selector, this.el);
};

List.prototype.all = function (selector) {
    return all(selector, this.el);
};

// ---- Traverse

Object.defineProperties(List.prototype, {

    parent: {
        get: function () {
            return this.elmns.map(elmn => elmn.parent);
        }
    },

    parentEl: {
        get: function () {
            return this.elmns.map(elmn => elmn.parentEl);
        }
    },

    nextSibling: {
        get: function () {
            return this.elmns.map(elmn => elmn.nextSibling);
        }
    },

    nextSiblingEl: {
        get: function () {
            return this.elmns.map(elmn => elmn.nextSiblingEl);
        }
    },

    prevSibling: {
        get: function () {
            return this.elmns.map(elmn => elmn.prevSibling);
        }
    },

    prevSiblingEl: {
        get: function () {
            return this.elmns.map(elmn => elmn.prevSiblingEl);
        }
    },

    firstChild: {
        get: function () {
            return this.elmns.map(elmn => elmn.firstChild);
        }
    },

    firstChildEl: {
        get: function () {
            return this.elmns.map(elmn => elmn.firstChildEl);
        }
    },

    lastChild: {
        get: function () {
            return this.elmns.map(elmn => elmn.lastChild);
        }
    },

    lastChildEl: {
        get: function () {
            return this.elmns.map(elmn => elmn.lastChildEl);
        }
    },

    children: {
        get: function () {
            return this.elmns.map(elmn => elmn.children);
        }
    },

    childrenEl: {
        get: function () {
            return this.elmns.map(elmn => elmn.childrenEl);
        }
    }

});

// ---- Manipulate

Object.defineProperties(List.prototype, {

    content: {
        get: function () {
            return this.elmns.map(elmn => elmn.content);
        },
        set: function (content) {
            return this.elmns.forEach(elmn => elmn.content = content);
        }
    },

    text: {
        get: function () {
            return this.elmns.map(elmn => elmn.text);
        },
        set: function (text) {
            return this.elmns.forEach(elmn => elmn.text = text);
        }
    },

    HTML: {
        get: function () {
            return this.elmns.map(elmn => elmn.HTML);
        },
        set: function (HTML) {
            return this.elmns.forEach(elmn => elmn.HTML = HTML);
        }
    }

});

List.prototype.appendChild = function (elmn) {
    this.elmns.forEach(elmn => elmn.appendChild(elmn));
    return this;
};

List.prototype.insertBeforeChild = function (newElmn, refElmn) {
    this.elmns.forEach(elmn => elmn.insertBeforeChild(newElmn, refElmn));
    return this;
};

List.prototype.insertBefore = function (newElmn) {
    this.elmns.forEach(elmn => elmn.insertBefore(newElmn));
    return this;
};

List.prototype.insertAfterChild = function (newElmn, refElmn) {
    this.elmns.forEach(elmn => elmn.insertAfterChild(newElmn, refElmn));
    return this;
};

List.prototype.insertAfter = function (newElmn) {
    this.elmns.forEach(elmn => elmn.insertAfter(newElmn));
    return this;
};

List.prototype.append = function (...elmns) {
    this.elmns.forEach(elmn => elmn.append(...elmns));
    return this;
};

List.prototype.prepend = function (...elmns) {
    this.elmns.forEach(elmn => elmn.prepend(...elmns));
    return this;
};

List.prototype.adjText = function (pos, text) {
    this.elmns.forEach(elmn => elmn.adjText(pos, text));
    return this;
};

List.prototype.adjHTML = function (pos, HTML) {
    this.elmns.forEach(elmn => elmn.adjHTML(pos, HTML));
    return this;
};

List.prototype.clone = function (deep) {
    return this.elmns.map(elmn => elmn.clone(deep));
};

List.prototype.replaceChild = function (newElmn, refElmn) {
    this.elmns.forEach(elmn => elmn.replaceChild(newElmn, refElmn));
    return this;
};

List.prototype.replace = function (newElmn) {
    this.elmns.forEach(elmn => elmn.replace(newElmn));
    return this;
};

List.prototype.removeChild = function (refElmn) {
    this.elmns.forEach(elmn => elmn.removeChild(refElmn));
    return this;
};

List.prototype.remove = function () {
    this.elmns.forEach(elmn => elmn.remove());
    return this;
};

// ---- Attribute

Object.defineProperties(List.prototype, {

    dataset: {
        get: function () {
            return this.elmns.map(elmn => elmn.dataset);
        }
    },

    attr: {
        get: function () {
            return this.elmns.map(elmn => elmn.attr);
        }
    }

});

List.prototype.setAttr = function (attr, value) {
    this.elmns.forEach(elmn => elmn.setAttr(attr, value));
    return this;
};

List.prototype.getAttr = function (attr) {
    return this.elmns.map(elmn => elmn.getAttr(attr));
};

List.prototype.remAttr = function (attr) {
    this.elmns.forEach(elmn => elmn.remAttr(attr));
    return this;
};

List.prototype.hasAttr = function (...attrs) {
    return this.elmns.map(elmn => elmn.hasAttr(...attrs));
};

// ---- Style

List.prototype.css = function (styles) {
    this.elmns.forEach(elmn => elmn.css(styles));
    return this;
};

List.prototype.computedStyle = function (pseudoEl) {
    return this.elmns.map(elmn => elmn.computedStyle(pseudoEl));
}

List.prototype.setStyle = function (prop, value) {
    this.elmns.forEach(elmn => elmn.setStyle(prop, value));
    return this;
};

List.prototype.remStyle = function (prop) {
    this.elmns.forEach(elmn => elmn.remStyle(prop));
    return this;
};

List.prototype.getStyle = function (prop) {
    return this.elmns.map(elmn => elmn.setStyle(prop));
};

List.prototype.addCls = function (...cls) {
    this.elmns.forEach(elmn => elmn.addCls(...cls));
    return this;
};

List.prototype.remCls = function (...cls) {
    this.elmns.forEach(elmn => elmn.remCls(...cls));
    return this;
};

List.prototype.repCls = function (newCls, oldCls) {
    this.elmns.forEach(elmn => elmn.repCls(newCls, oldCls));
    return this;
};

List.prototype.hasCls = function (...cls) {
    return this.elmns.map(elmn => elmn.hasCls(...cls));
};

List.prototype.togCls = function (cls, force) {
    this.elmns.forEach(elmn => elmn.togCls(cls, force));
    return this;
};

Object.defineProperties(List.prototype, {

    cls: {
        get: function () {
            return this.elmns.map(elmn => elmn.cls);
        }
    },

    offsetWidth: {
        get: function () {
            return this.elmns.map(elmn => elmn.offsetWidth);
        }
    },

    offsetHeight: {
        get: function () {
            return this.elmns.map(elmn => elmn.offsetHeight);
        }
    },

    clientWidth: {
        get: function () {
            return this.elmns.map(elmn => elmn.clientWidth);
        }
    },

    clientHeight: {
        get: function () {
            return this.elmns.map(elmn => elmn.clientHeight);
        }
    }

});

// ---- Event

List.prototype.on = function (event, handler, options) {
    this.elmns.forEach(elmn => elmn.on(event, handler, options));
    return this;
};

List.prototype.off = function (event, handler, options) {
    this.elmns.forEach(elmn => elmn.off(event, handler, options));
    return this;
};

/* ==== ADM ==== */

const byId = function (id) {
    const el = document.getElementById(id);
    return Elmn.fromEl(el);
};

const byName = function (name) {
    const els = document.getElementsByName(name);
    return List.fromEls(els);
};

const byTagName = function (tagName, baseEl = document) {
    const els = baseEl.getElementsByTagName(tagName);
    return List.fromEls(els);
};

const byClassName = function (className, baseEl = document) {
    const els = baseEl.getElementsByClassName(className);
    return List.fromEls(els);
};

const one = function (selector, baseEl = document) {
    const el = baseEl.querySelector(selector);
    return Elmn.fromEl(el);
};

const all = function (selector, baseEl = document) {
    const els = baseEl.querySelectorAll(selector);
    return List.fromEls(els);
};

const $ = one;

$.byId = byId;
$.byName = byName;
$.byTagName = byTagName;
$.byClassName = byClassName;

$.one = one;
$.all = all;

$.Elmn = Elmn;
$.List = List;

$.win = Elmn.fromEl(window);
$.doc = Elmn.fromEl(document);

/* ==== export ==== */

export default $;
