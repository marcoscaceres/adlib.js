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
 * interface MIDIOutput : MIDIPort {
 *   void send (any data, optional double? timestamp);
 * };
 **/
window.define(
    function (require) {
    'use strict';
    var exporter = require('InterfaceExporter'),
        MIDIPort = require('MIDIPort'),
        MIDI; //requiring would form a circular dependency :(

    //Set up prototype interface object and inheritance chain
    function MIDIOutput(name) {
        MIDIPort.call(this, name, 'output');

        //now is a good time to load in the MIDI depedency
        if (MIDI === undefined) {
            //require lookup is expensive
            MIDI = require('MIDI');
        }
    }
    MIDIOutput.prototype = Object.create(MIDIPort.prototype);

    //void send (any data, optional double? timestamp);
    MIDIOutput.prototype.send = function send(data, timestamp) {
        if (!this instanceof MIDIOutput) {
            throw new TypeError('Illegal invocation');
        }
        //TODO: implement proper type check per WebIDL
        if (!(data instanceof Uint8Array)) {
            data = new Uint8Array(data);
        }
        if ((typeof timestamp) !== 'undefined') {
            //WebIDl double checks (4.2.14. double)
            //1. Let x be ToNumber(V).
            timestamp = Number(timestamp);
            //2. If x is NaN, +Infinity or −Infinity, then throw a TypeError.
            if (isNaN(timestamp) || timestamp === +Infinity || timestamp === -Infinity) {
                throw new TypeError();
            }
        }
        return sendToMidi(this, data, timestamp);
    };

    function sendToMidi(port, data, timestamp) {
        var delay;
        if (data.length === 0) {
            return false;
        }
        delay = (timestamp) ? Math.floor(timestamp - window.performance.now()) : 0;
        if (delay > 0) {
            window.setTimeout(function () {
                sendToMidi(port, data);
            }, delay);
        } else {
            MIDI.midiOutLong(data, port.name);
        }
        return true;
    }
    exporter(MIDIOutput, 'MIDIOutput');
    return MIDIOutput;
});