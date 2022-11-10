import * as Util from './Util';

// @class Class
// @aka L.Class

// @section
// @uninheritable

// Thanks to John Resig and Dean Edwards for inspiration!

export function Class() {}

Class.extend = function (props) {

	// @function extend(props: Object): Function
	// [Extends the current class](#class-inheritance) given the properties to be included.
	// Returns a Javascript function that is a class constructor (to be called with `new`).
	const NewClass = function (...args) {

		Util.setOptions(this);

		// call the constructor
		if (this.initialize) {
			this.initialize.apply(this, args);
		}

		// call all constructor hooks
		this.callInitHooks();
	};

	const parentProto = NewClass.__super__ = this.prototype;

	const proto = Util.create(parentProto);
	proto.constructor = NewClass;

	NewClass.prototype = proto;

	// inherit parent's statics
	for (const i in this) {
		if (Object.prototype.hasOwnProperty.call(this, i) && i !== 'prototype' && i !== '__super__') {
			NewClass[i] = this[i];
		}
	}

	// mix static properties into the class
	if (props.statics) {
		Object.assign(NewClass, props.statics);
	}

	// mix includes into the prototype
	if (props.includes) {
		Object.assign(proto, ...props.includes);
	}

	// mix given properties into the prototype
	Object.assign(proto, props);
	delete proto.statics;
	delete proto.includes;

	// merge options
	if (proto.options) {
		proto.options = parentProto.options ? Util.create(parentProto.options) : {};
		Object.assign(proto.options, props.options);
	}

	proto._initHooks = [];

	// add method for calling all hooks
	proto.callInitHooks = function () {

		if (this._initHooksCalled) { return; }

		if (parentProto.callInitHooks) {
			parentProto.callInitHooks.call(this);
		}

		this._initHooksCalled = true;

		for (let i = 0, len = proto._initHooks.length; i < len; i++) {
			proto._initHooks[i].call(this);
		}
	};

	return NewClass;
};


// @function include(properties: Object): this
// [Includes a mixin](#class-includes) into the current class.
Class.include = function (props) {
	const parentOptions = this.prototype.options;
	Object.assign(this.prototype, props);
	if (props.options) {
		this.prototype.options = parentOptions;
		this.mergeOptions(props.options);
	}
	return this;
};

// @function mergeOptions(options: Object): this
// [Merges `options`](#class-options) into the defaults of the class.
Class.mergeOptions = function (options) {
	Object.assign(this.prototype.options, options);
	return this;
};

// @function addInitHook(fn: Function): this
// Adds a [constructor hook](#class-constructor-hooks) to the class.
Class.addInitHook = function (fn, ...args) { // (Function) || (String, args...)
	const init = typeof fn === 'function' ? fn : function () {
		this[fn].apply(this, args);
	};

	this.prototype._initHooks = this.prototype._initHooks || [];
	this.prototype._initHooks.push(init);
	return this;
};
