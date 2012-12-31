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

window.define(['MIDIInput', 'MIDIOutput', 'MIDIAccess'], function (MIDIInput, MIDIOutput, MIDIAccess) {
    'use strict';
    var dispatcher = document.createElement('x-eventDispatcher');

    function JazzPlugin() {
        var plugin = loadPlugin(),
            permitted = null,
            inputPorts = [],
            outputPorts = [],
            properties = {
                time: {
                    get: function () {
                        return plugin.Time();
                    }
                },
                requestAccess: {
                    value: checkPermission
                },
                midiInList: {
                    get: function () {
                        return inputPorts;
                    }
                },
                midiOutList: {
                    get: function () {
                        return outputPorts;
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
                        if (plugin.MidiOutOpen(name) === name) {
                            plugin.MidiOutLong(data);
                        }
                    }
                }
            };

        function checkPermission(successCB, errorCB) {
            //going to ask permission for the first time
            if (permitted === null) {
                requestPermission(plugin);
                dispatcher.addEventListener('allowed', function () {
                    successCB(new MIDIAccess());
                });
                if (errorCB && typeof errorCB === 'function') {
                    dispatcher.addEventListener('denied', function (e) {
                        errorCB(new Error(e.data));
                    });
                }
                return;
            }
            if (permitted === true) {
                successCB(new MIDIAccess());
                return;
            }
            errorCB(new Error('SecurityError'));
        }

        //once we are allowed, lets get the ports list
        dispatcher.addEventListener('allowed', function (e) {
            inputPorts = createPorts(e.data.inputPorts, 'input');
            outputPorts = createPorts(e.data.outputPorts, 'output');
        });
        Object.defineProperties(this, properties);
    }

    function createPorts(list, type) {
        var ports = [];
        for (var i = 0, name = '', l = list.length; i < l; i++) {
            name = String(list[i]);
            ports[i] = (type === 'input') ? new MIDIInput(name) : new MIDIOutput(name);
        }
        return ports;
    }

    //loads the Jazz plugin by creating an <object>
    function loadPlugin() {
        var elemId = '_Jazz' + Math.random(),
            objElem = document.createElement('object'),
            ev;
        objElem.id = elemId;
        objElem.type = 'audio/x-jazz';
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
        var ev = new window.CustomEvent('allowed');
        dispatcher.dispatchEvent(ev);
    }
    return new JazzPlugin();
});
