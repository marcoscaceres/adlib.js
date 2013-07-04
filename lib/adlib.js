require.config({
	baseUrl: '/lib/'
});

console.warn("adlib.js is an unsupported component with an indefinite lifetime. This should be used for evaluation purposes only and should not be used for production level applications.")

require(['polyfills/performance.now', 'interfaces/requestMIDIAccess']);
