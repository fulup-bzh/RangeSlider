RangeSlider for Angular & Foundation
====================================

Range Slider for Angular & Foundation5. The only real dependency outside of Angular is Foundation RangeSlider SSS

Project :
 - demo: http://breizhme.net/rangeslider/demo/
 - home: https://github.com/fulup-bzh/RangeSlider

This RangeSlider is port of: http://foundation.zurb.com/docs/components/range_slider.html


Installation
-------------

1. download & unzip source from GitHub repository:

2. copy the files
    - **dist/bzm-range-slider-min.js**
    - **dist/bzm-range-slider.css**

3. &lt;link&gt; and &lt;script&gt; them into your page 

	
Usage  <range-slider>
---------------------
```
   <range-slider
      id="my-slider-name"                     // only use as an argument to callback
      class="my-custom-class"                 // default class is bzm-range-slider
      placeholder="Track Date Selection"      // place holder for date readonly input zone

      <!-- Foundation classes -->
      class="radius"                          // check Zurn foundation doc for further info.
      class="bzm-handle-display"              // increase handle width to hold slider current value

      <!-- Angular Scope Variables -->
      callback="myCallBack"                    // $scope.myCallBack(sliderhandle) is called when ever slider handle blur
      formatter="SliderFormatCB"               // $scope.myFormatter(value, sliderid) when exist is call when ever slider handle moves. Should return external form of slider value.
      ng-model="xxxxxx"                        // Must exists. It is the angular variable model for a given slider
      start-at="ScopeVar"                      // Dynamic limitation when slider is constrains by an external componant [ex: check in/out]
      stop-at="ScopeVar"                       // Idem but for end.

      <!-- Angular Directive Attributes -->
      not-less="integer"                       // Fixed starting value for slider [default 0]
      not-more="integer"                       // Fixed end value for sliders [default 100]
      by-step="+-integer"                      // If by-step is >0 then slider use it as step-value, when negative use it for decimal precision
      display-target="handle"                  // display slider external formated value in the handle [requirer calss="bzm-handle-display"]
      dual-handles='true'                      // add a second handle to slider for min/max range
      initial='value|[start/stop]'             // slider initial value [dual-handles] may have initial values

   /></range-slider>

```
