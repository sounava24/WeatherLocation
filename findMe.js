const loc = document.querySelector(".loc");
const latitude = document.querySelector(".lat");
const longitude = document.querySelector(".long");
const locName = document.querySelector(".locName");
const feel = document.querySelector(".feel");
const min = document.querySelector(".min");
const max = document.querySelector(".max");
const humid = document.querySelector(".humid");
const wind = document.querySelector(".wind");
const cloudsElem = document.querySelector(".clouds");
const dateElem = document.querySelector(".date");
const mapme = document.querySelector(".mapme");
const imgg = document.querySelector(".imgg");

const weekCards = document.querySelectorAll(".week .card"); // Select all cards in the week

let lat, long; 

const success = (position) => {
  lat = position.coords.latitude;
  long = position.coords.longitude;
  console.log(lat, long);
  latitude.innerText = `Latitude: ${lat}°`;
  longitude.innerText=`Longitude: ${long}°`;
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

  
    let datas = [
      [data.city.name, data.list[0].main.feels_like, data.list[0].main.temp_min, data.list[0].main.temp_max,
      data.list[0].main.humidity,  data.list[0].wind.speed, data.list[0].weather[0].main, data.list[0].weather[0].description,data.list[0].weather[0].icon,(data.list[0].dt_txt).split(" ",1)],

      [data.city.name, data.list[6].main.feels_like, data.list[6].main.temp_min, data.list[6].main.temp_max,
      data.list[6].main.humidity,  data.list[6].wind.speed, data.list[6].weather[0].main, data.list[6].weather[0].description,data.list[6].weather[0].icon,(data.list[6].dt_txt).split(" ",1)],

      [data.city.name, data.list[14].main.feels_like, data.list[14].main.temp_min, data.list[14].main.temp_max,
      data.list[14].main.humidity,  data.list[14].wind.speed, data.list[14].weather[0].main, data.list[14].weather[0].description,data.list[14].weather[0].icon,(data.list[14].dt_txt).split(" ",1)],

      [data.city.name, data.list[22].main.feels_like, data.list[22].main.temp_min, data.list[22].main.temp_max,
      data.list[22].main.humidity,  data.list[22].wind.speed, data.list[22].weather[0].main, data.list[22].weather[0].description,data.list[22].weather[0].icon,(data.list[22].dt_txt).split(" ",1)],

      [data.city.name, data.list[30].main.feels_like, data.list[30].main.temp_min, data.list[30].main.temp_max,
      data.list[30].main.humidity,  data.list[30].wind.speed, data.list[30].weather[0].main, data.list[30].weather[0].description,data.list[30].weather[0].icon,(data.list[30].dt_txt).split(" ",1)],

      [data.city.name, data.list[38].main.feels_like, data.list[38].main.temp_min, data.list[38].main.temp_max,
      data.list[38].main.humidity,  data.list[38].wind.speed, data.list[38].weather[0].main, data.list[38].weather[0].description,data.list[38].weather[0].icon,(data.list[38].dt_txt).split(" ",1)]
    ];


    locName.innerText = `Location: ${datas[0][0]}`;
    feel.innerText = `Feels like: ${datas[0][1]}°C`;
    min.innerText = `Min Temp: ${datas[0][2]}°C`;
    max.innerText = `Max Temp: ${datas[0][3]}°C`;
    humid.innerText = `Humidity: ${datas[0][4]}%`;
    wind.innerText = `Wind Speed: ${datas[0][5]} m/s`;
    cloudsElem.innerHTML = `Clouds: ${datas[0][6]} - ${datas[0][7]}`;
    imgg.innerHTML = `<img src="https://openweathermap.org/img/wn/${datas[0][8]}@2x.png" style="height:100px; width:100px;" alt="weather icon">`;
    dateElem.innerText = `Date: ${datas[0][9]}`;

    weekCards.forEach((card, index) => {
      const cardData = datas[index + 1]; 
      card.querySelector(".time").innerText = `Date: ${cardData[9]}`;
      card.querySelector(".willfeel").innerText = `Feels like: ${cardData[1]}°C`;
      card.querySelector(".willmin").innerText = `Min Temp: ${cardData[2]}°C`;
      card.querySelector(".willmax").innerText = `Max Temp: ${cardData[3]}°C`;
      card.querySelector(".willhumid").innerText = `Humidity: ${cardData[4]}%`;
      card.querySelector(".willcloud").innerText = `Clouds: ${cardData[6]} - ${cardData[7]}`;
    });

  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
};

const find = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, error);
  } else {
    loc.textContent = "Geolocation is not supported by your browser";
  }
};

document.addEventListener("DOMContentLoaded", () => {
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
