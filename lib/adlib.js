/*jshint proto:false, devel:true, forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:false, strict:true, undef:true, unused:true, curly:true, browser:true, indent:2, maxerr:50 */
window.require.config({
  baseUrl: '/lib/'
});
window.require(['polyfills/performance.now', 'interfaces/requestMIDIAccess']);
