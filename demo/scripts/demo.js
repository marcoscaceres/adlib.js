(function () {
    var midi = null,
        input = null,
        output = null,
        log = document.getElementById("log"),
        record = [];
        
    window.require.config({
      baseUrl: '/lib/modules'
    });
    window.require(['performance.now', 'requestMIDIAccess']);

    document.querySelector("#enable").onclick = function enable() {
        log.innerHTML = "Starting up MIDI...\n";
        navigator.requestMIDIAccess(success, failure);
    };

    document.querySelector("#playRandomSound").onclick = function playRandomSound() {
        var rand = Math.floor(Math.random() * 127);
        //Chan 1 Program Change (random sound)
        play([0xC0, rand, 0]);
        //Chan 1 Note on, note, velocity
        play([0x90, 60, 0x7f]);
        //Chan 1 Note off
        play([0x80, 60, 0], window.performance.now() + 500);
    };

    document.querySelector("#playRandomNote").onclick = function playRandomNote() {
        var rand = Math.floor(Math.random() * 128);
        play([0x90, rand, 0x5f]);
        play([0x90, rand, 0x0], window.performance.now() + 500);
    };

    document.querySelector("#replay").onclick = function replay() {
        if (record.length === 0) {
            return;
        }
        var start = window.performance.now() - record[0].stamp;
        record.forEach(function (packet) {
            output.send(packet.data, packet.stamp + start);
        });
    };

    document.querySelector("#clearData").onclick = function clearData() {
        record = [];
        output.send([0x80, 0, 0]);
    };

    function play(array, timestamp) {
        var html = "Sending:",
            packet = null;
        if (!(output)) {
            return;
        }
        packet = {
            data: array,
            stamp: timestamp || window.performance.now()
        };
        record.push(packet);
        output.send(array, timestamp);
        for (var i = 0, l = array.length; i < l; i++) {
            html += " 0x" + array[i].toString(16);
        }

        //log.innerHTML += (html + " timestamp:" + packet.stamp + "\n"); 
        //log.scrollTop = log.scrollHeight;
    }

    function handleMIDIMessage(ev) {
        // testing - just reflect.
        log.innerHTML += "Message: " + ev.data.length + " bytes, timestamp: " + ev.receivedTime;
        if (ev.data.length === 3) {
            log.innerHTML += " 0x" + ev.data[0].toString(16) + " 0x" + ev.data[1].toString(16) + " 0x" + ev.data[2].toString(16);
        }
        log.innerHTML += "\n";
        if (output) {
            play(ev.data);
        }

    }

    function success(midiAccess) {
        var outputs = midiAccess.getOutputs(),
            inputs = midiAccess.getInputs(),
            i = 0;
        window.midi = midi = midiAccess;
        log.innerHTML += "MIDI ready!\n";
        log.innerHTML += inputs.length + " inputs.\n";
        if (inputs.length > 0) {
            for (i = 0; i < inputs.length; i++) {
                log.innerHTML += i + ": " + inputs[i].name + "\n";
            }
            input = inputs[0];
            input.addEventListener("message", handleMIDIMessage);
            log.innerHTML += "Listening to: " + input.name + " \n";
        }

        log.innerHTML += outputs.length + " outputs:\n";
        for (i = 0; i < outputs.length; i++) {
            log.innerHTML += i + ": " + outputs[i].name + "\n";
        }
        if (outputs.length) {
            output = outputs[0];
        }
        //reset
        output.send([0x80, 0, 0]);
        enableFunctionality();
    }

    function enableFunctionality() {
        var buttons = document.querySelectorAll("button");
        for (var i = buttons.length - 1; i >= 0; i--) {
            buttons[i].disabled = false;
        }
    }

    function failure(error) {
        console.log(error.message);
    }
}());