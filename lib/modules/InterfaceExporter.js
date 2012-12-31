/*jshint proto:false, devel:true, forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:false, strict:true, undef:true, unused:true, curly:true, browser:true, indent:4, maxerr:50 */
/**
 * InterfaceExporter.js
 * Exports interfaces to global scope in a manner that conforms to WebIDL.
 * Copyright (c) 2012 Marcos Caceres
 * Licensed under the MIT license.
 **/
window.define(function () {
    'use strict';
    function exportInterfaceObject(interfaceProto, identifier) {
        var functionBody = 'return function ' + identifier + '(){throw new TypeError(\'DOM object constructor cannot be called as a function\')}',
            interfaceObject = new Function(functionBody)(),
            toString = toStringMaker(identifier),
            protoProps = {
                writable: false,
                enumerable: false,
                configurable: false
            };

        //emulate native code toString()
        function toStringMaker(name) {
            return function () {
                return 'function ' + name + '() { [native code] }';
            };
        }

        interfaceObject.prototype = interfaceProto.prototype;
        Object.defineProperty(interfaceObject, 'prototype', protoProps);

        interfaceProto.prototype.constructor = interfaceObject;
        Object.defineProperty(interfaceProto.prototype, 'constructor', {enumerable: false});

        //prevents Empty() function as being the prototype
        interfaceObject.__proto__ = Object.create({});
        interfaceProto.__proto__ = Object.create({});

        //replace toString with a "native" looking one
        interfaceProto.toString = interfaceObject.toString = toString;

        //Expose on global object
        Object.defineProperty(window, identifier, {
            value: interfaceObject
        });
    }
    return exportInterfaceObject;
});
