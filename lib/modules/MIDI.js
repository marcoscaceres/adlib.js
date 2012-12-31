/*jshint proto:false, devel:true, forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:false, strict:true, undef:true, unused:true, curly:true, browser:true, indent:4, maxerr:50 */
/**
 * Web MIDI API - Prollyfill
 * https://dvcs.w3.org/hg/audio/raw-file/tip/midi/specification.html
 *
 * Copyright (c) 2012 Marcos Caceres
 * Licensed under the MIT license.
 **/
define(function () {
    'use strict';
    /*
    creates instances of the Jazz plugin (http://jazz-soft.net/)
    The plugin exposes the following methods (v1.2):
    MidiInClose()
    MidiInList()
    MidiInOpen()
    MidiOut()
    MidiOutClose()
    MidiOutList()
    MidiOutLong()
    MidiOutOpen()
    Support()
    Time()
    version
    See also: http://jazz-soft.net/doc/Jazz-Plugin/reference.html
    */
    function JazzPlugin () {
        var dispatcher = document.createElement('x-eventDispatcher'),
            plugin = loadPlugin(),
            permitted = null,
            inputPorts = [],
            outputPorts = [],
            interfaces = {
                time: {
                    get: function() {
                        return plugin.Time();
                    }
                },
                requestAccess: {
                    value: checkPermission
                },
                midiInList: {
                    get: function() {
                        return inputPorts;
                    }
                },
                midiOutList: {
                    get: function() {
                        return outputPorts;
                    }
                },
                midiInOpen: {
                    value: function(name, callback) {
                        //TODO: check if authorized
                        plugin.MidiInOpen(name, callback);
                    }
                },
                midiOutLong: {
                    value: function(data, name) {
                        if (plugin.MidiOutOpen(name) === name) {
                            plugin.MidiOutLong(data);
                        }
                    }
                }
            };

        function createPorts(list, type) {
            var ports = [];
            for (var i = 0, name = '', l = list.length; i < l; i++) {
                name = String(list[i]);
                ports[i] = (type === 'input') ? new constructors.MIDIInput(name) : new constructors.MIDIOutput(name);
            }
            return ports;
        }

        function checkPermission(successCB, errorCB) {
            //going to ask permission for the first time
            if (permitted === null) {
                requestPermission(plugin);
                dispatcher.addEventListener('allowed', function() {
                    successCB(new constructors.MIDIAccess());
                });
                if (errorCB && typeof errorCB === 'function') {
                    dispatcher.addEventListener('denied', function(e) {
                        errorCB(new Error(e.data));
                    });
                }
                return;
            }
            if (permitted === true) {
                successCB(new constructors.MIDIAccess());
                return;
            }
            errorCB(new Error('SecurityError'));
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
                dispatcher.dispatchEvent(e);
                return null;
            }
            //Initialize
            objElem.MidiOut(0x80, 0, 0);
            return objElem;
        }

        function requestPermission(plugin) {
            var div = document.createElement('div'),
                style = document.createElement('style'),
                okButton = document.createElement('button'),
                cancelButton = document.createElement('button'),
                id = 'dialog_' + (Math.round(Math.random() * 1000000) + 10000),
                markup = '',
                css = '';
            if (!(plugin)) {
                throw 'Jazz plugin was not Initialized. Did you install it?';
            }
            css += '#' + id + '{ ' + 'width: 60%; ' + 'box-shadow: 0px 2px 20px black; z-index: 1000;' + ' left: 20%; background-color: #aaa;' + ' padding: 3em;' + '} ' + '.hidden{ top: -' + Math.round(window.innerHeight) + 'px; -webkit-transition: all .2s ease-in;}' + '.show{top: 0px; -webkit-transition: all .2s ease-out;}';
            style.innerHTML = css;
            div.id = id;
            markup += '<div>' + '<h1>♫ MIDI ♫</h1>' + '<p>' + window.location.host + ' wants to access your MIDI devices.</p>' + '<p><strong>Input Devices:</strong> ' + plugin.MidiInList().join(', ') + '.</p>' + '<p><strong>Output Devices:</strong> ' + plugin.MidiOutList().join(', ') + '.</p>' + '</div>';
            okButton.innerHTML = 'Allow';
            okButton.onclick = function() {
                var e = new window.CustomEvent('allowed');
                div.className = 'hidden';
                permitted = true;
                e.data = {
                    inputPorts: plugin.MidiInList(),
                    outputPorts: plugin.MidiOutList()
                };
                dispatcher.dispatchEvent(e);
            };
            cancelButton.innerHTML = 'Cancel';
            cancelButton.onclick = function() {
                var e = new window.CustomEvent('denied');
                e.data = 'SecurityError';
                dispatcher.dispatchEvent(e);
                div.className = 'hidden';
                permitted = false;
            };
            div.innerHTML = markup;
            div.appendChild(okButton);
            div.appendChild(cancelButton);
            div.className = 'hidden';
            document.body.appendChild(div);
            document.head.appendChild(style);
            div.style.position = 'fixed';
            setTimeout(function() {
                div.className = 'show';
            }, 100);
            if (debug) {
                setTimeout(function() {
                    okButton.click();
                }, 500);
            }
        }
        //once we are allowed, lets get the ports list
        dispatcher.addEventListener('allowed', function(e) {
            inputPorts = createPorts(e.data.inputPorts, 'input');
            outputPorts = createPorts(e.data.outputPorts, 'output');
        });
        Object.defineProperties(this, interfaces);
    }
}(exports));
