

let date = new Date();

let formatedDate = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();



let kohet = [];

let audioSTATUS = localStorage.getItem("audio") ?? "true";
let clockSTATUS = localStorage.getItem("clock") ?? "true";

let clock = false;

let audioPlay;
let IMG;

let updated = false;


if (audioSTATUS == "true") {
    document.getElementById("audio").innerHTML = `<i class="fa-solid fa-volume-high"></i>`;
    audioPlay = true;
} else {
    document.getElementById("audio").innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
    audioPlay = false;

}
if (clockSTATUS == "true") {
    document.getElementById("clock").innerHTML = `<i class="fa-solid fa-user-clock"></i>`;
    clock = true;
} else {
    let m = new Date();
    let month = m.getMonth() + 1;

    if (month == 3) {
        document.getElementById("clock").innerHTML = '<i class="fa-solid fa-user-plus"></i>';
    } else {
        document.getElementById("clock").innerHTML = '<i class="fa-solid fa-user-minus"></i>';
    }
    clock = false;
}

getPrayerTimes();

function getPrayerTimes() {
    var timestamp = Math.floor(Date.now() / 1000);


    var hadithUrl = "https://onehadith.org";
    var hadithfUrl = hadithUrl + "/api/random";
    var hadith_url = geturl(hadithfUrl, { lan: "al" });
    fetch(hadith_url).then((response) => response.json()).then((data) => {
        document.getElementById("hadith").innerHTML = data.hadith + "<br>" + data.grade;
        let image = "//onehadith.org" + data.image;
        IMG = image;
        document.getElementById("main").style.backgroundImage = `url(${image})`;
    });


    let url = `https://onehadith.org/api/random?lan=al&country=XK&timestamp=${timestamp}`;

    fetch(url).then((response) => response.json()).then((data) => {

        let imsaku = data.timings.imsak;
        let sabahu = add30Minutes(imsaku);
        let dreka = data.timings.dhuhr;
        let ikindia = data.timings.asr;
        let akshami = data.timings.maghrib;
        let jacia = data.timings.isha;
        kohet.push(imsaku);
        kohet.push(sabahu);
        kohet.push(dreka);
        kohet.push(ikindia);
        kohet.push(akshami);
        kohet.push(jacia);

        kohet = kohet.map(time => time + ":00");

        let tt = new Date();

        let month = tt.getMonth() + 1;

        value = 0;

        if (month == 3) {
            value = 1;
        } else if (month == 10) {
            value = -1;
        } else {
            value = 0;
        }

        if (clock == false) {
            kohet = updateTimes(kohet, value);
        }
        document.getElementById("imsaku").innerText = "Imsaku: " + kohet[0].removeSeconds();
        document.getElementById("sabahu").innerText = "Sabahu: " + kohet[1].removeSeconds();
        document.getElementById("dreka").innerText = "Dreka: " + kohet[2].removeSeconds();
        document.getElementById("ikindia").innerText = "Ikindia: " + kohet[3].removeSeconds();
        document.getElementById("akshami").innerText = "Akshami: " + kohet[4].removeSeconds();
        document.getElementById("jacia").innerText = "Jacia: " + kohet[5].removeSeconds();


        document.getElementById("timeout").innerText = getTimeLeft(kohet);
        updated = true;
    });



}

function updateTimes(times, delta = 1) {
    if (delta == 0) {
        return times;
    }
    return times.map(time => {
        const [hour, minute, second] = time.split(":").map(parseFloat);
        const date = new Date(0, 0, 0, hour, minute, second);
        date.setHours(date.getHours() + delta);
        return date.toTimeString().slice(0, 8);
    });
}

function getTime() {
    let DATE = new Date();
    let hour = DATE.getHours();
    let minutes = DATE.getMinutes();
    let seconds = DATE.getSeconds();
    let ms = DATE.getMilliseconds();

    if (hour < 10) {
        hour = "0" + hour;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }

    let formatedTime = `${hour}:${minutes}:${seconds}`;
    return formatedTime;
}



