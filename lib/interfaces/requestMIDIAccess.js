/**
 * Web MIDI API - Prollyfill
 * https://dvcs.w3.org/hg/audio/raw-file/tip/midi/specification.html
 *
 * Copyright (c) 2012 Marcos Caceres
 * Licensed under the MIT license.
 *
 * This script implements the following IDL fragment:
 *
 * partial interface Navigator {
 *   void requestMIDIAccess (SuccessCallback successCallback, optional ErrorCallback errorCallback);
 * };
 **/
define(function (require) {
    'use strict';
    var MIDI = require('interfaces/MIDI');

    function requestMIDIAccess(successCallback, errorCallback) {
        //Perform type check per WebIDL section 4.2.21. Callback function types
        if (typeof successCallback !== 'function') {
            throw new TypeError();
        }
        if (errorCallback && typeof errorCallback !== 'function') {
            throw new TypeError();
        }
        MIDI.requestAccess(successCallback, errorCallback);
    }
    requestMIDIAccess.toString = function () {
        return 'function requestMIDIAccess() { [native code] }';
    };
    //Expose the interface on navigator
    Object.defineProperty(window.navigator, 'requestMIDIAccess', {
        value: requestMIDIAccess
    });
});