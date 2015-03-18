/*
 *    Author: Fulup Ar Foll
 *    Date: March 2015
 *    Object: Port of Foundation-5 sliders to Angular
 *
 *    Reference: https://github.com/zurb/foundation
 *
 *    Dependencies module only depend on Foundation RangeSlider CSS
 *        https://github.com/zurb/foundation/blob/master/scss/foundation/components/_range-slider.scss
 *
 */


    'use strict';
    var RangeSlider = angular.module('bzm-range-slider',[]);

    function RangeSliderHandle (scope) {
        var internals = [];
        var externals = [];

        this.getId = function() {
            return scope.sliderid;
        };

        this.getView= function (handle) {
            if (!handle) handle = 0;

            // if value did not change return current external representation
            if (scope.value[handle] === internals[handle]) return externals[handle];

            // build external representation and save it for further requests
            internals[handle] = scope.value[handle];
            if (scope.formatter) externals[handle] = scope.formatter(scope.value[handle], scope.sliderid);
            else  externals[handle] = scope.value[handle];

            return externals[handle];
        };

        this.getValue= function (handle) {
            if (!handle) handle = 0;
            return scope.value[handle];
        };

        this.getRelative= function (handle) {
            if (!handle) handle = 0;
            return scope.relative[handle];
        };

        this.setValue= function (value, handle) {
            if (!handle) handle = 0;
            scope.setValue (value);
        };
    }



    RangeSlider.directive('rangeSlider', ["$log", "$document", "$filter", bzmFoundationSlider]);
    function bzmFoundationSlider ($log, $document, $filter) {

        var template= '<div class="bzm-range-slider range-slider" data-slider>'
                      + '<span class="range-slider-handle handle-min" ng-mousedown="handleCB($event,0)" ng-focus="focusCB(true)" ng-blur="focusCB(false)" role="slider" tabindex="0"></span>'
                      + '<span class="handle-max" ng-mousedown="handleCB($event,1)" ng-focus="focusCB(true)" ng-blur="focusCB(false)" role="slider" tabindex="0"></span>'
                      + '<span class="range-slider-active-segment"></span>'
                      + '<span class="bzm-range-slider-start" ></span> '
                      + '<span class="bzm-range-slider-stop"></span> '
                      + '<input type="hidden">'
                    + '</div>';


        function link (scope, element, attrs, model) {

           scope.normalize = function (value) {
                var range = scope.notMore - scope.notLess;
                var point = value * range;

                // if step is positive let's round step by step
                if (scope.bystep >  0) {
                    var mod = (point - (point % scope.bystep)) / scope.bystep;
                    var rem = point % scope.bystep;

                    var round = (rem >= scope.bystep * 0.5 ? scope.bystep : 0);
                    var result= (mod * scope.bystep + round) + scope.notLess;
                    //console.log ("range=%d value=%d point=%d mod=%d rem=%d round=%d result=%d", range, value, point, mod, rem, round, result)
                    return result;
                }

                // if step is negative return round to asked decimal
                if (scope.bystep <  0) {
                    var power  =  Math.pow (10,(scope.bystep * -1));
                    var result = scope.notLess + parseInt (point * power) / power;
                    return (result);
                }

                // if step is null return full value
                return point;
           };

            // return current value
            scope.getValue = function (offset, handle) {

                if (scope.vertical) {
                    scope.relative[handle] = (offset - scope.bounds.handles[handle].height) /  (scope.bounds.bar.height - scope.bounds.handles[handle].height);
                } else {
                    scope.relative[handle] = (offset) /  (scope.bounds.bar.width - scope.bounds.handles[handle].width);
                }
                var newvalue = scope.normalize (scope.relative[handle]);

                // if internal value change update or model
                if (newvalue != scope.value[handle]) {
                    if (newvalue < scope.startValue) newvalue=scope.startValue;
                    if (newvalue > scope.stopValue)  newvalue=scope.stopValue;

                    scope.value[handle] = newvalue;
                    if (scope.displays[handle]) {
                        if (scope.formatter) scope.displays[handle].html (scope.formatter (newvalue, scope.sliderid));
                        else scope.displays[handle].html (newvalue);
                    }
                    scope.$apply();
                    if (newvalue > scope.startValue && newvalue < scope.stopValue) scope.translate(offset, handle);
                }
            };


            scope.setStart = function (value) {

                if (value > scope.value[0]) {
                    if (!scope.dual) scope.setValue (value,0);
                    else scope.setValue (value,1);
                }

                if (scope.vertical) {
                    var offset = scope.bounds.bar.height * (value - scope.notLess) / (scope.notMore - scope.notLess);
                    scope.start.css('height',offset + 'px');
                } else {
                    var offset = scope.bounds.bar.width * (value - scope.notLess) / (scope.notMore - scope.notLess);
                    scope.start.css('width',offset + 'px');
                }
                scope.startValue= value;
            };

            scope.setStop = function (value) {

                if (value < scope.value[0]) {
                    if (!scope.dual) scope.setValue (value,0);
                    else scope.setValue (value,1);
                }

                if (scope.vertical) {
                    var offset = scope.bounds.bar.height * (value - scope.notLess) / (scope.notMore - scope.notLess);
                    scope.start.css('height',offset + 'px');
                } else {
                    var offset = scope.bounds.bar.width * (value - scope.notLess) / (scope.notMore - scope.notLess);
                    scope.stop.css({'right': 0, 'width': (scope.bounds.bar.width  - offset) + 'px'});
                }

                scope.stopValue= value;
            };

            scope.translate = function (offset, handle) {
                if (scope.vertical) {
                    var voffset = scope.bounds.bar.height - offset;
                    scope.handles[handle].css({
                        '-webkit-transform': 'translateY(' + voffset + 'px)',
                        '-moz-transform': 'translateY(' + voffset + 'px)',
                        '-ms-transform': 'translateY(' + voffset + 'px)',
                        '-o-transform': 'translateY(' + voffset + 'px)',
                        'transform': 'translateY(' + voffset + 'px)'
                   });
                   if (!scope.dual) scope.slider.css('height',offset + 'px');
                   else if (scope.relative[1] && scope.relative[0]) {
                       var height = parseInt ((scope.relative[1] - scope.relative[0]) *  scope.bounds.bar.height);
                       var start  = parseInt ((scope.relative[0] *  scope.bounds.bar.height));
                       scope.slider.css ({'bottom': start+'px','height': height + 'px'})
                   }
                } else {
                    scope.handles[handle].css({
                        '-webkit-transform': 'translateX(' + offset + 'px)',
                        '-moz-transform': 'translateX(' + offset + 'px)',
                        '-ms-transform': 'translateX(' + offset + 'px)',
                        '-o-transform': 'translateX(' + offset + 'px)',
                        'transform': 'translateX(' + offset + 'px)'
                    });
                    if (!scope.dual) scope.slider.css('width',offset + 'px');
                    else if (scope.relative[1] && scope.relative[0]) {
                        var width = parseInt ((scope.relative[1] - scope.relative[0]) *  scope.bounds.bar.width);
                        var start = parseInt (scope.relative[0] *  scope.bounds.bar.width);
                        scope.slider.css ({'left': start+'px','width': width + 'px'})
                    }
                }
            };

            // position handle on the bar depending a given value
            scope.setValue = function (value , handle) {
                var offset;

                // if value did not change ignore
                if (value === scope.value[handle]) return;

                if (value === undefined)   value=0;
                if (value > scope.notMore) value=scope.notMore;
                if (value < scope.notLess) value=scope.notLess;

                if (scope.vertical) {
                    console.log ("value=%d not less=%d", value, scope.notLess)
                    scope.relative[handle] = (value - scope.notLess) / (scope.notMore - scope.notLess);
                    console.log ("scope.relative[handle]=%s (value - scope.notLess)=%s (scope.notMore - scope.notLess)=%s", scope.relative[handle], (value - scope.notLess), (scope.notMore - scope.notLess))
                    if (handle ===0) offset = (scope.relative[handle] * scope.bounds.bar.height) + scope.bounds.handles[handle].height;
                    if (handle ===1) offset = (scope.relative[handle] * scope.bounds.bar.height);
                } else {
                    scope.relative[handle] = (value - scope.notLess) / (scope.notMore - scope.notLess);
                    offset = scope.relative[handle] *  scope.bounds.bar.width;
                }

                scope.translate (offset,handle);
                scope.value[handle] = value;

                if (scope.displays[handle]) {
                    if (scope.formatter) scope.displays[handle].html (scope.formatter (value, scope.sliderid));
                    else scope.display.html (value);
                }
            };


            // Minimal keystroke handling to close picker with ESC [scope.active is current handle index]
            scope.keydown=  function(e){

                switch(e.keyCode){
                    case 39: // Right
                    case 38: // up
                         if (scope.bystep > 0) scope.$apply(scope.setValue ((scope.value[scope.active]+scope.bystep), scope.active));
                         if (scope.bystep < 0) scope.$apply(scope.setValue ((scope.value[scope.active]+(1 / Math.pow(10, scope.bystep*-1))),scope.active));
                         break;
                    case 37: // left
                    case 40: // down
                        if (scope.bystep > 0) scope.$apply(scope.setValue ((scope.value[scope.active] - scope.bystep), scope.active));
                        if (scope.bystep < 0) scope.$apply(scope.setValue ((scope.value[scope.active] - (1 / Math.pow(10, scope.bystep*-1))),scope.active));
                        break;
                    case 27: // esc
                        scope.handles[scope.active][0].blur();
                }
            };

            scope.moveHandle = function (handle, clientX, clientY) {
                var offset;
                if (scope.vertical) {
                    offset = scope.bounds.bar.bottom - clientY;
                    if (offset > scope.bounds.bar.height) offset = scope.bounds.bar.height;
                    if (offset < scope.bounds.handles[handle].height) offset = scope.bounds.handles[handle].height;
                } else {
                    offset = clientX - scope.bounds.bar.left;
                    if (offset + scope.bounds.handles[handle].width > scope.bounds.bar.width) offset = scope.bounds.bar.width - scope.bounds.handles[handle].width;
                }

                if (offset < 0) offset = 0;

                scope.getValue(offset, handle);

                // prevent dual handle to cross
                if (scope.dual && scope.value [0] > scope.value[1]) {
                    if (handle === 0) scope.setValue (scope.value[0] , 1);
                    else scope.setValue(scope.value[1],0);
                }
            };


            scope.focusCB = function (inside) {
                if (inside) {
                    $document.on('keypress',scope.keydown);
                } else {
                    $document.unbind('keypress',scope.keydown);
                }
            };

            // bar was touch let move handle to this point
            scope.touchBarCB = function (event) {
                var handle=0;
                var relative;
                var touches = event.changedTouches;
                var oldvalue = scope.value[handle];

                event.preventDefault();

                // if we have two handles select closest one from touch point
                if (scope.dual) {
                    if (scope.vertical) relative = (touches[0].pageY - scope.bounds.bar.bottom) / scope.bounds.bar.height;
                    else relative= (touches[0].pageX - scope.bounds.bar.left) / scope.bounds.bar.width;

                    var distance0 = Math.abs(relative - scope.relative[0]);
                    var distance1 = Math.abs(relative - scope.relative[1]);
                    if (distance1 < distance0) handle=1;
                }

                // move handle to new place
                scope.moveHandle (handle,touches[0].pageX, touches[0].pageY);

                if (scope.callback && oldvalue !== scope.value[handle]) scope.callback (scope.ngModel, scope.sliderid);
            };

            // handle was touch and drag
            scope.touchHandleCB = function (touchevt, handle) {
                var oldvalue = scope.value[handle];

                touchevt.preventDefault();
                $document.on('touchmove',touchmove);
                $document.on('touchend' ,touchend);
                element.unbind('touchstart', scope.touchBarCB);

                function touchmove(event) {
                    event.preventDefault();
                    var touches = event.changedTouches;
                    for (var idx = 0; idx < touches.length; idx++) {
                        scope.moveHandle (handle,touches[idx].pageX, touches[idx].pageY);
                    }
                }

                function touchend(event) {
                   $document.unbind('touchmove',touchmove);
                   $document.unbind('touchend' ,touchend);
                   element.on('touchstart', scope.touchBarCB);

                    // if value change notify application callback
                    if (scope.callback && oldvalue !== scope.value[handle]) scope.callback (scope.ngModel, scope.sliderid);
                }
            };

            scope.handleCB = function (clickevent, handle) {

                var oldvalue = scope.value[handle];
                // register mouse event to track handle
                clickevent.preventDefault();

                $document.on('mousemove',mousemove);
                $document.on('mouseup', mouseup);
                scope.handles[handle][0].focus();
                scope.active=handle;

                // slider handle is moving
                function mousemove(event) {
                    scope.moveHandle (handle, event.clientX, event.clientY);
                }

                // mouse is up dans leave slider send resize events
                function mouseup() {
                    $document.unbind('mousemove', mousemove);
                    $document.unbind('mouseup', mouseup);

                    // if value change notify application callback
                    if (scope.callback && oldvalue !== scope.value[handle]) scope.callback (scope.ngModel, scope.sliderid);
                }
            };

            // simulate jquery find by classes capabilities [warning only return 1st elements]
            scope.find = function (select, elem) {
                var domelem;

                if (elem) domelem = elem[0].querySelector(select);
                else domelem = element[0].querySelector(select);

                var angelem = angular.element(domelem);
                return (angelem);
            };

            scope.initialSettings = function (initial) {

                var decimal_places_match_result;
                scope.value=[];  // store low/height value when two handles
                scope.relative=[];

                if (scope.precision === null) {
                    decimal_places_match_result = ('' + scope.bystep).match(/\.([\d]*)/);
                    scope.precision = decimal_places_match_result && decimal_places_match_result[1] ? decimal_places_match_result[1].length : 0;
                }

                // get components geometry
                scope.bounds = {
                    bar    : element[0].getBoundingClientRect(),
                    handles: [scope.handles[0][0].getBoundingClientRect(), scope.handles[1][0].getBoundingClientRect()]
                };

                // position handle to initial value(s)
                scope.setValue (initial[0],0);
                element.on('touchstart', scope.touchBarCB);
                scope.handles[0].on('touchstart', function(evt){scope.touchHandleCB(evt,0)});

                // this slider has two handles low/hight
                if (scope.dual) {
                    scope.handles[1].addClass('range-slider-handle');
                    scope.handles[1].on('touchstart', function(evt){scope.touchHandleCB(evt,1)});
                    scope.setValue (initial[1],1);
                }

            };

            scope.init = function () {
                // let's use a dedicated object to handle Application/Component liaison
                scope.startValue = -Infinity;
                scope.stopValue  = Infinity;
                scope.sliderid = attrs.id || "range-slide-" + parseInt (Math.random() * 1000);
                scope.bystep   = parseInt(attrs.byStep) || 1;
                scope.vertical = attrs.vertical   || false;
                scope.dual     = attrs.dualHandles|| false;
                scope.trigger_input_change= false;
                scope.notMore  = parseInt(attrs.notMore)   || 100;
                scope.notLess  = parseInt(attrs.notLess)   || 0;

                // extract initial values from attrs and parse into int
                if (!attrs.initial) {
                    scope.initial  = [scope.notLess,scope.notMore];
                } else {
                    var initial  = attrs.initial.split(',');
                    console.log ("id=%s scope initial=%s", attrs.id, parseInt (initial[0]))

                    scope.initial = [
                        initial[0] !== undefined ? parseInt (initial[0]) : scope.notLess,
                        initial[1] !== undefined ? parseInt (initial[1]) : scope.notMore
                    ];
                    console.log ("id=%s scope initial=%s", attrs.id, scope.initial)
                }

                if (scope.vertical) element.addClass("vertical-range");

                if (attrs.format) { // see angular filter ex: date|HH:mm|trailer
                    scope.format = attrs.format.split("|");
                }

                scope.handles= [scope.find('.handle-min'), scope.find('.handle-max')];

                scope.slider = scope.find('.range-slider-active-segment');
                scope.start  = scope.find('.bzm-range-slider-start');
                scope.stop   = scope.find('.bzm-range-slider-stop');
                scope.ngModel= new RangeSliderHandle (scope);

                if (attrs.displayTarget) {
                    switch (attrs.displayTarget) {
                        case 'handle' :
                        case 'handles' :
                            scope.displays = scope.handles;
                            scope.handles[0].addClass('bzm-range-slider-display');
                            if (scope.dual) scope.handles[1].addClass('bzm-range-slider-display');
                            break;
                        default:
                            scope.displays =  [$document.getElementById (attrs.displayTarget)];
                    }
                } else scope.displays=[];

                // Monitor any changes on start/stop dates.
                scope.$watch('startAt', function() {
                    if (scope.value < scope.startAt ) {
                        //scope.setValue (scope.startAt);
                    }
                    if (scope.startAt) scope.setStart (scope.startAt);
                });

                scope.$watch('stopAt' , function() {
                    if (scope.value > scope.stopAt) {
                        //scope.setValue (scope.stopAt);
                    }
                    if (scope.stopAt) scope.setStop (scope.stopAt);
                });

                // finish widget initialisation
                scope.initialSettings (scope.initial);

            };

            scope.init();
        }

    return {
        restrict: "E",    // restrict to <range-slider> HTML element name
        scope: {
            ngModel : '=',  // necessary to update internal from inside directive
            startAt : '=',  // First acceptable date
            stopAt  : '=',  // Last acceptable date
            callback: '=',  // Callback to active when a date is selected
            formatter:'='   // Callback for drag event call each time internal value changes
        },
        template: template, // html template is build from JS
        require: 'ngModel', // get access to external/internal representation
        replace: true,      // replace current directive with template while inheriting of class
        link: link          // pickadate object's methods
    };
}

console.log ("range-slider module loaded");

