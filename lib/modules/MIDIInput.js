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
 * interface MIDIInput : MIDIPort {
 *     attribute EventHandler onmessage;
 * };
 * MIDIInput implements EventTarget;
 **/

window.define(['InterfaceExporter', 'MIDIEvent', 'MIDIPort', 'MIDI'], function (exporter, MIDIEvent, MIDIPort, MIDI) {
    "use strict";
    var eventManager = new EventManager();
    //This event manager is needed to avoid exposing
    //the event dispatcher on instances of MIDIInput.
    //This is because EventTarget lives on the prototype
    //hence has no access to private variables
    //of objects up the inheritance chain
    function EventManager() {
        //The database of registered events
        var register = [];

        function registerObject(obj) {
            var dispatcher = {
                owner: obj,
                dispatcher: document.createElement('x-eventDispatcher')
            };
            register.push(dispatcher);
            return dispatcher.dispatcher;
        }

        this.getDispatcher = function (obj) {
            for (var i = register.length - 1; i >= 0; i--) {
                if (obj === register[i].owner) {
                    return register[i].dispatcher;
                }
            }
            //returns the dispatcher
            return registerObject(obj);
        };
    }

    function checkAccess(object) {
        //Check that no one has stolen the method
        if (!(object instanceof MIDIInput)) {
            throw new TypeError('Illegal invocation');
        }
    }

    function MIDIInput(name) {
        MIDIPort.call(this, name, 'input');
        var self = this,
            eventHandler = null,
            attributes = {
                onmessage: {
                    set: function (aFunction) {
                        //clear prevously set event handler
                        if (eventHandler !== null) {
                            this.removeEventListener('message', eventHandler, false);
                            eventHandler = null;
                        }
                        //check if callable
                        if (aFunction.call && typeof aFunction.call === 'function') {
                            this.addEventListener('message', aFunction, false);
                            eventHandler = aFunction;
                        }
                        return eventHandler;
                    },
                    get: function () {
                        return eventHandler;
                    },
                    enumerable: false,
                    configurable: false
                }
            };

        function messageCallback(timestamp, data) {
            var e = new MIDIEvent('message', {
                data: new Uint8Array(data),
                port: self
            });
            self.dispatchEvent(e);
        }

        Object.defineProperties(this, attributes);
        //Listen for messages
        MIDI.midiInOpen(name, messageCallback);
    }
    MIDIInput.prototype = Object.create(MIDIPort.prototype);

    //implement EventTarget
    MIDIInput.prototype.addEventListener = function (type, listener, useCapture) {
        var eventListener,
            dispatcher;
        checkAccess(this);
        dispatcher = eventManager.getDispatcher(this);
        eventListener = {
            //wrap around having to use CustomEvent, return MIDIEvent
            wrapper: function (e) {
                listener.call(this, e.detail);
            },
            listener: listener,
            type: type,
            useCapture: (useCapture) ? useCapture : false
        };
        dispatcher.listeners.push(eventListener);
        dispatcher.addEventListener(type, eventListener.wrapper, useCapture);
    };
    MIDIInput.prototype.removeEventListener = function (type, listener, useCapture) {
        var dispatcher;
        checkAccess(this);
        dispatcher = eventManager.getDispatcher(this);
        useCapture = (useCapture) ? useCapture : false;
        //because we had to wrap the listener, we now need
        //to search for it to remove it
        for (var eventListener, i = dispatcher.listeners.length - 1; i >= 0; i--) {
            eventListener = dispatcher.listeners[i];
            if (eventListener.listener === listener && eventListener.type === type && eventListener.useCapture === useCapture) {
                dispatcher.removeEventListener(type, eventListener.wrapper, useCapture);
            }
        }
    };
    MIDIInput.prototype.dispatchEvent = function (evt) {
        var dispatcher;
        checkAccess(this);
        dispatcher = eventManager.getDispatcher(this);
        dispatcher.dispatchEvent(evt);
    };
    exporter(MIDIInput, 'MIDIInput');
    return MIDIInput;
});
