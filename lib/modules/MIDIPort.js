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
 * interface MIDIPort {
 *     readonly attribute DOMString    id;
 *     readonly attribute DOMString?   manufacturer;
 *     readonly attribute DOMString?   name;
 *     readonly attribute MIDIPortType type;
 *     readonly attribute DOMString?   version;
 *     serializer = {id, manufacturer, name, type, version};
 * }
 *
 * This script uses a djb2 hashing function, copied from:
 * //http://erlycoder.com/49/javascript-hash-functions-to-convert-string-into-integer-hash-
 **/

window.define(function (require) {
    'use strict';
    var exporter = require("InterfaceExporter");
    function MIDIPort(name, type, version, manufacturer) {
        var id = hash(String(name) + type),
            attributes = {
                id: {
                    get: function () {
                        return id;
                    }
                },
                type: {
                    get: function () {
                        return type;
                    }
                },
                version: {
                    get: function () {
                        return version;
                    }
                },
                name: {
                    get: function () {
                        return name;
                    }
                }
            };
        //MIDIPortType are "input" and "output"
        if (type !== 'input' && type !== 'output') {
            throw new TypeError('type argument did not match a valid MIDIPortType');
        }
        //stringify if supplied, nullify if not supplied as per WebIDL
        name = (name) ? String(name) : null;
        manufacturer = (manufacturer) ? String(manufacturer) : null;
        version = (version) ? String(version) : null;
        Object.defineProperties(this, attributes);
    }

    //Not officially in in spec.
    function hash(str) {
        var result = 5381;
        for (var char, i = 0, l = str.length; i < l; i++) {
            char = str.charCodeAt(i);
            result = ((result << 5) + result) + char;
        }
        return String(result);
    }

    MIDIPort.prototype.toJSON = function toJSON() {
        if (!(this instanceof MIDIPort)) {
            throw new TypeError('Illegal invocation');
        }
        var info = {
            type: this.type,
            name: this.name,
            manufacturer: this.manufacturer,
            version: this.version,
            id: this.id
        };
        return JSON.stringify(info);
    };
    //expose on Window object
    exporter(MIDIPort, 'MIDIPort');
    return MIDIPort;
});
