let audios = ["old.mp3", "audio2.mp3"];

let r = Math.floor(Math.random() * audios.length);

let audioLink = audios[r];

var audio = new Audio(audioLink);
audio.preload = 'auto';

// You can listen for the 'canplaythrough' event to know when the audio file has loaded
audio.addEventListener('canplaythrough', function () {
    console.log('Audio loaded and ready to play');
});