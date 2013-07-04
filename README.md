# adlib.js

Prototype reference implementaiton of [W3C Web MIDI API](http://webaudio.github.io/web-midi-api/)
. 

## Warning

**This is an unsupported component with an indefinite lifetime. This should be used for evaluation purposes 
only and should not be used for production level applications.**

## Getting Started

### In the browser

Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/marcoscaceres/adlib/master/dist/adlib.min.js
[max]: https://raw.github.com/marcoscaceres/adlib/master/dist/adlib.js

In your web page:

```html
<script src="libs/require.js"></script>
<script src="dist/adlib.min.js"></script>
```

## Documentation
[W3C Web MIDI API](http://webaudio.github.io/web-midi-api/)

## Examples
Play a note on an output. 

```html
<script>
function success(access){
	//we have access, lets play
	var output = access.getOutputs()[0];
	if(output){
		output.send([0x91, 0x40, 0x5f]);
		output.send([0x91, 0x40, 0x0], performance.now() + 200);
		return;
	}
	//otherwise, no outputs :( 
	fail(new Error("no MIDI outputs"));
}

function fail(e){
	console.log("something went wrong: " + e)
}
window.navigator.requestMIDIAccess(success, fail);
</script>
```


## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](http://gruntjs.com/).

_Also, please don't edit files in the "dist" subdirectory as they are generated via grunt. You'll find source code in the "lib" subdirectory!_

## Release History
_(Nothing yet)_

## License
Copyright (c) 2013 Marcos Caceres  
Licensed under the MIT license.
