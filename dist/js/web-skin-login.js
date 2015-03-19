/**
 * Web Skin v0.4.24 Plugin JS for the Wdesk Login Screen
 *
 * Copyright 2015 Workiva - formerly WebFilings <https://github.com/Workiva>
 *
 */
/* ==========================================================
 * wdesk-transition.js v1.2.0 (http://bit.ly/1bh9VJL)
 * adapted from bootstrap-transition v3.0.0
 * ===================================================
 * Copyright 2014 Workiva and Twitter, Inc.
 * ========================================================== */

if (typeof define !== 'function') {
    define = function(deps, module) {
        module(window.jQuery, window.Modernizr);
    };
    define.isFake = true;
}

define(['jquery', 'modernizr'],

function($, Modernizr) {

    'use strict';

    if (typeof _ === 'undefined' || typeof jQuery === 'undefined') {
        throw new Error('wdesk-transition.js requires wf-vendor.js');
    }
    if (typeof Modernizr === 'undefined') {
        throw new Error('wdesk-transition.js requires modernizr.js');
    }

    // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
    // ============================================================

    var transitionEnd = function() {

        var el = document.createElement('wdesk');

        var transEndEventNames = {
            WebkitTransition : 'webkitTransitionEnd'
          , MozTransition    : 'transitionend'
          , OTransition      : 'oTransitionEnd otransitionend'
          , transition       : 'transitionend'
        };

        for (var name in transEndEventNames) {
            if (el.style[name] !== undefined) {
                return { end: transEndEventNames[name] };
            }
        }

        return false; // explicit for MSIE 8 ( ._.)
    };

    // http://blog.alexmaccaw.com/css-transitions
    $.fn.emulateTransitionEnd = function(duration) {
        var called = false,
            $el    = this;
        $(this).one('wdeskTransitionEnd', function() { called = true });
        var callback = function() {
            if (!called) {
                $($el).trigger($.support.transition.end);
            }
        };
        setTimeout(callback, duration);
        return this;
    };

    $(function() {
        $.support.transition = transitionEnd();

        if (!$.support.transition) {
            return;
        }

        $.event.special.wdeskTransitionEnd = {
            bindType: $.support.transition.end,
            delegateType: $.support.transition.end,
            handle: function(e) {
                if ($(e.target).is(this)) {
                    return e.handleObj.handler.apply(this, arguments);
                }
            }
        };
    });

    $.fn.getTransitionDuration = ! Modernizr.csstransitions ? (function() {return 0;}) :
        (function(property) {
            var $element = this;
            var millis = 0;

            var properties = $element.css(Modernizr.prefixed('transitionProperty'));
            if (properties) {
                properties = properties.split(', ');
            } else {
                properties = ['all'];
            }

            var index = property ? properties.indexOf(property) : 0;

            if (index !== -1) {
                var durations = $element.css(Modernizr.prefixed('transitionDuration'));
                if (durations) {
                    durations = durations.split(', ');
                } else {
                    durations = [0];
                }

                // Modulo here, because transition durations wrap around
                var duration = durations[index % durations.length];
                var number = parseFloat(duration);

                if (/ms$/.test(duration)) {
                    millis = number;
                } else if (/s$/.test(duration)) {
                    millis = number * 1000;
                } else {
                    millis = number;
                }
            }

            return Math.round(millis);
        });

    return $.fn.getTransitionDuration;

});

if (define.isFake) {
    define = undefined;
}

/* ==========================================================
 * wdesk-alert.js v1.2.0 (http://bit.ly/16ZHY1d)
 * adapted from bootstrap-alert v3.0.0
 * ===================================================
 * Copyright 2014 Workiva and Twitter, Inc.
 * ========================================================== */

if (typeof define !== 'function') {
    define = function(deps, module) {
        module(window.jQuery);
    };
    define.isFake = true;
}

