var cityInput = $('#cityInput');
var searchBtn = $('#searchBtn');
var daysForecast = $('#daysForecast'); 
var apiKey = '9ed22dc3c627d4dc3ee512f267df50e4';
var todaysDate = $('#todaysDate');
var fiveDayForecast = $('#fiveDayForecast');
var historyBtn = $('#cityHistory');
var fiveDayForecastTxt = $('.5DayForecast');
var localStorageArray = JSON.parse(localStorage.getItem('cityInput')) || [];

function init() {
    for (var i = 0; i < localStorageArray.length; i++) {
        var buttonEl = $('<button>').text(localStorageArray[i]);
        historyBtn.append(buttonEl);
        };
    }

    async function getGeocodingData(cityName) {
        var url = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&appid=${apiKey}`;
        var response = await fetch(url);
        var data = await response.json();
        console.log(data);
        if (data.length === 0) {
            throw new Error('Location not found. Please enter a valid city name.');
        }
        return data;
    }
    

async function get5DayForecast(lat, lon) {
    var url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`
    var response = await fetch(url);
    var data = await response.json();
    console.log(data);
    fiveDayForecastTxt.removeClass('invisible');
    for (var i = 7; i < data.list.length; i += 8) {
        var day = data.list[i];
        var dt_txt = day.dt_txt;
        var date = new Date(dt_txt);
        var formattedDate = dayjs(date).format('MM/DD/YYYY');
        var iconCode = day.weather[0].icon;
        var iconUrl = `https://openweathermap.org/img/w/${iconCode}.png`;
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
    daysForecast.addClass('border border-dark h-50');
    var currentDate = new Date();
    var formattedDate = dayjs(currentDate).format('MM/DD/YYYY');
    var iconCode = data.weather[0].icon;
    var iconUrl = `https://openweathermap.org/img/w/${iconCode}.png`;
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

  historyBtn.on('click', 'button', function() {
    todaysDate.empty();
    fiveDayForecast.empty();
    var cityName = $(this).text();
    cityName = formatCityName(cityName);
    getGeocodingData(cityName)
    .then(function(data) {
      var lat = data[0].lat;
      var lon = data[0].lon;
      return get5DayForecast(lat, lon) && getCurrentWeather(lat,lon);
    })
    .catch(function(error) {
      console.log(error);
    });
  });

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
            var buttonExists = false;
            // check if button already exists
            historyBtn.children().each(function() {
                if ($(this).text() === cityName) {
                    buttonExists = true;
                }
            });
            // append button if it doesn't exist
            if (!buttonExists) {
                var buttonEl = $('<button>').text(cityName);
                historyBtn.append(buttonEl);
                storeCity(cityName);
            }
            return get5DayForecast(lat, lon) && getCurrentWeather(lat,lon);
        })
        .catch(function(error) {
            alert(error.message);
        });
    }
});


init ();
