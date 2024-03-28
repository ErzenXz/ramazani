let date = new Date();

let syncedTime = new Date().getTime();
let timeDiff = 0;

let formatedDate = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();

let kohet = [];

let audioSTATUS = localStorage.getItem("audio") ?? "true";
let clockSTATUS = localStorage.getItem("clock") ?? 1;

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

if (clockSTATUS == 1) {
   document.getElementById("clock").innerHTML = `<i class="fa-solid fa-user-clock"></i>`;
   clock = true;
} else if (clockSTATUS == 2) {
   document.getElementById("clock").innerHTML = '<i class="fa-solid fa-user-plus"></i>';
   clock = false;
} else {
   document.getElementById("clock").innerHTML = '<i class="fa-solid fa-user-minus"></i>';
   clock = false;
}

let api = "https://worldtimeapi.org/api/ip";

async function syncUserTimeToRealTime() {
   try {
      const clientRequestTime = new Date();

      const requestStartTime = performance.now();
      const response = await fetch(
         `${api}?clientRequestTime=${encodeURIComponent(clientRequestTime.toISOString())}`
      );
      const requestEndTime = performance.now();

      if (!response.ok) {
         throw new Error("Failed to fetch time from the API");
      }

      const data = await response.json();

      const requestTime = requestEndTime - requestStartTime;

      const serverClientDifferenceTimeWithRequestTime =
         new Date(data.utc_datetime) - new Date(data.clientRequestTime);
      const serverTime = new Date(data.utc_datetime);

      await new Promise((resolve) => setTimeout(resolve, 200));

      const responseTime = requestEndTime - requestStartTime;

      const synchronizedTimeOnClient = new Date(serverTime.getTime() + responseTime / 2);

      const timeDifference = clientRequestTime - serverTime;

      timeDiff = serverTime - clientRequestTime;

      return synchronizedTimeOnClient.getTime();
   } catch (error) {
      console.error("Error syncing time:", error.message);
      return null;
   }
}

syncUserTimeToRealTime().then((timestamp) => {
   if (timestamp !== null) {
      syncedTime = timestamp;
      console.log("User time synced to real time.");
   } else {
      console.log("Failed to sync user time to real time.");
   }
});

setInterval(async () => {
   await syncUserTimeToRealTime().then((timestamp) => {
      if (timestamp !== null) {
         syncedTime = timestamp;
      } else {
         console.log("Failed to sync user time to real time.");
      }
   });
}, 2000);

async function getCountryCode() {
   return await fetch("https://ipapi.co/json/")
      .then((response) => response.json())
      .then((data) => data.country_code)
      .catch((error) => {
         console.error("Error fetching country code:", error);
         return "XK";
      });
}

getPrayerTimes();