define(['jquery', 'wdesk-transition'],

function($) {

    'use strict';

    // ALERT CLASS DEFINITION
    // ======================

    var dismiss = '[data-dismiss="alert"]';
    var Alert = function (element, options) {
        this.options = options;
        this.$element = $(element).on('click', dismiss, this.hide);
    };

    if (!$.fn.emulateTransitionEnd) {
        throw new Error('wdesk-alert.js requires wdesk-transition.js');
    }
    if (typeof _ === 'undefined' || typeof jQuery === 'undefined') {
        throw new Error('wdesk-alert.js requires wf-vendor.js');
    }

    Alert.DEFAULTS = {
        duration: 150,
        show: false // show as soon as .alert() is called?
    };

    Alert.prototype = {

        constructor: Alert

      , show: function (e) {

            var that = this
              , $this = $(this)
              , selector = $this.attr('data-target')
              , $parent;

            if (!selector) {
                selector = $this.attr('href');
                selector = selector && selector.replace(/.*(?=#[^\s]*$)/, ''); //strip for ie7
            }

            $parent = $(selector);

            if (e) {
                e.preventDefault();
            }

            if (! $parent.length) {
                $parent = $this.hasClass('alert') ? $this : $this.closest('.alert');
            }

            $parent.trigger(e = $.Event('show.wdesk.alert')); // allows subscription to $elem.on('show')

            if (e.isDefaultPrevented()) {
                return;
            }

            $parent.addClass('in')
                    .attr('aria-hidden', false);

            function showAlert() {
                $parent.trigger('shown.wdesk.alert');
            }

            var transDuration = $.support.transition ? $parent.getTransitionDuration() : (this.options ? this.options.duration : Alert.DEFAULTS.duration);
            var transition  = $.support.transition && ($parent.hasClass('fade') || $parent.hasClass('slide') || $parent.hasClass('alert-toast'));

            transition ?
                $parent
                    .one('wdeskTransitionEnd', showAlert)
                    .emulateTransitionEnd(transDuration) :
                showAlert();
        }

      , hide: function (e) {
            var $this = $(this);
            var selector = $this.attr('data-target');

            if (!selector) {
                selector = $this.attr('href');
                selector = selector && selector.replace(/.*(?=#[^\s]*$)/, ''); //strip for ie7
            }

            var $parent = $(selector);

            if (e) {
                e.preventDefault();
            }

            if (! $parent.length) {
                $parent = $this.hasClass('alert') ? $this : $this.closest('.alert');
            }

            $parent.trigger(e = $.Event('hide.wdesk.alert'));

            if (e && e.isDefaultPrevented()) {
                return;
            }

            $parent.removeClass('in')
                   .attr('aria-hidden', true);

            function removeAlert () {
                $parent
                    .trigger('hidden.wdesk.alert')
                    .remove();
            }

            var transDuration = $.support.transition ? $parent.getTransitionDuration() : (this.options ? this.options.duration : Alert.DEFAULTS.duration);
            var transition  = $.support.transition && ($parent.hasClass('fade') || $parent.hasClass('slide') || $parent.hasClass('alert-toast'));

            transition ?
                $parent
                    .one('wdeskTransitionEnd', removeAlert)
                    .emulateTransitionEnd(transDuration) :
                removeAlert();
        }
    };


    // ALERT PLUGIN DEFINITION
    // =======================

    var old = $.fn.alert;

    $.fn.alert = function (option) {
        return this.each(function () {
            var $this = $(this)
                , data = $this.data('wdesk.alert')
                , options = $.extend({}, Alert.DEFAULTS, $this.data(), typeof option == 'object' && option);
            if (!data) {
                $this.data('wdesk.alert', (data = new Alert(this, options)));
            }
            if (typeof option == 'string') {
                data[option].call($this);
            }
        });
    };

    $.fn.alert.Constructor = Alert;


    // ALERT NO CONFLICT
    // =================

    $.fn.alert.noConflict = function () {
        $.fn.alert = old;
        return this;
    };


    // ALERT DATA-API
    // ==============

    $(document).on('click.wdesk.alert.data-api', dismiss, Alert.prototype.hide);

});

if (define.isFake) {
    define = undefined;
}

/* ==========================================================
 * wdesk-collapse.js v1.2.0 (http://bit.ly/15J56BZ)
 * adapted from bootstrap-collapse v3.0.0
 * ===================================================
 * Copyright 2014 Workiva and Twitter, Inc.
 * ========================================================== */

if (typeof define !== 'function') {
    define = function(deps, module) {
        module(window.jQuery);
    };
    define.isFake = true;
}

define(['jquery', 'wdesk-transition'],

function($) {

    'use strict';

    // COLLAPSE PUBLIC CLASS DEFINITION
    // ================================

    var Collapse = function (element, options) {
        this.$element = $(element);
        this.options  = $.extend({}, Collapse.DEFAULTS, options);
        var o = this.options;

        this.transitioning = null;
        this.transDuration = null;
        this.$heading = this.$element.parent().find('[class*=heading]').first();

        // Default the triggerElem to o.initialRelatedTarget
        if (! o.triggerElem) {
            o.triggerElem = o.initialRelatedTarget;
        }

        // which elem receives the "active" class to indicate selection in a collapsible menu?
        this.$activateElem = $(o.triggerElem).closest(o.activateElem);
        if (this.$activateElem.length === 0 && o.activate) {
            this.$activateElem = this.$element.parent();
        }

        this.$parent = this.$element.closest(o.parent);

        this.shownDescendantCollapses = [];
        this.initAndCacheAncestorCollapses();

        // Shim to make changes from #682 backwards compatible until 0.5.0 release
        //
        // `0.5.0` release will no longer automatically toggle when .collapse() is called with no string method specified
        // $('#myCollapsible').collapse({option: 'value'}).collapse('toggle')
        //
        // TODO: deprecate in 0.5.0 release
        if (!o.toggle) {
            try {
                this.toggle(o.triggerElem);
            } catch(err) {

            }
        }

        // add a tabindex to make keyboard navigation possible on <div> elements
        // wire up keyboard event listeners
        var $keyboardNavHandler = this.$parent;
        if (!this.$parent || this.$parent.length < 1) {
            $keyboardNavHandler = this.$element.closest('[role=tablist], [role=tree], [data-collapse-container]');
        }
        $keyboardNavHandler.on('keydown.wdesk.collapse.data-api', $.proxy(this.keydown, this));
    };

    if (!$.fn.emulateTransitionEnd) {
        throw new Error('wdesk-collapse.js requires wdesk-transition.js');
    }
    if (typeof _ === 'undefined' || typeof jQuery === 'undefined') {
        throw new Error('wdesk-collapse.js requires wf-vendor.js');
    }

    Collapse.DEFAULTS = {
        toggle: true,
        parent: false,
        speed: 350,
        triggerElem: null,
        activate: false,
        activateElem: false,
        initialRelatedTarget: false,
        activeClass: 'active'
    };

    Collapse.prototype = {
        initAndCacheAncestorCollapses: function () {
            this.ancestorCollapses = [];
            var parents = this.$element.parents();
            var collapse, $parent;
            for (var i=0, len=parents.length; i<len; i++) {
                collapse = $.data(parents[i], 'wdesk.collapse');
                // Look for uninitialized ancestor collapses via the data-collapse-trigger attr and initialize them
                // This makes it way easier and more performant to auto expand ancestor collapses
                if (! collapse) {
                    $parent = $(parents[i]);

                    if ($parent.hasClass('collapse')) {
                        if (! $parent.attr('aria-labelledby')) {
                            console.log('Collapsible element auto initialized without label element data-api options.\nSee docs about usage with aria-labelledby.');
                        }
                        $parent.collapse();

                        collapse = $.data(parents[i], 'wdesk.collapse');
                    }
                }
                if (collapse) {
                    this.ancestorCollapses.push(collapse);
                }
            }
        }

      , dimension: function () {
            var hasWidth = this.$element.hasClass('width');
            return hasWidth ? 'width' : 'height';
        }

      , getTransDuration: function() {
            return this.transDuration = $.support.transition ? this.$element.getTransitionDuration() : this.options.speed;
        }

      , deactivate: function (elems, $collapseContainer) {
            var that = this;
            var $this = $(this);
            var o = this.options;
            var $container = $collapseContainer ? $collapseContainer : false;

            var getDeactivatedMenu = function ($elem, $btn) {
                var target = getTarget($btn);
                var $menu = $container ? $container.find(target) : $elem.find(target);
                return target && $menu.length > 0 ? $menu : false;
            };

            $.each(elems, function (index, elem) {
                var $elem = $(elem);

                $elem
                    .removeClass(o.activeClass)
                    .removeClass(o.activeClass + '-parent')
                        .find('> [data-toggle="collapse"]')
                            .attr('aria-selected', false);

                var $btn = $elem.find('> [data-toggle="collapse"]');
                var $menu = getDeactivatedMenu($elem, $btn);
                var deactivateEvent;

                if($menu) {
                    var menuData = $menu.data('wdesk.collapse');
                    if(menuData) {
                        deactivateEvent = $.Event('deactivate.wdesk.collapse', { relatedTarget: menuData.options.triggerElem, activeElem: menuData.$activateElem[0] });
                    } else {
                        deactivateEvent = $.Event('deactivate.wdesk.collapse');
                    }

                    // TODO: add this event to collapse docs
                    $menu.trigger(deactivateEvent);
                }
            });
        }

      , activate: function (_relatedTarget) {
            var that = this;
            var $this = $(this);
            var o = this.options;

            // reset some options based on current event
            o.triggerElem = $(_relatedTarget)[0] || o.triggerElem;
            o.activateElem = o.activateElem || this.$element.parent()[0].nodeName.toLowerCase();

            this.$activateElem = $(o.triggerElem).closest(o.activateElem);

            if(this.$activateElem && this.$activateElem.length) {
                var activateEvent = $.Event('activate.wdesk.collapse', { relatedTarget: o.triggerElem, activeElem: this.$activateElem[0] });

                // first, deactivate any currently activated elems
                var $collapseContainer = this.$activateElem.parents('[data-collapse-container]') || this.$activateElem.parent();
                var deactivateCandidates = null;

                if($collapseContainer && $collapseContainer.length) {
                    // if a collapse container has been specified, we are likely dealing with a multi-level hierarchical collapsing structure...
                    // use this container as the starting point to search for currently active elems.
                    deactivateCandidates = $collapseContainer.find(o.activateElem).filter('[class*=' + o.activeClass + ']');
                } else {
                    // otherwise, its a flat collapsing structure... so just go to the parent and search from there.
                    deactivateCandidates = this.$activateElem.parent().find(o.activateElem).filter('[class*=' + o.activeClass + ']');
                }

                if(deactivateCandidates && deactivateCandidates.length > 0) {
                    this.deactivate(deactivateCandidates, $collapseContainer);
                }

                $.each(this.ancestorCollapses, function(index, element) {
                    // if the active element has parent(s), add the .active-parent class to those.
                    try {
                        $(element.$activateElem).addClass(o.activeClass + '-parent');
                    } catch(err) {

                    }
                });
                // now, activate the new active element
                this.$activateElem
                    .addClass(o.activeClass)
                    .find('> [data-toggle="collapse"]')
                        .attr('aria-selected', true);

                // broadcast an event signifying that a new elem has been activated
                this.$element.trigger(activateEvent);
            }
        }

      , hideCurrentElems: function (currentElems, startEvent) {
            $.each(currentElems, function (index, elem) {
                var $elem = $(elem);
                var hasData = $elem.data('wdesk.collapse');
                if (hasData && hasData.transitioning) {
                    return;
                }
                $elem.collapse('hide', startEvent.relatedTarget);
                hasData || $elem.data('wdesk.collapse', null);
            });
        }

      , show: function (_relatedTarget) {
            if (this.transitioning || this.$element.hasClass('in')) {
                return;
            }

            var that = this;
            var o = this.options;

            // reset some options based on current event
            o.triggerElem = $(_relatedTarget)[0] || o.triggerElem;

            var startEvent = $.Event('show.wdesk.collapse', { relatedTarget: o.triggerElem });
            this.$element.trigger(startEvent);

            if (startEvent.isDefaultPrevented()) {
                return;
            }

            // Collapse all currently expanded siblings IF parent option is set
            if (this.ancestorCollapses.length && o.parent) {
                var parentCollapse = this.ancestorCollapses[0];
                // Iterate through the parent's descendants to find siblings
                var descendantCollapse, descendantParentCollapse;
                for (var i=0, len=parentCollapse.shownDescendantCollapses.length; i<len; i++) {
                    descendantCollapse = parentCollapse.shownDescendantCollapses[i];
                    // allow for an undefined descendantCollapse.ancestorCollapses array,
                    // as the loop counter can get fouled in MSIE8
                    if (descendantCollapse && descendantCollapse.ancestorCollapses && descendantCollapse.ancestorCollapses[0]) {
                        descendantParentCollapse = descendantCollapse.ancestorCollapses[0];
                        // Check to see if the descendant is a direct child of the parent, and thus, a sibling
                        if (descendantParentCollapse === parentCollapse) {
                            descendantCollapse.hide();
                        }
                    }
                }
            }

            // find all currently expanded elems under $parent and collapse them
            var currentElems = this.$parent.find('> [class*=group] > .in');
            if(currentElems && currentElems.length) {
                this.hideCurrentElems(currentElems, startEvent);
            } else {
                currentElems = this.$parent.find('> [class*=group] > .panel > .in');
                this.hideCurrentElems(currentElems, startEvent);
            }

            // Recursively expand all ancestor collapse elements, only animating the rootmost collapsed element
            var autoExpandParentCollapse = this.ancestorCollapses.length && ! this.ancestorCollapses[0].$element.hasClass('in');
            if (autoExpandParentCollapse) {
                this.nextTransitionDisabled = true;
            }


            var dimension = this.dimension();

            // decorate the heading, trigger elem (related target), and collapse trigger
            this.$heading.add(o.triggerElem).add(o.initialRelatedTarget)
                .addClass('open')
                .removeClass('collapsed')
                .attr({
                    'tabindex': '0',
                    'aria-expanded': true
                })
                .focus();

            // decorate the collapsing elem
            this.$element
                .removeClass('collapse')
                .addClass('collapsing')
                [dimension](0);

            this.transitioning = 1;

            var complete = function (e) {
                if (e && e.target !== that.$element[0]) {
                    return;
                }

                that.$element
                    .removeClass('collapsing')
                    .addClass('collapse in')
                    .attr({
                        'aria-hidden': false
                    })
                    .removeAttr('tabindex')
                    [dimension]('auto');

                that.transitioning = 0;
                that.nextTransitionDisabled = false;

                var completeEvent = $.Event('shown.wdesk.collapse', { relatedTarget: o.triggerElem });
                that.$element.trigger(completeEvent);

                // Update state of ancestor collapses
                var collapse;
                for (var i=0, len=that.ancestorCollapses.length; i<len; i++) {
                    that.ancestorCollapses[i].shownDescendantCollapses.push(that);
                }

                if (autoExpandParentCollapse) {
                    that.ancestorCollapses[0].show();
                }
            };

            if (!$.support.transition || this.nextTransitionDisabled) {
                return complete.call(this);
            }

            var scrollSize = $.camelCase(['scroll', dimension].join('-'));
            var transDuration = this.getTransDuration();

            this.$element
                .one('wdeskTransitionEnd', $.proxy(complete, this))
                .emulateTransitionEnd(transDuration)
                [dimension](this.$element[0][scrollSize]);
        }

      , hide: function (_relatedTarget) {
            if (this.transitioning || !this.$element.hasClass('in')) {
                return;
            }

            var that = this;
            var o = this.options;

            // reset some options based on current event
            o.triggerElem = $(_relatedTarget)[0] || o.triggerElem;

            var startEvent = $.Event('hide.wdesk.collapse', { relatedTarget: o.triggerElem });
            this.$element.trigger(startEvent);

            if (startEvent.isDefaultPrevented()) {
                return;
            }

            var dimension = this.dimension();

            // decorate the heading, trigger elem (related target), and collapse trigger
            this.$heading.add(o.triggerElem).add(o.initialRelatedTarget)
                .addClass('collapsed')
                .removeClass('open')
                .attr('aria-expanded', false);

            // decorate the collapsing elem
            this.$element
                [dimension](this.$element[dimension]())
                [0].offsetHeight;
            this.$element
                .addClass('collapsing')
                .removeClass('collapse')
                .removeClass('in');

            this.transitioning = 1;

            var complete = function () {
                var i;

                var completeEvent = $.Event('hidden.wdesk.collapse', { relatedTarget: o.triggerElem });

                that.transitioning = 0;
                that.nextTransitionDisabled = false;

                that.$element
                    .removeClass('collapsing')
                    .addClass('collapse')
                    .attr({
                        'tabindex': '-1',
                        'aria-hidden': true
                    })
                    .trigger(completeEvent);

                var collapse;

                // Collapse all currently expanded descendants synchronously, without any transition.
                // A collapsing element may or may not remove itself from all ancestors'
                // shownDescendantCollapses arrays, so we gots to be tricky to loop over them
                var oldTransitionDisabled;
                for (i=0; i<that.shownDescendantCollapses.length;) {
                    collapse = that.shownDescendantCollapses[i];
                    collapse.nextTransitionDisabled = true;
                    collapse.hide();
                    // If the collapse didn't remove itself from this array, it cancelled the hide.
                    if (collapse === that.shownDescendantCollapses[i]) {
                        // Move on to the next one.
                        i++;
                    }
                }

                // Update state of ancestor collapses
                var index, len;
                for (i=0, len=that.ancestorCollapses.length; i<len; i++) {
                    index = that.ancestorCollapses[i].shownDescendantCollapses.indexOf(that);
                    if (index !== -1) {
                        that.ancestorCollapses[i].shownDescendantCollapses.splice(index, 1);
                    }
                }
            };

            if (!$.support.transition || this.nextTransitionDisabled) {
                return complete.call(this);
            }

            var transDuration = this.getTransDuration();

            this.$element
                [dimension](0)
                .one('wdeskTransitionEnd', $.proxy(complete, this))
                .emulateTransitionEnd(transDuration);
        }

      , toggle: function (_relatedTarget) {
            this[this.$element.hasClass('in') ? 'hide' : 'show'](_relatedTarget);
        }

      , keydown: function(event) {
            if (event.isDefaultPrevented()) {
                return;
            }

            var that = this,
                $items,
                $currentItem,
                index,
                key = event.which || event.keyCode;

            var $collapseParent = this.$element.closest('[role=tablist], [role=tree]');

            if ($collapseParent.length) {
                if (!/(13|32|37|38|39|40)/.test(key)) {
                    return;
                }

                // in order to support nested collapses, only count items that are visible
                $items = $collapseParent.find('[data-toggle=collapse]:visible');

                if (!$items.length) {
                    return;
                }

                // which $item has :focus?
                index = $items.index($(document.activeElement));
                $currentItem = $items.eq(index);

                if (key == 32 || key == 13) {
                    if ($currentItem.is('.disabled', ':disabled')) {
                        return;
                    }

                    if ($currentItem.attr('aria-selected') == 'true') {
                        var elemCollapsed = $currentItem.attr('aria-expanded') == 'true';
                        // try to click the caret that will collapse without deactivating
                        $currentItem.parent().find('[data-activate=false]').click();

                        if (elemCollapsed) {
                            $items.eq(index - 1).focus();
                            // since collapsing will make the current item un-focusable,
                            // focus the previous item
                        } else {
                            // else focus the current element after clicking
                            // it's "data-activate=false" sister element
                            // since the sister element is likely not visible / lacks a tabindex
                            $currentItem.focus();
                        }
                    } else {
                        $currentItem.trigger('click');
                    }
                    index = $items.index($(document.activeElement));
                }

                if (key == 38 || key == 37) { index--; } // up & left
                if (key == 40 || key == 39) { index++; } // down & right

                if (index < 0) {
                    index = $items.length -1;
                }
                if (index == $items.length) {
                    index = 0;
                }

                $currentItem = $items.eq(index);
                $currentItem.focus();

                event.preventDefault();
                event.stopPropagation();
            } else {
                // something went wrong... no tablist or tree found.
            }
        }
    };


    // COLLAPSE PLUGIN DEFINITION
    // ==========================

    var old = $.fn.collapse;

    $.fn.collapse = function (option, _relatedTarget) {
        return this.each(function () {
            var $this = $(this);
            var collapse  = $this.data('wdesk.collapse');
            var $relatedTarget =  $(_relatedTarget);

            if (! collapse) {
                var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option);

                // If no valid _relatedTarget was passed in, default to the element specified by the aria-labelledby attribute
                if ($relatedTarget.length === 0) {
                    var labelId = $this.attr('aria-labelledby');
                    if (labelId) {
                        /*
                            Why not use $('#' + labelId), you ask?
                            Since aria-labelledby specifies just an ID, not a selector, it can be an ID with
                            characters that get identified as parts of other selectors by jQuery.

                            var looksLikeSelector = 'yolo.swag';
                            document.body.id = looksLikeSelector;
                            console.log(!! document.getElementById(looksLikeSelector)); // prints true
                            console.log(!! $('#' + looksLikeSelector)[0]);              // prints false
                        */
                        $relatedTarget = $(document.getElementById(labelId));
                    }
                }

                if ($relatedTarget.length) {
                    $.extend(options, $relatedTarget.data());
                    options.initialRelatedTarget = $relatedTarget[0];
                }
                collapse = new Collapse(this, options);
                $this.data('wdesk.collapse', collapse);
            }
            if (typeof option == 'string') {
                collapse[option]($relatedTarget[0]);
            }
        });
    };

    $.fn.collapse.Constructor = Collapse;


    // COLLAPSE NO CONFLICT
    // ====================

    $.fn.collapse.noConflict = function () {
        $.fn.collapse = old;
        return this;
    };


    // COLLAPSE DATA-API
    // =================

    $(document).on('click.wdesk.collapse.data-api', '[data-toggle=collapse]', function (e) {
        var $this   = $(this), href;
        var target  = getTarget($this, e);
        var $target = $(target);
        // if there are nested elems within a [data-toggle=collapse] elem... which one was clicked?
        var $relatedTarget = $(e.target);
        // does the nested item instruct use that a click "activates" a menu item?
        var activate = !! $relatedTarget.data('activate');

        var collapse = $target.data('wdesk.collapse');
        if (! collapse) {
            // Initialize the collapse with 'this' (the [data-toggle=collapse] elem) as
            // the related target so that it loads the data attribute settings properly
            $target.collapse({}, this);
            collapse = $target.data('wdesk.collapse');
        }

        if (activate) {
            // "activate" and show the specified elem
            collapse.activate($relatedTarget);
            collapse.show($relatedTarget);
        } else {
            collapse.toggle($relatedTarget);
        }
    });


    // HELPER FUNCTION(S)
    // ====================

    var getTarget = function(elem, event) {
        // determine the target elem to be collapsed via
        //   1. `data-target` attribute
        //   2. `aria-controls` attribute
        //   3. `href` attribute
        var href = elem.attr('href');
        var target = elem.attr('data-target');

        if (!target) {
            if (href) {
                event && event.preventDefault();
                target = href.replace(/.*(?=#[^\s]+$)/, ''); //strip for ie7
            } else {
                target = '#' + elem.attr('aria-controls');
            }
        }

        return target;
    };
});

if (define.isFake) {
    define = undefined;
}
