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
 * interface MIDIAccess {
 *     sequence<MIDIPort> getInputs();
 *     sequence<MIDIPort> getOutputs();
 *     MIDIPort           getPortById(DOMString id);
 * };
 **/
window.define(['InterfaceExporter', 'MIDI'], function(exporter, MIDI) {
    'use strict';

    //Interface Prototype Object
    function MIDIAccess() {}

    //Check that no one has stolen our methods
    function checkAccess(object) {
        if (!(object instanceof MIDIAccess)) {
            throw new TypeError('Illegal invocation');
        }
    }

    MIDIAccess.prototype.getInputs = function() {
        checkAccess(this);
        return MIDI.midiInList.slice(0);
    };
    MIDIAccess.prototype.getOutputs = function() {
        checkAccess(this);
        return MIDI.midiOutList.slice(0);
    };
    MIDIAccess.prototype.getPortById = function(id) {
        var ports;
        checkAccess(this);
        ports = this.getInputs().concat(this.getOutputs());
        id = String(id);
        for (var i = 0, l = ports.length; i < l; i++) {
            if (ports[i].id === id) {
                return ports[i];
            }
        }
        return null;
    };

    //expose on Window object
    exporter(MIDIAccess, 'MIDIAccess');
    return MIDIAccess;
});
