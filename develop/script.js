var cityInput = $('#cityInput');
var searchBtn = $('#searchBtn');
var daysForecast = $('#daysForecast'); 
var apiKey = '9ed22dc3c627d4dc3ee512f267df50e4';
var todaysDate = $('#todaysDate');
var fiveDayForecast = $('#fiveDayForecast');
var localStorageArray = JSON.parse(localStorage.getItem('cityInput')) || [];

async function getGeocodingData(cityName) {
    var url = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&appid=${apiKey}`;
    var response = await fetch(url);
    var data = await response.json();
    console.log(data);
    return data;
}

async function getCityWeather(lat, lon) {
    var url = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`
    var response = await fetch(url);
    var data = await response.json();
    console.log(data);
    for (var i = 0; i < data.list.length; i += 8) {
        var day = data.list[i];
        var dt_txt = day.dt_txt;
        var date = new Date(dt_txt);
        var formattedDate = dayjs(date).format('MM/DD/YYYY');
        var iconCode = day.weather[0].icon;
        var iconUrl = `http://openweathermap.org/img/w/${iconCode}.png`;
        var icon = $('<img>').attr('src', iconUrl);
        var wind = day.wind.speed;
        var humidity = day.main.humidity;
        var tempKelvin = data.list[0].main.temp;
        var tempFahrenheit = Math.round((tempKelvin - 273.15) * 1.8 + 32);
        var tempEl = $('<p>').text(`Temperature: ${tempFahrenheit} °F`);
        var windEl = $('<p>').text(`Wind: ${wind} mph`);
        var humidityEl = $('<p>').text(`Humidity: ${humidity}%`);
        var dayEl = $('<div>').addClass('day p-2 m-4 bg-info text-dark');
        dayEl.append($('<h5>').text(formattedDate));
        dayEl.append(icon);
        dayEl.append(tempEl);
        dayEl.append(windEl);
        dayEl.append(humidityEl);
        fiveDayForecast.append(dayEl);
    }
}

async function getCurrentWeather(lat, lon) {
    var url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`
    var response = await fetch(url);
    var data = await response.json();
    console.log(data);
    var currentDate = new Date();
    var formattedDate = dayjs(currentDate).format('MM/DD/YYYY');
    var iconCode = data.weather[0].icon;
    var iconUrl = `http://openweathermap.org/img/w/${iconCode}.png`;
    var icon = $('<img>').attr('src', iconUrl);
    todaysDate.append(data.name + " " + formattedDate + " ").append(icon);
    var wind = data.wind.speed;
    var humidity = data.main.humidity;
    var tempKelvin = data.main.temp;
    var tempFahrenheit = Math.round((tempKelvin - 273.15) * 1.8 + 32);
    var tempEl = $('<p>').text(`Temperature: ${tempFahrenheit} °F`);
    var windEl = $('<p>').text(`Wind: ${wind} mph`);
    var humidityEl = $('<p>').text(`Humidity: ${humidity}%`);
    todaysDate.append(tempEl).append(windEl).append(humidityEl);
}

function storeCity(city) {
    if (!localStorageArray.includes(city)) {
        localStorageArray.push(city);
        
    }

    localStorage.setItem('cityInput', JSON.stringify(localStorageArray));
}

function formatCityName(cityName) {
    // Capitalize the first letter of the city name and make the rest lowercase
    return cityName.charAt(0).toUpperCase() + cityName.slice(1).toLowerCase();
  }

searchBtn.on('click', function() {
    todaysDate.empty();
    fiveDayForecast.empty();
    var cityName = cityInput.val();
    if(cityName === '') {
        alert('Please enter a City Name.')
    } else {
    cityName = formatCityName(cityName);
    getGeocodingData(cityName)
    .then(function(data) {
       var lat = data[0].lat;
       var lon = data[0].lon;
       console.log(lat);
       console.log(lon);
       storeCity(cityName);
       return getCityWeather(lat, lon) && getCurrentWeather(lat,lon);
        })
    .catch(function(error) {
        console.log(error);
    })};
});
