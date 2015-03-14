/**
 * Author:  Fulup Ar Foll
 * Date:    March 2015
 * Licence: Anything until you do not complain and fix bugs by yourself
 *
 * BzmRangeSlider module only depend on Foundation RangeSlider CSS
 * https://github.com/zurb/foundation/blob/master/scss/foundation/components/_range-slider.scss
 *
 * Demo Dependencies:
 *  - mm.foundation Angular directive for Foundation http://pineconellc.github.io/angular-foundation/
 *  - ui-notification https://github.com/alexcrack/angular-ui-notification
 */

'use strict';

var opa = angular.module('BzmRangeSliderDemo', ['mm.foundation','ui-notification','bzm-range-slider']);

opa.controller('DemoController', ['$log','$scope', 'Notification', DemoController]);
function DemoController ($log, scope, Notification) {
    scope.count=0;

    console.log ("Initialisation of DemoController");

    // small helper to compute time in between two values
    scope.FormatTimeDiff = function (checkin, checkout) {
        var value;

        // if we have only one ng-model them it should be a dual handles slider
        if (checkout) value = checkout.getValue() - checkin.getValue();
        else value = checkin.getValue(1) - checkin.getValue(0);

        var hours  = parseInt (value);
        var minutes= parseInt((value%1)*60);
        if (minutes < 10) minutes= "0" + minutes;
        return hours + "h" +minutes;
    };


    // Call everything slider handle is moved should return the external view of range slider
    scope.SliderFormatCB = function (value, id) {
        var hours  = parseInt (value);
        var minutes= parseInt((value%1)*60);
        if (minutes < 10) minutes= "0" + minutes;
        //console.log ("formatter id:%s value:%d hours:%d mn:%d", id, value, hours, minutes)
        return hours + "h" +minutes;
    };


    // Called only when mouse quit the slider
    scope.SliderSelectionCB = function (slider) {

        if (scope.count++ > 1000) return; // more than 1000 mean we have a bug :)

        $log.log (scope.count, "scope.RangeSliderCB Slider=", slider);
        Notification.success ({message: scope.count+":"+slider.getId()+" ==> value=" +slider.getValue() +" view=" +slider.getView(), width: 100, delay: 10000});
    }

    // This call back handle low/height value of dual sliders
    scope.SliderDualSelectionCB = function (slider) {

        if (scope.count++ > 1000) return; // more than 1000 mean we have a bug :)

        $log.log (scope.count, "scope.RangeDualSliderCB Slider=", slider);
        Notification.success ({message: scope.count+":"+slider.getId()+" ==> Low=" +slider.getValue(0) +" Height=" + slider.getValue(1) +" view=" +slider.getView(0) + "/" + slider.getView(1), width: 100, delay: 10000});
    }


};

console.log ("range-slider-Demo-App Loaded");