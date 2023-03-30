let audioLink = "old.mp3";

var audio = new Audio(audioLink);
audio.preload = 'auto';

// You can listen for the 'canplaythrough' event to know when the audio file has loaded
audio.addEventListener('canplaythrough', function () {
    console.log('Audio loaded and ready to play');
});