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
define(function (require) {
    'use strict';
    var exporter = require('webIDL/InterfaceExporter'),
        MIDI;

    //Interface Prototype Object
    function MIDIAccess() {
        if (MIDI === undefined) {
            MIDI = require('interfaces/MIDI');
        }
    }

    //Check that no one has stolen our methods
    function checkAccess(object) {
        if (!(object instanceof MIDIAccess)) {
            throw new TypeError('Illegal invocation');
        }
    }
    MIDIAccess.prototype.getInputs = function () {
        checkAccess(this);
        return MIDI.inputs;
    };
    MIDIAccess.prototype.getOutputs = function () {
        checkAccess(this);
        return MIDI.outputs;
    };
    MIDIAccess.prototype.getPortById = function (id) {
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