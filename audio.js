var audio = new Audio('audio.mp3');
audio.preload = 'auto';

// You can listen for the 'canplaythrough' event to know when the audio file has loaded
audio.addEventListener('canplaythrough', function () {
    console.log('Audio loaded and ready to play');
});