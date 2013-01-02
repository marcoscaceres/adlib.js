/*jshint proto:false, devel:true, forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:false, strict:true, undef:true, unused:true, curly:true, browser:true, indent:4, maxerr:50 */
/**
 * Web MIDI API - Prollyfill
 * https://dvcs.w3.org/hg/audio/raw-file/tip/midi/specification.html
 * creates instances of the Jazz plugin (http://jazz-soft.net/)
 * The plugin exposes the following methods (v1.2):
 *   MidiInClose()
 *   MidiInList()
 *   MidiInOpen()
 *   MidiOut()
 *   MidiOutClose()
 *   MidiOutList()
 *   MidiOutLong()
 *   MidiOutOpen()
 *   Support()
 *   Time()
 *   version
 * See also: http://jazz-soft.net/doc/Jazz-Plugin/reference.html
 * Copyright (c) 2012 Marcos Caceres
 * Licensed under the MIT license.
 **/
window.define(function (require) {
    'use strict';
    var MIDIInput = require('interfaces/MIDIInput'),
        MIDIOutput = require('interfaces/MIDIOutput'),
        MIDIAccess = require('interfaces/MIDIAccess'),
        midi = {},
        dispatcher = document.createElement('x-eventDispatcher'),
        plugin = null,
        permitted = null,
        ports = {
            inputs: null,
            outputs: null
        },
        lastUsedPort = '',
        properties = {
            time: {
                get: function () {
                    return plugin.Time();
                }
            },
            requestAccess: {
                value: null
            },
            inputs: {
                get: function () {
                    return ports.inputs.slice(0);
                }
            },
            outputs: {
                get: function () {
                    return ports.outputs.slice(0);
                }
            },
            midiInOpen: {
                value: function (name, callback) {
                    //TODO: check if authorized
                    plugin.MidiInOpen(name, callback);
                }
            },
            midiOutLong: {
                value: function (data, name) {
                    //try to send to the currently open port
                    if (name !== lastUsedPort) {
                        //try to open a different port
                        if (plugin.MidiOutOpen(name) !== name) {
                            //could not open the new port
                            return;
                        }
                    }
                    plugin.MidiOutLong(data);
                    lastUsedPort = name;
                }
            }
        };

    function checkPermission(successCB, errorCB) {
        //going to ask permission for the first time
        var request;
        if (permitted === null) {
            request = function () {
                dispatcher.removeEventListener('allowed', request);
                successCB(new MIDIAccess());
            };
            dispatcher.addEventListener('allowed', request);
            if (errorCB && typeof errorCB === 'function') {
                dispatcher.addEventListener('denied', function (e) {
                    errorCB(new Error(e.data));
                });
            }
            requestPermission();
            return;
        }
        if (permitted === true) {
            successCB(new MIDIAccess());
            return;
        }
        errorCB(new Error('SecurityError'));
    }

    function createPorts(list, type) {
        var ports = [];
        list.forEach(function (name) {
            var port = (type === 'input') ? new MIDIInput(String(name)) : new MIDIOutput(String(name));
            ports.push(port);
        });
        return ports;
    }

    //loads the Jazz plugin by creating an <object>
    function loadPlugin() {
        var elemId = '_Jazz' + Math.random(),
            objElem = document.createElement('object'),
            ev;
        objElem.id = elemId;
        objElem.type = 'audio/x-jazz';
        objElem.style = 'visibility: hidden';
        document.documentElement.appendChild(objElem);
        if (!(objElem.isJazz)) {
            ev = new window.CustomEvent('error');
            ev.data = new Error('NotSupportedError');
            dispatcher.dispatchEvent(ev);
            return null;
        }
        //Initialize
        objElem.MidiOut(0x80, 0, 0);
        return objElem;
    }

    function requestPermission() {
        var data = {
            outputs: plugin.MidiOutList(),
            inputs: plugin.MidiInList()
        },
        dict = {
            detail: data
        },
        ev = new window.CustomEvent('allowed', dict);
        dispatcher.dispatchEvent(ev);
    }
    plugin = loadPlugin();
    //once the use allows it, lets get the ports list
    dispatcher.addEventListener('allowed', function (e) {
        ports.inputs = createPorts(e.detail.inputs, 'input');
        ports.outputs = createPorts(e.detail.outputs, 'output');
    });
    properties.requestAccess.value = checkPermission;
    Object.defineProperties(midi, properties);
    return midi;
});