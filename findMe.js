const finde = document.querySelector(".findme");
const loc = document.querySelector(".loc");
const locName = document.querySelector(".locName");
const feel = document.querySelector(".feel");
const min = document.querySelector(".min");
const max = document.querySelector(".max");
const humid = document.querySelector(".humid");
const wind = document.querySelector(".wind");
const cloudsElem = document.querySelector(".clouds");
const dateElem = document.querySelector(".date");
const mapme = document.querySelector(".mapme");
const cards = document.querySelector(".cards");
const imgg = document.querySelector(".imgg");

let lat, long; // Store lat and long here for later use

const success = (position) => {
  lat = position.coords.latitude;
  long = position.coords.longitude;
  console.log(lat, long);
  loc.innerText = `Lat: ${lat}° Long: ${long}°`;
  weather(lat, long);
};

function error() {
  loc.textContent = "Unable to retrieve your location";
}

const weather = async (lat, long) => {
  let apikey = "9778cad04f42d2e7a4df572b0c29e294";
  let call = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${long}&appid=${apikey}&units=metric`;
  try {
    const response = await fetch(call);
    const data = await response.json();
    console.log(data);

    let city = data.city.name;
    let temp = data.list[0].main.temp;
    let feels = data.list[0].main.feels_like;
    let minTemp = data.list[0].main.temp_min;
    let maxTemp = data.list[0].main.temp_max;
    let humidity = data.list[0].main.humidity;
    let windSpeed = data.list[0].wind.speed;
    let weatherMain = data.list[0].weather[0].main;
    let cloudsDescription = data.list[0].weather[0].description;
    let iconCode = data.list[0].weather[0].icon;
    let date = data.list[0].dt_txt;

    locName.innerText = `Location: ${city}`;
    feel.innerText = `Feels like: ${feels}°C`;
    min.innerText = `Min Temp: ${minTemp}°C`;
    max.innerText = `Max Temp: ${maxTemp}°C`;
    humid.innerText = `Humidity: ${humidity}%`;
    wind.innerText = `Wind Speed: ${windSpeed} m/s`;
    cloudsElem.innerHTML = `Clouds: ${weatherMain} - ${cloudsDescription}`;
    
    // Correct the icon display using template literals (backticks)
    console.log(imgg.innerHTML)
    imgg.innerHTML = `<img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" style="padding:0; margin: 0;height:100px; width:100px;" alt="weather icon">`;
    dateElem.innerText = `Date: ${date}`;
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
};

const find = () => {
  if (navigator.geolocation) {
    loc.innerText = "Loading...";
    navigator.geolocation.getCurrentPosition(success, error);
  } else {
    loc.textContent = "Geolocation is not supported by your browser";
  }
};

finde.addEventListener("click", () => {
  cards.classList.remove("hide");
  finde.classList.add("hide");
  find();
});

const findddddd = () => {
  if (lat && long) {
    window.location.href = `https://www.openstreetmap.org/#map=18/${lat}/${long}`;
  } else {
    console.error("Latitude and Longitude are not defined yet.");
  }
};

mapme.addEventListener("click", findddddd);
