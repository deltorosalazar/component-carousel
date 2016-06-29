"use strict";
/*
 * carousel ten billion
 * https://github.com/apathetic/flexicarousel
 *
 * Copyright (c) 2013, 2016 Wes Hatch
 * Licensed under the MIT license.
 *
 */

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Carousel = function () {
	function Carousel(container) {
		var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

		_classCallCheck(this, Carousel);

		this.handle = container;

		// default options
		// --------------------
		this.options = {
			activeClass: 'active',
			slideWrap: 'ul', // for binding touch events
			slides: 'li', // the slide
			infinite: true, // infinite scrolling or not
			display: 1, // the minimum # of slides to display at a time. If you want to have slides
			// "hanging" off outside the currently viewable ones, they'd be included here.
			disableDragging: false
		};

		// state vars
		// --------------------
		this.current = 0;
		this.slides = [];
		this.sliding = false;
		this.cloned = 0;

		// touch vars
		// --------------------
		this.dragging = false;
		this.dragThreshold = 10;
		this.deltaX = 0;

		// feature detection
		// --------------------
		this.isTouch = 'ontouchend' in document;
		var style = document.body.style;
		var tests = {
			'transform': 'transitionend',
			'OTransform': 'oTransitionEnd',
			'MozTransform': 'transitionend',
			'webkitTransform': 'webkitTransitionEnd'
		};
		// note: we don't test "ms" prefix, (as that gives us IE9 which doesn't support transforms3d anyway. IE10 will work with "transform")
		for (var x in tests) {
			if (style[x] !== undefined) {
				this.transform = x;
				this.transitionEnd = tests[x];
				break;
			}
		}

		// set up options
		// --------------------
		Object.assign(this.options, options);

		// engage engines
		// --------------------
		this.init();
	}

	/**
  * Initialize the carousel and set some defaults
  * @param  {object} options List of key: value options
  * @return {void}
  */


	_createClass(Carousel, [{
		key: 'init',
		value: function init() {
			var _this = this;

			// find carousel elements
			if (!(this.slideWrap = this.handle.querySelector(this.options.slideWrap))) {
				return;
			} // note: assignment
			if (!(this.slides = this.slideWrap.querySelectorAll(this.options.slides))) {
				return;
			} // note: assignment

			this.numSlides = this.slides.length;

			// check if we have sufficient slides to make a carousel
			if (this.numSlides < this.options.display) {
				this.sliding = true;return;
			} // this.sliding deactivates carousel. I will better-ify this one day. Maybe "this.active" ?
			if (this.options.infinite) {
				this._cloneSlides();
			}

			this.go(0);

			// set up Events
			if (!this.options.disableDragging) {
				if (this.isTouch) {
					this.handle.addEventListener('touchstart', function (e) {
						return _this._dragStart(e);
					});
					this.handle.addEventListener('touchmove', function (e) {
						return _this._drag(e);
					});
					this.handle.addEventListener('touchend', function (e) {
						return _this._dragEnd(e);
					});
					this.handle.addEventListener('touchcancel', function (e) {
						return _this._dragEnd(e);
					});
				} else {
					this.handle.addEventListener('mousedown', function (e) {
						return _this._dragStart(e);
					});
					this.handle.addEventListener('mousemove', function (e) {
						return _this._drag(e);
					});
					this.handle.addEventListener('mouseup', function (e) {
						return _this._dragEnd(e);
					});
					this.handle.addEventListener('mouseleave', function (e) {
						return _this._dragEnd(e);
					});
					this.handle.addEventListener('click', function (e) {
						if (_this.dragThresholdMet) {
							e.preventDefault();
						}
					});
				}
			}

			window.addEventListener('resize', this._updateView.bind(this));
			window.addEventListener('orientationchange', this._updateView.bind(this));

			return this;
		}

		/**
   * Go to the next slide
   * @return {void}
   */

	}, {
		key: 'next',
		value: function next() {
			if (this.options.infinite || this.current !== this.numSlides - 1) {
				this.go(this.current + 1);
			} else {
				this.go(this.numSlides - 1);
			}
		}

		/**
   * Go to the previous slide
   * @return {void}
   */

	}, {
		key: 'prev',
		value: function prev() {
			if (this.options.infinite || this.current !== 0) {
				this.go(this.current - 1);
			} else {
				this.go(0); // allow the slide to "snap" back if dragging and not infinite
			}
		}

		/**
   * Go to a particular slide. Prime the "to" slide by positioning it, and then calling _slide() if needed
   * @param  {int} to		the slide to go to
   * @return {void}
   */

	}, {
		key: 'go',
		value: function go(to) {
			// var options = this.options,
			// 	slides = this.slides;

			if (this.sliding) {
				return;
			}

			this.width = this.slides[0].getBoundingClientRect().width; // check every time. This is preferrable to .offsetWidth as we get a fractional width
			this.offset = this.cloned * this.width;
			// this.offset = this.options.display * this.width;

			if (to < 0 || to >= this.numSlides) {
				// position the carousel if infinite and at end of bounds
				var temp = to < 0 ? this.current + this.numSlides : this.current - this.numSlides;
				this._slide(-(temp * this.width - this.deltaX));

				/* jshint ignore:start */
				this.slideWrap.offsetHeight; // force a repaint to actually position "to" slide. *Important*
				/* jshint ignore:end */
			}

			to = this._loop(to);
			this._slide(-(to * this.width), true);

			if (this.options.onSlide) {
				this.options.onSlide.call(this, to, this.current);
			} // note: doesn't check if it's a function

			this._removeClass(this.slides[this.current], this.options.activeClass);
			this._addClass(this.slides[to], this.options.activeClass);
			this.current = to;
		}

		// ------------------------------------- Drag Events ------------------------------------- //

		/**
   * Start dragging (via touch)
   * @param  {event} e Touch event
   * @return {void}
   */

	}, {
		key: '_dragStart',
		value: function _dragStart(e) {
			var touches;

			if (this.sliding) {
				return false;
			}

			e = e.originalEvent || e;
			touches = e.touches !== undefined ? e.touches : false;

			this.dragThresholdMet = false;
			this.dragging = true;
			this.startClientX = touches ? touches[0].pageX : e.clientX;
			this.startClientY = touches ? touches[0].pageY : e.clientY;
			this.deltaX = 0; // reset for the case when user does 0,0 touch
			this.deltaY = 0; // reset for the case when user does 0,0 touch

			if (e.target.tagName === 'IMG' || e.target.tagName === 'A') {
				e.target.draggable = false;
			}
		}

		/**
   * Update slides positions according to user's touch
   * @param  {event} e Touch event
   * @return {void}
   */

	}, {
		key: '_drag',
		value: function _drag(e) {
			var touches = void 0;

			if (!this.dragging) {
				return;
			}

			e = e.originalEvent || e;
			touches = e.touches !== undefined ? e.touches : false;
			this.deltaX = (touches ? touches[0].pageX : e.clientX) - this.startClientX;
			this.deltaY = (touches ? touches[0].pageY : e.clientY) - this.startClientY;

			// drag slide along with cursor
			this._slide(-(this.current * this.width - this.deltaX));

			// determine if we should do slide, or cancel and let the event pass through to the page
			this.dragThresholdMet = this.dragThresholdMet || Math.abs(this.deltaX) > this.dragThreshold;
		}

		/**
   * Drag end, calculate slides' new positions
   * @param  {event} e Touch event
   * @return {void}
   */

	}, {
		key: '_dragEnd',
		value: function _dragEnd(e) {
			if (!this.dragging) {
				return;
			}

			if (this.dragThresholdMet) {
				e.preventDefault();
				e.stopPropagation();
				e.stopImmediatePropagation();
			}

			this.dragging = false;

			if (this.deltaX !== 0 && Math.abs(this.deltaX) < this.dragThreshold) {
				this.go(this.current);
			} else if (this.deltaX > 0) {
				// var jump = Math.round(this.deltaX / this.width);	// distance-based check to swipe multiple slides
				// this.go(this.current - jump);
				this.prev();
			} else if (this.deltaX < 0) {
				this.next();
			}

			this.deltaX = 0;
		}

		// ------------------------------------- carousel engine ------------------------------------- //

		/**
   * Helper function to translate slide in browser
   * @param  {[type]} el     [description]
   * @param  {[type]} offset [description]
   * @return {[type]}        [description]
   */

	}, {
		key: '_slide',
		value: function _slide(offset, animate) {
			offset -= this.offset;

			if (animate) {
				this.sliding = true;
				this._addClass(this.slideWrap, 'animate');

				var delay = 400;
				var self = this;
				setTimeout(function () {
					self.sliding = false;
					self._removeClass(self.slideWrap, 'animate');
				}, delay);
			}

			if (this.transform) {
				this.slideWrap.style[this.transform] = 'translate3d(' + offset + 'px, 0, 0)';
			} else {
				this.slideWrap.style.left = offset + 'px';
			}
		}

		// ------------------------------------- "helper" functions ------------------------------------- //

		/**
   * Helper function. Calculate modulo of a slides position
   * @param  {int} val Slide's position
   * @return {int} the index modulo the # of slides
   */

	}, {
		key: '_loop',
		value: function _loop(val) {
			return (this.numSlides + val % this.numSlides) % this.numSlides;
		}

		/**
   * Update the slides' position on a resize. This is throttled at 300ms
   * @return {void}
   */

	}, {
		key: '_updateView',
		value: function _updateView() {
			var _this2 = this;

			clearTimeout(this.timer);
			this.timer = setTimeout(function () {
				_this2.go(_this2.current);
			}, 300);
		}

		/**
   * Duplicate the first and last N slides so that infinite scrolling can work.
   * Depends on how many slides are visible at a time, and any outlying slides as well
   * @return {void}
   */

	}, {
		key: '_cloneSlides',
		value: function _cloneSlides() {
			var duplicate;
			var toDuplicate = this.options.display,
			    fromEnd = Math.max(this.numSlides - toDuplicate, 0),
			    fromBeg = Math.min(toDuplicate, this.numSlides);

			// take "toDuplicate" slides from the end and add to the beginning
			for (var i = this.numSlides; i > fromEnd; i--) {
				duplicate = this.slides[i - 1].cloneNode(true); // cloneNode --> true is deep cloning
				duplicate.removeAttribute('id');
				duplicate.setAttribute('aria-hidden', 'true');
				this._addClass(duplicate, 'clone');
				this.slideWrap.insertBefore(duplicate, this.slideWrap.firstChild); // "prependChild"
				this.cloned++;
			}

			// take "toDuplicate" slides from the beginning and add to the end
			for (var _i = 0; _i < fromBeg; _i++) {
				duplicate = this.slides[_i].cloneNode(true);
				duplicate.removeAttribute('id');
				duplicate.setAttribute('aria-hidden', 'true');
				this._addClass(duplicate, 'clone');
				this.slideWrap.appendChild(duplicate);
			}

			// this.slideWrap.style.marginLeft = (-toDuplicate)+'00%';					// use marginLeft (not left) so IE8/9 etc can use left to slide
		}

		/**
   * Helper function to add a class to an element
   * @param  {int} i    Index of the slide to add a class to
   * @param  {string} name Class name
   * @return {void}
   */

	}, {
		key: '_addClass',
		value: function _addClass(el, name) {
			if (el.classList) {
				el.classList.add(name);
			} else {
				el.className += ' ' + name;
			}
		}

		/**
   * Helper function to remove a class from an element
   * @param  {int} i    Index of the slide to remove class from
   * @param  {string} name Class name
   * @return {void}
   */

	}, {
		key: '_removeClass',
		value: function _removeClass(el, name) {
			if (el.classList) {
				el.classList.remove(name);
			} else {
				el.className = el.className.replace(new RegExp('(^|\\b)' + name.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
			}
		}
	}]);

	return Carousel;
}();

exports.default = Carousel;
;
