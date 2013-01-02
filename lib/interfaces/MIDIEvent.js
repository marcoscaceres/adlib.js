/*jshint proto:false, devel:true, forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:false, strict:true, undef:true, unused:true, curly:true, browser:true, indent:4, maxerr:50 */
/**
 * Web MIDI API - Prollyfill
 * https://dvcs.w3.org/hg/audio/raw-file/tip/midi/specification.html
 *
 * Copyright (c) 2012 Marcos Caceres
 * Licensed under the MIT license.
 *
 * This script implements the following IDL fragment:
 *
 * [Constructor(DOMString type, optional MIDIMessageEventInit eventInitDict)]
 * interface MIDIEvent : Event {
 *     readonly attribute double      receivedTime;
 *     readonly attribute Uint8Array  data;
 *     readonly attribute MIDIPort    port;
 * };
 * dictionary MIDIMessageEventInit : EventInit {
 *   any data;
 *   MIDIPort port;
 * };
 **/
window.define(function (require) {
    'use strict';
    var exporter = require('webIDL/InterfaceExporter');

    function MIDIEvent(type, dict) {
        var receivedTime = window.performance.now(),
            //we exploit the detail object to get the real event later
            attributes = {
                receivedTime: {
                    get: function () {
                        return receivedTime;
                    }
                },
                data: {
                    get: function () {
                        return dict.data;
                    }
                },
                port: {
                    get: function () {
                        return dict.port;
                    }
                }
            };
        this.__proto__.__proto__ = new window.Event(type);
        Object.defineProperties(this, attributes);
        return new window.CustomEvent(type, {
            detail: this
        });
    }

    MIDIEvent.prototype = Object.create(window.Event.prototype);
    exporter(MIDIEvent, 'MIDIEvent');
    return MIDIEvent;
});