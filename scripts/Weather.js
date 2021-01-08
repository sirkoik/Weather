import { location, getFirst, showLocPopup } from './WeatherLocation.js';
import { 
    getTemps, 
    getFeelsLike, 
    getUVI, 
    getClouds, 
    getWind, 
    getHumidityDewPoint, 
    getPressure, 
    getVisibility, 
    getRain, 
    getSnow, 
    getWeatherTypes, 
    getSun 
} from './WeatherFunctions.js';
import {addEvent, state} from './Events.js';
import {qs, hide, unhide, setHTML} from './utility.js';

// API key
const WEATHERKEY = '6b80ba80e350de60e41ab0ccf87ad068';

// API constants
const TYPE_WEATHER = 'weather';
const TYPE_ONECALL = 'onecall';

let metric = true;

const REFRESH_DELAY = 60000;
let refreshInterval = 0;

const weatherData = {};

state.userPositionIsSupplied = false;


// toggleMetric: toggle between metric and imperial units of measurement.
const toggleMetric = () => {
    metric = !metric;
    weatherLoad(location);
    setHTML('.metric-imperial', metric? 'Metric' : 'Imperial'); 
}

const weatherLoad = async (data) => {
    //alert('browser location detect -> weather load?');
    unhide('.loading-container');

    //console.log('In Weather class ' + data.latitude + ' ' + data.longitude);
    try {
        await fetchData(data.latitude, data.longitude);
    } catch(e) {
        alert('Couldn\'t fetch updated weather data. Are you connected to the internet?');
        return false;
    }
    //console.log('Promises resolved!', weatherData);

    // populate header.
    unhide('.header');
    populate('header');

    unhide('.cards');

    // populate each card.
    populate('temps');
    populate('feelsLike');
    populate('clouds');
    populate('uvi');
    populate('wind');
    populate('humidity');
    populate('pressure');
    populate('visibility');
    populate('rain');
    populate('snow');
    populate('sun');
    populate('weatherTypes');

    unhide('.footer');

    showLocPopup(false);
    hide('.loading-container');

    state.userPositionIsSupplied = true;

    // set the interval to refresh the weather data periodically.
    if (!refreshInterval) refreshInterval = setInterval(weatherRefresh, REFRESH_DELAY);
}

// fetchData: fetch both JSON files asynchronously, and then return a promise when both have been retrieved.
const fetchData = async (latitude, longitude) => {
    const promise1 = fetch(formatURL(TYPE_WEATHER, latitude, longitude))
    .then(data => data.json())
    .then(data => weatherData.weather = data);

    const promise2 = fetch(formatURL(TYPE_ONECALL, latitude, longitude))
    .then(data => data.json())
    .then(data => weatherData.onecall = data);

    await Promise.all([promise1, promise2]);
}