function geturl(url, data) {
    url += "?";
    for (const [key, value] of Object.entries(data)) {
        if (value != null) {
            url += key + "=" + value + "&";
        }
    }
    return url.slice(0, -1);
}
function getTimeLeft(times) {
    // Get current time
    const now = new Date();
    const currentTimestamp = now.getTime();

    // Loop through times to find next one
    for (let i = 0; i < times.length; i++) {
        const [hour, minute, second] = times[i].split(':');

        // Create a Date object for the time in the array
        const timeInArray = new Date();
        timeInArray.setHours(hour, minute, second);
        const timeInArrayTimestamp = timeInArray.getTime();

        // Check if time has already passed
        if (currentTimestamp >= timeInArrayTimestamp) {
            continue;
        }

        // Calculate time left
        const timeLeft = Math.floor((timeInArrayTimestamp - currentTimestamp) / 1000);
        let hoursLeft = Math.floor(timeLeft / 3600);
        let minutesLeft = Math.floor((timeLeft % 3600) / 60);
        let secondsLeft = timeLeft % 60;
        if (hoursLeft < 10) {
            hoursLeft = "0" + hoursLeft;
        }
        if (minutesLeft < 10) {
            minutesLeft = "0" + minutesLeft;
        }
        if (secondsLeft < 10) {
            secondsLeft = "0" + secondsLeft;
        }
        if (timeLeft == 0) {
            soundEffect(kohetText[i]);
            return "Koha për tu falur!";
        }
        let text = `${kohetText[i]}: ${hoursLeft}:${minutesLeft}:${secondsLeft}`;
        if (containsPattern(text)) {
            text = "Koha për tu falur!";
        }
        return text;
    }

    // If no times left, say good night
    return 'Natën e mirë!';
}

let kohetText = ["Imsaku", "Sabahu", "Dreka", "Ikindia", "Akshami", "Jacia"];

function containsPattern(str) {
    return /0-1/.test(str);
}

function add30Minutes(time) {
    // Split the time string into hours and minutes
    let [hours, minutes] = time.split(":");

    // Convert the hours and minutes to numbers
    let hoursNum = parseInt(hours);
    let minutesNum = parseInt(minutes);

    // Add 30 minutes to the minutes
    let newMinutes = minutesNum + 30;

    // Check if we need to carry over an hour
    let newHours = hoursNum;
    if (newMinutes >= 60) {
        newHours += 1;
        newMinutes -= 60;
    }

    // Format the new time string
    let newTime = `${newHours.toString().padStart(2, "0")}:${newMinutes.toString().padStart(2, "0")}`;

    // Return the new time
    return newTime;
}

let audioCounter = 0;


function soundEffect(t1) {
    audioCounter++;
    if (audioCounter > 1) {
        //
    } else if (audioCounter == 1) {
        if (audioSTATUS) {
            audio.play();

        }
        audio.addEventListener('ended', function () {
            // code to be executed when audio has ended playing
            audioCounter = 0;
        });

        document.getElementById("effect").classList.add("prayer-time");

        setTimeout(() => {
            document.getElementById("effect").classList.remove("prayer-time");
        }, 10000)

        let notify = new Notification(`Sapo ka hyrë ${t1 ?? "koha për tu falur"}`, {
            body: "Namazi është obligim për besimtarët në kohë të caktuar. [4:103]",
            icon: IMG,
            requireInteraction: true,
            vibrate: [200, 100, 200]
        });
    } else {
        console.log("Audio status unchanged");
    }
}

function audioChange() {
    if (audioSTATUS == "false") {
        localStorage.setItem("audio", "true");
        audioSTATUS = localStorage.getItem("audio")
        document.getElementById("audio").innerHTML = '<i class="fa-solid fa-volume-high"></i>';
    } else {
        localStorage.setItem("audio", "false");
        audioSTATUS = localStorage.getItem("audio")
        document.getElementById("audio").innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
    }
}

function clockChange() {
    if (clockSTATUS == "true") {
        localStorage.setItem("clock", "false");
        clockSTATUS = localStorage.getItem("clock")
        document.getElementById("clock").innerHTML = '<i class="fa-solid fa-user-plus"></i>';
        location.reload();
    } else {
        document.getElementById("clock").innerHTML = '<i class="fa-solid fa-user-clock"></i>';
        localStorage.setItem("clock", "true");
        clockSTATUS = localStorage.getItem("clock");
        location.reload();
    }
}

String.prototype.removeSeconds = function () {
    return this.slice(0, -3);
};


if (!("Notification" in window)) {
    // Check if the browser supports notifications
    //alert("This browser does not support desktop notification");
} else if (Notification.permission === "granted") {
    // Check whether notification permissions have already been granted;
    // if so, create a notification
    // ...
} else if (Notification.permission !== "denied") {
    // We need to ask the user for permission
    Notification.requestPermission().then((permission) => {
        // If the user accepts, let's create a notification
        if (permission === "granted") {
            const notification = new Notification("Thanks for enabling notifications!");
            // ...
        }
    });
}

function check() {
    setInterval(() => {
        document.getElementById("timeout").innerText = getTimeLeft(kohet);
    }, 1);
}


function checkStatus() {
    if (updated == true) {
        setTimeout(() => {
            check();
        }, 5);
    }
}





setInterval(() => {

    checkStatus();
    document.getElementById("time").innerText = getTime();

}, 1);