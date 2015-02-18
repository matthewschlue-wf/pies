/* ==========================================================
 * wdesk-carousel.js v1.2.0 (http://bit.ly/1gLpN84)
 * adapted from bootstrap-carousel v3.1.1
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

    // CAROUSEL PUBLIC CLASS DEFINITION
    // ================================

    var Carousel = function(element, options) {
        this.$element    = $(element);
        this.$indicators = this.$element.find('.page-indicators');
        this.options     = options;
        this.paused      = null;
        this.sliding     = null;
        this.interval    = null;
        this.$active     = null;
        this.$items      = null;
        this.activeIndex = this.getActiveIndex();

        this.options.pause === 'hover' && this.$element
            .on('mouseenter', $.proxy(this.pause, this))
            .on('mouseleave', $.proxy(this.cycle, this));

        if (!this.options.wrap) {
            this.applyEdgeClasses();
        }

        this.makeAccessibile();
    };

    if (!$.fn.emulateTransitionEnd) {
        throw new Error('wdesk-carousel.js requires wdesk-transition.js');
    }
    if (typeof jQuery === 'undefined') {
        throw new Error('wdesk-carousel.js requires wf-vendor.js');
    }

    Carousel.DEFAULTS = {
        interval: false,
        pause: 'hover',
        wrap: false
    };

    Carousel.prototype = {
        cycle: function(e) {
            e || (this.paused = false);

            this.interval && clearInterval(this.interval);

            this.options.interval
                && !this.paused
                && (this.interval = setInterval($.proxy(this.next, this), this.options.interval));

            return this;
        }

      , getActiveIndex: function() {
            this.$active = this.$element.find('.item.active');
            this.$items  = this.$active.parent().children();

            return this.$items.index(this.$active);
        }

      , to: function(pos) {
            var that        = this;
            var activeIndex = this.getActiveIndex();

            if (pos > (this.$items.length - 1) || pos < 0) {
                return;
            }

            if (this.sliding) {
                return this.$element.one('slid.wdesk.carousel', function() {
                    that.to(pos);
                });
            }
            if (activeIndex == pos) {
                return this.pause().cycle();
            }

            return this.slide(pos > activeIndex ? 'next' : 'prev', $(this.$items[pos]));
        }

      , pause: function(e) {
            e || (this.paused = true);

            if (this.$element.find('[data-slide=prev], [data-slide=next]').length && $.support.transition) {
                this.$element.trigger($.support.transition.end);
                this.cycle(true);
            }

            this.interval = clearInterval(this.interval);

            return this;
        }

      , next: function() {
            if (this.sliding) {
                return;
            }
            return this.slide('next');
        }

      , prev: function() {
            if (this.sliding) {
                return;
            }
            return this.slide('prev');
        }

      , slide: function(type, next) {
            var $active   = this.$element.find('.item.active');
            var $next     = next || $active[type]();
            var isCycling = this.interval;
            var isForward = type == 'next';
            var direction = isForward ? 'left' : 'right';
            var fallback  = isForward ? 'first' : 'last';
            var that      = this;

            if (!$next.length) {
                if (!this.options.wrap) {
                    return;
                }
                $next = this.$element.find('.item')[fallback]();
                this.activeIndex = isForward ? 0 : this.$items.length - 1;
            } else {
                this.activeIndex = this.$items.index($next);
            }

            if ($next.hasClass('active')) {
                return this.sliding = false;
            }

            var e = $.Event('slide.wdesk.carousel', { relatedTarget: $next[0], direction: direction });
            this.$element.trigger(e);

            if (e.isDefaultPrevented()) {
                return;
            }

            this.sliding = true;

            isCycling && this.pause();

            if (this.$indicators.length) {
                this.$indicators.find('.active')
                    .attr('aria-checked', 'false')
                    .removeClass('active');

                this.$element.one('slid.wdesk.carousel', function() {
                    var $nextIndicator = $(that.$indicators.children()[that.getActiveIndex()]);

                    $nextIndicator &&
                    $nextIndicator
                        .attr('aria-checked', 'true')
                        .addClass('active');
                });
            }

            if (!this.options.wrap) {
                this.applyEdgeClasses();
            }

            if ($.support.transition && this.$element.hasClass('slide')) {
                $next.addClass(type);
                $next[0].offsetWidth; // force reflow
                $active.addClass(direction);
                $next.addClass(direction);
                $active
                    .one('wdeskTransitionEnd', function() {
                        $active
                            .attr({
                                'aria-selected': false,
                                'tabindex': '-1'
                            })
                            .removeClass(['active', direction].join(' '));

                        $next
                            .attr({
                                'aria-selected': true,
                                'tabindex': '0'
                            })
                            .removeClass([type, direction].join(' '))
                            .addClass('active');

                        that.sliding = false;
                        setTimeout(function() {
                            that.$element.trigger('slid.wdesk.carousel');
                        }, 0);
                    })
                    // TODO: Use getTransitionDuration() once implemented
                    .emulateTransitionEnd($active.css('transition-duration').slice(0, -1) * 1000);
            } else {
                $active
                    .attr({
                        'aria-selected': false,
                        'tabindex': '-1'
                    })
                    .removeClass('active');
                $next
                    .attr({
                        'aria-selected': true,
                        'tabindex': '0'
                    })
                    .addClass('active');

                this.sliding = false;
                this.$element.trigger('slid.wdesk.carousel');
            }

            isCycling && this.cycle();

            return this;
        }

      , applyEdgeClasses: function() {
            var activeIndex = this.activeIndex,
                itemCount   = this.$items.length;

            this.$element
                [activeIndex === 0 ? 'addClass' : 'removeClass']('at-left-edge')
                [activeIndex === itemCount - 1 ? 'addClass' : 'removeClass']('at-right-edge');
        }

      , makeAccessibile: function() {
            var that = this;

            this.$items.each(function (index) {
                // make sure that any .carousel-caption element is linked to
                // it's parent .item elem as the "label" for WCAG compliance
                var captionClass = 'carousel-caption';
                var $this = $(this);
                var $caption = $this.find('.' + captionClass);
                var captionId = false;
                if ($caption.length) {
                    captionId = $caption.attr('id') ? $caption.attr('id') : that.getUID(captionClass);
                    $this.attr('aria-labelledby', captionId);
                    $caption.attr('id', captionId);
                }

                // make sure that all .item elems have accurate `aria-selected` attribute values
                // and accurate tabindex values for accessibility purposes
                if ($this.hasClass('active')) {
                    $this
                        .attr({
                            'aria-selected': 'true',
                            'tabindex': '0'
                        });
                } else {
                    $this
                        .attr({
                            'aria-selected': 'false',
                            'tabindex': '-1'
                        });
                }
            });
        }

      , getUID: function(prefix) {
            do {
                prefix += ~~(Math.random() * 1000000);
            }
            while (document.getElementById(prefix));

            return prefix;
        }

      , keydown: function(e) {
            var that     = this,
                $this    = $(this),
                $listbox = $this.closest('.carousel-inner'),
                $items   = $listbox.find('.item'),
                $parent  = $listbox.parent(),
                k        = e.which || e.keyCode,
                index,
                i;

            if (!/(37|38|39|40)/.test(k)) {
                return;
            }

            index = $items.index($items.filter('.active'));

            //
            // Up
            //
            if (k == 37 || k == 38) {
                $parent.carousel('prev');
                index--;

                if (index < 0) {
                    index = $items.length -1;
                } else {
                    $this.prev().focus();
                }
            }

            //
            // Down
            //
            if (k == 39 || k == 40) {
                $parent.carousel('next');
                index++;

                if(index == $items.length) {
                    index = 0;
                } else {
                    $this.next().focus();
                }
            }

            e.preventDefault();
            e.stopPropagation();
        }
    };


    // CAROUSEL PLUGIN DEFINITION
    // ==========================

    var old = $.fn.carousel;

    $.fn.carousel = function(option) {
        return this.each(function() {
            var $this   = $(this);
            var data    = $this.data('wdesk.carousel');
            var options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option);
            var action  = typeof option == 'string' ? option : options.slide;

            if (!data) {
                $this.data('wdesk.carousel', (data = new Carousel(this, options)));
            }
            if (typeof option == 'number') {
                data.to(option);
            } else if (action) {
                data[action]();
            } else if (options.interval) {
                data.pause().cycle();
            }
        });
    };

    $.fn.carousel.Constructor = Carousel;


    // CAROUSEL NO CONFLICT
    // ====================

    $.fn.carousel.noConflict = function() {
        $.fn.carousel = old;
        return this;
    };


    // CAROUSEL DATA-API
    // =================

    $(document).on('click.wdesk.carousel.data-api', '[data-slide], [data-slide-to]', function(e) {
        var $this       = $(this), href;
        var $target     = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')); //strip for ie7
        var options     = $.extend({}, $target.data(), $this.data());
        var slideIndex  = $this.attr('data-slide-to');

        if (slideIndex) {
            options.interval = false;
        }

        $target.carousel(options);

        if (slideIndex = $this.attr('data-slide-to')) {
            $target.data('wdesk.carousel').to(slideIndex);
        }

        // do not allow focus to remain after click
        $this.blur();
        e && e.preventDefault();
    });

    $(document).on('keydown.wdesk.carousel.data-api', 'div[role=option]', $.fn.carousel.Constructor.prototype.keydown);

    $(window).on('load', function() {
        $('[data-ride="carousel"]').each(function() {
            var $carousel = $(this);
            $carousel.carousel($carousel.data());
        });
    });

});

if (define.isFake) {
    define = undefined;
}
