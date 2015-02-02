/* ==========================================================
 * wdesk-dropdown.js v1.2.0 (http://bit.ly/19iagKq)
 * adapted from bootstrap-dropdown v3.0.0
 * ===================================================
 * Copyright 2014 Workiva and Twitter, Inc.
 * ========================================================== */

if (typeof define !== 'function') {
    define = function(deps, module) {
        module(window.jQuery);
    };
    define.isFake = true;
}

define(['jquery'],

function($) {

    'use strict';

    // DROPDOWN CLASS DEFINITION
    // =========================

    var backdrop = '.dropdown-backdrop';
    var toggle   = '[data-toggle="dropdown"]';

    var Dropdown = function (element, options) {
        this.isTouch = 'ontouchstart' in document.documentElement;
        this.options  = null;
        this.$element = null;
        this.$menu    = null;
        this.$parent  = null;
        this.$clearTrigger = null;
        this.elementId = null;
        this.isActive = false;

        this.init(element, options);
    };

    if (typeof _ === 'undefined' || typeof jQuery === 'undefined') {
        throw new Error('wdesk-dropdown.js requires wf-vendor.js');
    }

    Dropdown.DEFAULTS = {
        persistent: false,
        autoWidth: false
    };

    Dropdown.prototype = {

        constructor: Dropdown

      , init: function(element, options) {
            this.$element = $(element);
            this.$parent = getParent(this.$element);
            this.$menu = $('.dropdown-menu', this.$parent);
            this.parentWidth = getParentWidth(this.$parent);
            this.options = this.getOptions(options);

            // ensure that the triggering element has a unique ID so it can be associated
            // with the dropdown-menu via `aria-labelledby` for WCAG accessibility when it is visible
            // so that the menu can use
            if (! this.elementId) {
                this.elementId = this.$element.attr('id') || this.getUID('dropdown-toggle');
            }
            this.$element.attr('id', this.elementId);

            var that = this;
            var relatedTarget = { relatedTarget: this };

            this.$parent.find(toggle)
                .on('click.wdesk.dropdown.data-api', $.proxy(this.toggle, this));
            this.$parent.find(toggle + ', [role=menu], [role=listbox], .dropdown-menu li:not(.divider):visible > .hitarea')
                .on('keydown.wdesk.dropdown.data-api', $.proxy(this.keydown, this));

            // if the dropdown menu loses focus, close the menu for WCAG compliance
            // $(document).on('focusout.wdesk.dropdown.data-api', '.dropdown-menu', function(e) {
            //     var focusedElem = $(document.activeElem);
            //     if (! $(this).find(focusedElem).length) {
            //         console.log('focus lost', e, focusedElem);
            //     }
            // });
        }

      , getDefaults: function() {
            return Dropdown.DEFAULTS;
        }

      , getOptions: function(options) {
            return $.extend({}, this.getDefaults(), this.$element.data(), options);
        }

      , focusIn: function() {
            // try to focus the first item in the dropdown menu for WCAG accessibility compliance
            // if it fails, fall back to focusing the triggering element.
            var that = this;
            var $firstItem = $('.hitarea:visible, :input:visible', this.$menu)[0];
            try {
                $firstItem.focus();
            } catch(err) {
                that.$element.focus();
            }
        }

      , focusOut: function() {
            // move focus back to the triggering element
            try {
                this.$element.focus();
            } catch(err) {
                // must have been a menu triggered programatically
            }
        }

      , isNestedFormInput: function(e) {
            var isFormInputNestedWithinDropdown = false;

            if ($(e.target).closest('.dropdown-menu').length > 0) {
                isFormInputNestedWithinDropdown = true;
            }

            return isFormInputNestedWithinDropdown;
        }

      , show: function (e) {
            var that = this,
                relatedTarget = { relatedTarget: this };

            // make sure the width of the triggering elem
            // does not exceed the width of the dropdown-menu itself
            if(this.options.autoWidth) {
                this.$menu.css('min-width', getParentWidth(this.$parent) + 10);
            }

            this.$parent.trigger(e = $.Event('show.wdesk.dropdown', relatedTarget));

            // set up some event listeners so that clicking outside
            // the dropdown menu triggers a toggle()
            if(this.options.persistent === false) {
                $(document)
                    .on('click.wdesk.dropdown.data-api', function (e) {
                        that.toggle(e);
                    })
                    .on('click.wdesk.dropdown.data-api', 'form', function (e) {
                        if (!that.isNestedFormInput(e)) {
                            e.stopPropagation();

                            that.toggle(e);

                            $(e.target).focus();
                        }
                    });
            }
            if(this.isTouch && !this.$parent.closest('.navbar-nav').length) {
                // if mobile we we use a backdrop because click events don't delegate
                $('<div class="dropdown-backdrop"/>').insertAfter(this.$parent).on('click.wdesk.dropdown.data-api', function (e) {
                    that.toggle(e);
                });
            }

            this.$parent.toggleClass('open');
            this.$element.attr('aria-expanded', 'true');
            this.$menu.attr('aria-labelledby', this.elementId);

            this.focusIn();

            this.$parent.trigger(e = $.Event('shown.wdesk.dropdown', relatedTarget));
        }

      , hide: function (e) {
            var that = this,
                relatedTarget = { relatedTarget: this };

            this.$parent.trigger(e = $.Event('hide.wdesk.dropdown', relatedTarget));

            if (e.isDefaultPrevented()) {
                return;
            }

            // de-register event listener registered in this.show()
            $(document).off('click.wdesk.dropdown.data-api');
            $(backdrop).remove();

            this.$parent.removeClass('open');
            this.$element.attr('aria-expanded', 'false');
            this.$menu.removeAttr('aria-labelledby');

            this.focusOut();

            this.$parent.trigger(e = $.Event('hidden.wdesk.dropdown', relatedTarget));
        }

      , toggle: function (e) {

            if (this.$element.is('.disabled, :disabled')) {
                return;
            }

            // do not allow focus to remain after click
            this.$element.blur();

            // in order to allow dropdowns to be controlled via js-api methods
            // we still need the `data-toggle=dropdown` attr on the DOM object
            // so that clearMenus() functions properly when it iterates through
            // all of the $(toggle) elems
            ! this.$element.data('toggle') && this.$element.attr('data-toggle', 'dropdown');

            // before we go through and close all the open menus
            // check to see if this was the menu that was open in the first place
            this.isActive = this.$parent.hasClass('open');

            // ensure that the triggering element has a unique ID so it can be associated
            // with the dropdown-menu via `aria-labelledby` for WCAG accessibility when it is visible
            // so that the menu can use
            if (! this.elementId) {
                this.elementId = this.$element.attr('id') || this.getUID('dropdown-toggle');
            }
            this.$element.attr('id', this.elementId);

            // dropdown mutex
            this.clearMenus(e);

            // if it was not open before we executed this.clearMenus
            // then open it now
            !this.isActive && this.show(e);

            return false;
        }

      , keydown: function (e) {
            var $items
              , desc
              , hitareas
              , input
              , inputs
              , index;

            this.isActive = this.$parent.hasClass('open');

            if (!/(38|40|27|32)/.test(e.keyCode)) {
                if (e.keyCode == 9 && this.isActive) {
                    // if the dropdown menu loses focus via tab,
                    // close the menu for WCAG compliance
                    this.hide(e);
                } else {
                    return;
                }
            }

            e.preventDefault();
            e.stopPropagation();

            if (this.$element.is('.disabled, :disabled')) {
                return;
            }

            if ((!this.isActive && e.keyCode != 27) || this.isActive && (e.keyCode == 27 || e.keyCode == 32)) {
                return this.$element.click();
            }

            desc = 'li:not(.divider):visible .hitarea';
            input = 'li:not(.divider):visible :input:not([aria-hidden=true])';
            hitareas = '[role=menu] ' + desc + ', [role=listbox] ' + desc;
            inputs = '[role=menu] ' + input + ', [role=listbox] ' + input;
            $items = $(hitareas + ', ' + inputs, this.$parent);

            if (!$items.length) {
                return;
            }

            index = $items.index($(document.activeElement));

            if (e.keyCode == 38 && index > 0)                 { index--; } // up
            if (e.keyCode == 40 && index < $items.length - 1) { index++; } // down
            if (!~index) {
                index = 0;
            } else {
                $items
                    .eq(index)
                    .focus();
            }
        }

      , clearMenus: function (e) {

            this.$clearTrigger = e ? $(e.currentTarget) : 'js-api';

            var that = this,
                ev = e,
                // make sure original clearTrigger is set locally so when we checkPersistence, we have two objects to compare
                $clearTrigger = this.$clearTrigger;

            // check for all dropdown toggles in the dom
            $(toggle).each(function () {
                var $this = $(this)
                  , data = $this.data('wdesk.dropdown')
                  , $parent = getParent($this)
                  , relatedTarget = { relatedTarget: this }
                  , isActive = $parent.hasClass('open');

                // we only need to check persistence if its currently open
                isActive && checkPersistence(data, ev, $clearTrigger);
            });
        }

      , getUID: function(prefix) {
            do {
                prefix += ~~(Math.random() * 1000000);
            }
            while (document.getElementById(prefix));

            return prefix;
        }
    };

    function getParentWidth($parent) {
        var parentWidth = 0;
        if ($parent) {
            parentWidth = $parent.outerWidth();
        }

        return parentWidth;
    }

    function getParent ($this) {
        var selector = $this.attr('data-target')
          , $parent;

        if (!selector) {
            selector = $this.attr('href');
            selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, ''); //strip for ie7
        }

        $parent = selector && $(selector);

        return $parent && $parent.length ? $parent : $this.parent();
    }

    function checkPersistence(el, ev, $clearTrigger) {
        var that = el;

        // run through persistence check before
        // determining if we should hide this menu
        if (that.options.persistent === true) {
            if ($clearTrigger === 'js-api' || $clearTrigger.is(that.$element)) {
                // triggered by toggle button or directly via a js api method
                // close it
                that.hide(ev);
            } else {
                // something other than the original toggle button
                // triggered the call - do nothing since the menu is persistent
            }
        } else {
            that.hide(ev);
        }
    }

    function isNestedFormInput(e) {
        var _isNestedFormInput = false;
        var $elem = $(e.target);

        if ($elem.closest('.dropdown-menu').length > 0) {
            if ($elem.is('input') || $elem.is('textarea')) {
                _isNestedFormInput = true;
            }
        }

        return _isNestedFormInput;
    }

    function swallowClickPropagation(e) {
        if (e) {
            // if it was a right click, or a form input within a dropdown menu has gained focus
            if (e.button === 2 || isNestedFormInput(e)) {
                e.stopImmediatePropagation();
            }

            // no matter what
            e.stopPropagation();
        }
    }


    // DROPDOWN PLUGIN DEFINITION
    // ==========================

    var old = $.fn.dropdown;

    $.fn.dropdown = function (option) {
        return this.each(function () {
            var $this = $(this)
               , data = $this.data('wdesk.dropdown')
               , options = typeof option == 'object' && option;
            if (!data) {
                $this.data('wdesk.dropdown', (data = new Dropdown(this, options)));
            }
            if (typeof option == 'string') {
                data[option]();
            }
        });
    };

    $.fn.dropdown.Constructor = Dropdown;


    // DROPDOWN NO CONFLICT
    // ====================

    $.fn.dropdown.noConflict = function () {
        $.fn.dropdown = old;
        return this;
    };


    // APPLY TO STANDARD DROPDOWN ELEMENTS
    // ===================================

    $(document)
        .on('click.wdesk.dropdown.data-api', '.dropdown form', function (e) { swallowClickPropagation(e); })
        .on('click.wdesk.dropdown-menu', function (e) { swallowClickPropagation(e); });

    $(toggle, document).dropdown();

});

if (define.isFake) {
    define = undefined;
}
