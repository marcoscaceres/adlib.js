/*jshint proto:false, devel:true, forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:false, strict:true, undef:true, unused:true, curly:true, browser:true, indent:2, maxerr:50 */
window.require.config({
  baseUrl: '/lib/modules'
});

(function() {
  'use strict';
  if ('requestMIDIAccess' in window.navigator) {
    console.warn('requestMIDIAccess already defined in navigator, aborting.');
    return;
  }

  window.require(['performance.now', 'requestMIDIAccess'], function() {

  });
}());