// populate: populate the cards.
const populate = type => {
    const weatherMain = weatherData.weather.main;
    const oneCall = weatherData.onecall.current;
    let key = '';

    switch(type) {
        case 'header':
            key = weatherData.weather;
            setHTML('.location-name', key.name);
        break;

        case 'temps':
            key = weatherMain;
            const temps = getTemps(key.temp_min, key.temp, key.temp_max, metric);
            const weatherHTML = [
                'max <span class="larger">' + temps.max + '</span>',
                'avg <span class="larger">' + temps.avg + '</span>',
                'min <span class="larger">' + temps.min + '</span>'
            ];

            setHTML('.weather-temps', weatherHTML.join('<br/>'));
            qs('.card-temps').style.backgroundImage = 'linear-gradient(to bottom right, #fff, hsl('+temps.hue+', 50%, 50%))';
        break;

        case 'feelsLike': 
            key = oneCall.feels_like;
            const fl = getFeelsLike(key, metric);

            setHTML('.weather-temp-feels-like', fl.t + ' ' + fl.emoji);
            qs('.card-temp-feels-like').style.backgroundImage = 'linear-gradient(to bottom right, #fff, hsl('+fl.hue+', 50%, 50%))';
        break;

        case 'clouds':
            key = weatherData.weather.clouds.all;
            const clouds = getClouds(key);
            
            setHTML('.weather-clouds', clouds.cloudCover + '% ' + clouds.emoji);

            const clearGradient = clouds.cloudCover < 95? clouds.cloudCover + 5 : 100;
            qs('.card-clouds').style.backgroundImage = 'linear-gradient(to bottom, #ccc ' + clouds.cloudCover + '%, hsl(195, 59%, 77%) ' + clearGradient + '%)';
        break;

        case 'uvi':
            key = oneCall.uvi;
            const uvi = getUVI(key);

            setHTML('.weather-uvi', uvi.uvi + ' ' + uvi.emoji);
            qs('.card-uvi').style.backgroundImage = 'linear-gradient(to bottom right, #fff, hsl(' + uvi.hue + ', 50%, 50%)';
        break;

        case 'wind':
            key = weatherData.weather.wind;
            const wind = getWind(key, metric);

            setHTML('.weather-wind', wind.speed);

            // if a wind angle is supplied, show the direction and an arrow.
            if (wind.angle) {
                unhide('.wind-direction');

                setHTML('.wind-direction-text', wind.direction);
                setHTML('.wind-angle', '&uarr;');
                qs('.wind-angle').style.transform = 'rotate(' + wind.angle + 'deg)';
            } else {
                hide('.wind-direction');
            }

            // if a wind gust is present, add to card.
            if (wind.gust) {
                setHTML('.wind-gust', wind.gustSpeed)
                unhide('.weather-wind-gust-container');
            } else {
                hide('.weather-wind-gust-container');
            }
        break;

        case 'humidity':
            const humidity = getHumidityDewPoint(oneCall.humidity, oneCall.dew_point, metric);

            setHTML('.weather-humidity', humidity.humidity + ' ' + humidity.emoji);
            setHTML('.weather-dewpoint', humidity.dewPoint);
        break;

        case 'pressure':
            key = oneCall.pressure;
            const pressure = getPressure(key, metric);

            setHTML('.weather-pressure', pressure.pressure);
        break;

        case 'visibility':
            key = weatherData.weather.visibility;
            const visibility = getVisibility(key, metric);

            setHTML('.weather-visibility', visibility);
        break;

        case 'weatherTypes': 
            key = oneCall.weather;
            const types = getWeatherTypes(key);

            if (types.length > 0) {
                setHTML('.weather-types', types.join('\n'));
                unhide('.weather-types-container');
            } else {
                hide('.weather-types-container');
            }
        break;

        case 'rain':
            key = weatherMain.rain;
            if (!key) {
                hide('.weather-rain-container');
                break;
            }
            
            const rain = getRain(key);
            setHTML('.weather-rain', rain);
            unhide('.weather-rain-container');
        break;

        case 'snow':
            key = weatherMain.snow;
            if (!key) {
                hide('.weather-snow-container');
                break;
            }
            
            const snow = getSnow(key);
            setHTML('.weather-snow', snow);
            unhide('.weather-snow-container');
        break;            

        case 'sun':
            key = weatherData.weather.sys;
            const sun = getSun(key);
            const sunHTML = [
                '🌞 ' + sun.sunrise,
                '🌛 ' + sun.sunset,
                '🌞 ' + sun.daylightHrs + 'h / ' + sun.daylight + '%',
                '🌛 ' + sun.nightHrs + 'h / ' + sun.night + '%'
            ];

            setHTML('.weather-sun', sunHTML.join('<br/>'));
        break;
    }
}

// weatherRefresh: Refresh weather data periodically. This must be called by an interval function.
const weatherRefresh = () => {
    if (state.userPositionIsSupplied) weatherLoad(location);
}

// format a url based on the type of request 
const formatURL = (type, latitude, longitude) => 'https://api.openweathermap.org/data/2.5/'+type+'?lat=' + latitude + '&lon=' + longitude + '&APPID=' + WEATHERKEY;

/*
// Check if daytime
// Weather.checkNight: check if nighttime and if so, invert colors
const sunrise = data.sys.sunrise * 1000;
const sunset = data.sys.sunset * 1000;
const isDay = curDate > sunrise && curDate < sunset;
*/

// trigger to load the weather once position data has been supplied by the user.
addEvent('userPositionSupplied', event => weatherLoad(event.detail));
qs('.metric-imperial').addEventListener('click', toggleMetric);
