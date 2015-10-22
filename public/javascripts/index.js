/**
 * Created by Jihann on 2015/9/18.
 */
function query(s) {
    return document.querySelectorAll(s);
}

var lis = query(".music-list li");

for(var i = 0; i < lis.length; i++) {
    lis[i].onclick = function() {
        for(var j = 0; j < lis.length; j++) {
            lis[j].className = "";
        }
        this.className = "selected";
        loadMusic("/media/" + this.title);
    }
}

var xhr = new XMLHttpRequest();
var ac = new (window.AudioContext || window.webkitAudioContext)();
//改变音频声音大小
var gainNode = ac[ac.createGain?"createGain":"createGainNode"]();
gainNode.connect(ac.destination);

var analyser = ac.createAnalyser();
analyser.fftSize = 512;
analyser.connect(gainNode);

var source = null;
var count = 0;
function loadMusic(url) {
    var n = ++count;
    source && source[source.stop ? "stop" : "noteOff"]();
    xhr.abort();
    xhr.open("GET", url);
    xhr.responseType = "arraybuffer";
    xhr.onload = function() {
        if(n != count)return;
        ac.decodeAudioData(xhr.response, function(buffer) {
            if( n!= count)return;
            var bufferSource = ac.createBufferSource();
            bufferSource.buffer = buffer;
            bufferSource.connect(analyser);
            bufferSource[bufferSource.start ? "start" : "noteOn"](0);
            source = bufferSource;
            visualizer();
        }, function(err) {
            console.log(err);
        });
    }
    xhr.send();
}

function visualizer() {
    var arr = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(arr);
}

function changeVolume(percent) {
    gainNode.gain.value = percent * percent;
}

query("#volume")[0].onchange = function() {
    changeVolume(this.value/this.max);
}
query("#volume")[0].onchange();
