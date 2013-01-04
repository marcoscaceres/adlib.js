/**
 * performance.now()
 * Polyfill of: http://www.w3.org/TR/hr-time/
 *
 * This script implements the following interfaces:
 *
 *   typedef double DOMHighResTimeStamp;
 *
 *   partial interface Performance {
 *     DOMHighResTimeStamp now();
 *   };
 *
 * Copyright (c) 2012 Marcos Caceres
 * Licensed under the MIT license.
 **/
define(function (require) {
    'use strict';
    var exporter = require('webIDL/InterfaceExporter');

    function findNowMethod() {
        var props = {
            value: null,
            writable: true,
            enumerable: true,
            configurable: true
        };

        function relativeTo(start) {
            return function () {
                return Date.now() - start;
            };
        }
        //use the prefixed version
        function prefixedVersion(prefixedName) {
            return function () {
                return window.performance[prefixedName]();
            };
        }
        //first seach for vendor prefixed version
        for (var prefix = ['moz', 'webkit', 'opera', 'ms'], i = prefix.length, method; i >= 0; i--) {
            if ((prefix[i] + 'Now') in window.performance) {
                method = prefix[i] + 'Now';
                props.value = prefixedVersion(method);
                return props;
            }
        }
        //otherwise, try to use connectionStart
        if ('timing' in window.performance && 'connectStart' in window.performance.timing) {
            //this pretty much approximates performance.now() to the millisecond
            props.value = relativeTo(window.performance.timing.connectStart);
            return props;
        }
        //otherwise, worst case, we use Date.now()
        props.value = relativeTo(Date.now());
        return props;
    }

    function implementPerformance() {
        var performance;

        function Performance() {}
        exporter(Performance, 'Performance');
        performance = new Performance();
        if (!(window.hasOwnProperty('performance'))) {
            Object.defineProperty(window, 'performance', {
                get: function () {
                    return performance;
                }
            });
        }
    }
    //If we have no 'performance' at all, implement it
    if (!(window.hasOwnProperty('Performance')) && !(window.hasOwnProperty('performance'))) {
        implementPerformance();
        //if we only have window.performance, take its proto
    } else if (!(window.hasOwnProperty('Performance')) && (window.hasOwnProperty('performance'))) {
        window.Performance = window.performance.constructor;
    }
    //if already defined, no need to polyfill
    if (!('now' in window.performance)) {
        Object.defineProperty(window.Performance.prototype, 'now', findNowMethod());
    }
});