async function getPrayerTimes() {
   const countryCode = String(await getCountryCode()).toUpperCase();
   let countryName = "";

   switch (countryCode) {
      case "XK":
         document.getElementById(
            "country"
         ).innerHTML = `<i class="fas fa-map-marker-alt"></i> Kosovë`;
         countryName = "Kosovë";
         break;
      case "AL":
         document.getElementById(
            "country"
         ).innerHTML = `<i class="fas fa-map-marker-alt"></i> Shqipëri`;
         countryName = "Shqipëri";
         break;
      case "MK":
         document.getElementById(
            "country"
         ).innerHTML = `<i class="fas fa-map-marker-alt"></i> Maqedoni`;
         countryName = "Maqedoni";
         break;
      default:
         document.getElementById(
            "country"
         ).innerHTML = `<i class="fas fa-map-marker-alt"></i> Kosovë`;
         break;
   }

   document.title = `Takvimi - ${countryName}`;

   if (localStorage.getItem("firstTime") == null) {
      openModal(
         `Mirësevini në eTakvim - ${countryName}!`,
         "Takvimi është një aplikacion i thjeshtë që ju ndihmon të mbani kohën e namazit dhe të lexoni hadithe të ndryshme."
      );
      localStorage.setItem("firstTime", "false");
   }

   var timestamp = Math.floor(Date.now() / 1000);
   var hadithUrl = "https://onehadith.org";
   var hadithfUrl = hadithUrl + "/api/random";
   var hadith_url = geturl(hadithfUrl, { lan: "al" });
   fetch(hadith_url)
      .then((response) => response.json())
      .then((data) => {
         document.getElementById("hadith").innerHTML =
            data.hadith + "<br>" + "<p class='nga'>" + data.grade + "</p>";
         let image = "//onehadith.org" + data.image;
         IMG = image;
         document.getElementById("main").style.backgroundImage = `url(${image})`;
      });

   let url = `https://onehadith.org/api/random?lan=al&country=${countryCode}&timestamp=${timestamp}`;

   fetch(url)
      .then((response) => response.json())
      .then((data) => {
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

         kohet = kohet.map((time) => {
            const [hour, minute] = time.split(":").map(parseFloat);
            const date = new Date(syncedTime);
            date.setHours(hour, minute, 0); // Set seconds to 0
            return date.toTimeString().slice(0, 8);
         });

         let tt = new Date();

         let month = tt.getMonth() + 1;

         let value = 0;

         if (clockSTATUS == 2) {
            value = 1;
         } else if (clockSTATUS == 3) {
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

         document.getElementById("timeout").innerText = getTimeLeft(kohet, syncedTime);
         updated = true;
      });
}

function updateTimes(times, delta = 1) {
   if (delta == 0) {
      return times;
   }
   return times.map((time) => {
      const [hour, minute, second] = time.split(":").map(parseFloat);
      const date = new Date(0, 0, 0, hour, minute, second);
      date.setHours(date.getHours() + delta);
      return date.toTimeString().slice(0, 8);
   });
}

async function getTime() {
   if (updated == true) {
      document.getElementById("timeout").innerText = getTimeLeft(kohet);
   }

   let DATEms = new Date().getTime() + timeDiff;
   let DATE = new Date(DATEms);
   let hour = DATE.getHours();
   let minutes = DATE.getMinutes();
   let seconds = DATE.getSeconds();

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

async function getTimeLeft(times) {
   // Get current time
   const currentTimestamp = new Date().getTime() + timeDiff;

   // Loop through times to find next one
   for (let i = 0; i < times.length; i++) {
      const [hour, minute, second] = times[i].split(":");

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
   return "Natën e mirë!";
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
   let newTime = `${newHours.toString().padStart(2, "0")}:${newMinutes
      .toString()
      .padStart(2, "0")}`;

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
      audio.addEventListener("ended", function () {
         // code to be executed when audio has ended playing
         audioCounter = 0;
      });

      document.getElementById("effect").classList.add("prayer-time");

      setTimeout(() => {
         document.getElementById("effect").classList.remove("prayer-time");
      }, 10000);

      let notify = new Notification(`Sapo ka hyrë ${t1 ?? "koha për tu falur"}`, {
         body: "Namazi është obligim për besimtarët në kohë të caktuar. [4:103]",
         icon: IMG,
         requireInteraction: true,
         vibrate: [200, 100, 200],
      });
   } else {
      console.log("Audio status unchanged");
   }
}

// Load audio on page load
window.addEventListener("DOMContentLoaded", () => {
   if (audioSTATUS) {
      audio.load();
      console.log("Audio loaded and ready to play - app.js");
   }
});

function audioChange() {
   if (audioSTATUS == "false") {
      localStorage.setItem("audio", "true");
      audioSTATUS = localStorage.getItem("audio");
      document.getElementById("audio").innerHTML = '<i class="fa-solid fa-volume-high"></i>';
      openModal("Audio enabled", "Audio notifications have been enabled.");
   } else {
      localStorage.setItem("audio", "false");
      audioSTATUS = localStorage.getItem("audio");
      document.getElementById("audio").innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
      openModal("Audio disabled", "Audio notifications have been disabled.");
      if (audio) {
         audio.pause();
      }
   }
}

let currentIndex = clockSTATUS - 1;
const values = [1, 2, 3];

function shuffleNext() {
   currentIndex = (currentIndex + 1) % values.length;
   // Do something with the current value, e.g. update UI
   const currentValue = values[currentIndex];
   localStorage.setItem("clock", currentValue);

   if (currentValue == 1) {
      document.getElementById("clock").innerHTML = `<i class="fa-solid fa-user-clock"></i>`;
      openModal("Clock set in normal", "Clock has been set to normal timezone.");
   }
   if (currentValue == 2) {
      document.getElementById("clock").innerHTML = '<i class="fa-solid fa-user-plus"></i>';
      openModal("Clock timezone up by 1", "Clock has been set 1 hour plus.");
   }
   if (currentValue == 3) {
      document.getElementById("clock").innerHTML = '<i class="fa-solid fa-user-minus"></i>';
      openModal("Clock timezone down by 1", "Clock has been set 1 hour minus.");
   }
}

document.getElementById("clock").addEventListener("click", shuffleNext);

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

setInterval(async () => {
   if (updated == true) {
      getTimeLeft(kohet).then((time) => {
         document.getElementById("timeout").innerText = time;
      });
   }
   getTime().then((time) => {
      document.getElementById("time").innerText = time;
   });
}, 1);

function adjustEventListeners() {
   if (window.innerWidth < 768) {
      let hadith = document.getElementById("hadith");
      let prayer = document.querySelector(".prayer");

      if (hadith && prayer) {
         // Ensure elements exist
         hadith.addEventListener("click", hideHadith);
         prayer.addEventListener("click", showHadith);

         hideHadith();
      }
   } else {
      let hadith = document.getElementById("hadith");
      let prayer = document.querySelector(".prayer");

      if (hadith && prayer) {
         // Ensure elements exist
         hadith.removeEventListener("click", hideHadith);
         prayer.removeEventListener("click", showHadith);
         // Reset styles
         hadith.style.display = "flex";
         prayer.style.display = "flex";
      }
   }
}

function hideHadith() {
   let hadith = document.getElementById("hadith");
   let prayer = document.querySelector(".prayer");
   hadith.style.display = "none";
   prayer.style.display = "flex";
}

function showHadith() {
   let hadith = document.getElementById("hadith");
   let prayer = document.querySelector(".prayer");
   hadith.style.display = "flex";
   prayer.style.display = "none";
}

adjustEventListeners();

window.addEventListener("resize", adjustEventListeners);

function openModal(title = "", text = "Default text", image = false) {
   let modalContent = "";
   if (image !== false && image !== "") {
      modalContent = `
       <h2 class="text-lg font-bold">${title}</h2>
       <p>${text}</p>
       <img src="${image}" alt="Modal image" class="mt-4 rounded-lg">
     `;
   } else {
      modalContent = `
       <h2 class="text-lg font-bold">${title}</h2>
       <p>${text}</p>
     `;
   }

   const modalOverlay = document.createElement("div");
   modalOverlay.classList.add("modal-overlay");
   modalOverlay.onclick = closeModal;

   const modalContainer = document.createElement("div");
   modalContainer.classList.add("modal-container");

   const modalHeader = document.createElement("div");
   modalHeader.classList.add("modal-header");

   const modalContentWrapper = document.createElement("div");
   modalContentWrapper.classList.add("modal-content");
   modalContentWrapper.innerHTML = modalContent;

   const modalFooter = document.createElement("div");
   modalFooter.classList.add("modal-footer");
   const closeButton = document.createElement("button");
   closeButton.innerText = "Close";
   closeButton.classList.add("modal-close");
   closeButton.onclick = closeModal;
   modalFooter.appendChild(closeButton);

   modalContainer.appendChild(modalHeader);
   modalContainer.appendChild(modalContentWrapper);
   modalContainer.appendChild(modalFooter);

   const modal = document.createElement("div");
   modal.id = "modal";
   modal.appendChild(modalOverlay);
   modal.appendChild(modalContainer);

   document.body.appendChild(modal);
}

function closeModal() {
   const modal = document.getElementById("modal");
   modal.parentNode.removeChild(modal);
}
