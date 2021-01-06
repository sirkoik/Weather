import WeatherLocation from './WeatherLocation.js';
import WeatherFunctions from './WeatherFunctions.js';
import {addEvent} from './Events.js';
import {qs, hide, unhide, setHTML} from './utility.js';
const VERSION = '0.0.13';
const WEATHERKEY = '6b80ba80e350de60e41ab0ccf87ad068';
const LATDEFAULT = 51.5; // london defaults
const LONDEFAULT = 0.128;
const REFRESHDELAY = 60000;
const DATAREFRESH = 300000;
const UNITS_METRIC = 'Metric';
const UNITS_IMPERIAL = 'Imperial';



class Weather {
    // constants
    TYPE_WEATHER = 'weather';
    TYPE_ONECALL = 'onecall';

    units = UNITS_METRIC;
    metric = true;

    weatherData = {};

    constructor() {
        // trigger to load the weather once position data has been supplied by the user.
        addEvent('userPositionSupplied', event => this.weatherLoad(event.detail));
        //addEvent('refreshWeatherData', event => this.weatherLoad())
    }

    weatherLoad = async (data) => {
        this.loading = true;

        console.log('In Weather class ' + data.latitude + ' ' + data.longitude);
        await this.fetchData(data.latitude, data.longitude);
        console.log('Promises resolved!', this.weatherData);

        this.showHeader = true;
        this.populate('header');

        this.showCards = true;
        // populate each card.
        this.populate('temps');
        this.populate('feelsLike');
        this.populate('clouds');
        this.populate('uvi');
        this.populate('wind');
        this.populate('humidity');
        this.populate('pressure');
        this.populate('visibility');
        this.populate('rain');
        this.populate('snow');
        this.populate('sun');
        this.populate('weatherTypes');

        this.showFooter = true;

        WeatherLocation.showLocPopup = false;
        this.loading = false;
    }

    // fetchData: fetch both JSON files asynchronously, and then return a promise when both have been retrieved.
    fetchData = async (latitude, longitude) => {
        const promise1 = fetch(this.formatURL(this.TYPE_WEATHER, latitude, longitude))
        .then(data => data.json())
        .then(data => this.weatherData.weather = data);

        const promise2 = fetch(this.formatURL(this.TYPE_ONECALL, latitude, longitude))
        .then(data => data.json())
        .then(data => this.weatherData.onecall = data);

        await Promise.all([promise1, promise2]);
        //.then(() => {
            //console.log(this.weatherData);
        //});
    }

    // populate: populate the cards.
    populate = type => {
        const weatherMain = this.weatherData.weather.main;
        const oneCall = this.weatherData.onecall.current;
        let key = '';

        switch(type) {
            case 'header':
                key = this.weatherData.weather;
                setHTML('.location-name', key.name);
            break;

            case 'temps':
                key = weatherMain;
                const temps = WeatherFunctions.getTemps(key.temp_min, key.temp, key.temp_max, this.metric);
                const weatherHTML = [
                    'max <span class="larger">' + temps.max + '</span>',
                    'avg <span class="larger">' + temps.avg + '</span>',
                    'min <span class="larger">' + temps.min + '</span>'
                ];

                setHTML('.weather-temps', weatherHTML.join('<br/>'));
            break;

            case 'feelsLike': 
                key = oneCall.feels_like;
                const fl = WeatherFunctions.getFeelsLike(key, this.metric);

                setHTML('.weather-temp-feels-like', fl.t + ' ' + fl.emoji);
            break;

            case 'clouds':
                key = this.weatherData.weather.clouds.all;
                const clouds = WeatherFunctions.getClouds(key);
                
                setHTML('.weather-clouds', clouds.cloudCover + ' ' + clouds.emoji);
            break;

            case 'uvi':
                key = oneCall.uvi;
                const uvi = WeatherFunctions.getUVI(key);

                setHTML('.weather-uvi', uvi.uvi + ' ' + uvi.emoji);
            break;

            case 'wind':
                key = this.weatherData.weather.wind;
                const wind = WeatherFunctions.getWind(key, this.metric);

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
                const humidity = WeatherFunctions.getHumidityDewPoint(oneCall.humidity, oneCall.dew_point, this.metric);

                setHTML('.weather-humidity', humidity.humidity + ' ' + humidity.emoji);
                setHTML('.weather-dewpoint', humidity.dewPoint);
            break;

            case 'pressure':
                key = oneCall.pressure;
                const pressure = WeatherFunctions.getPressure(key, this.metric);

                setHTML('.weather-pressure', pressure.pressure);
            break;

            case 'visibility':
                key = this.weatherData.weather.visibility;
                const visibility = WeatherFunctions.getVisibility(key, this.metric);

                setHTML('.weather-visibility', visibility);
            break;

            case 'weatherTypes': 
                key = oneCall.weather;
                const types = WeatherFunctions.getWeatherTypes(key);

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
                
                const rain = WeatherFunctions.getRain(key);
                setHTML('.weather-rain', rain);
                unhide('.weather-rain-container');
            break;

            case 'snow':
                key = weatherMain.snow;
                if (!key) {
                    hide('.weather-snow-container');
                    break;
                }
                
                const snow = WeatherFunctions.getRain(key);
                setHTML('.weather-snow', snow);
                unhide('.weather-snow-container');
            break;            

            case 'sun':
                key = this.weatherData.weather.sys;
                const sun = WeatherFunctions.getSun(key);
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


    // format a url based on the type of request 
    formatURL = (type, latitude, longitude) => 'https://api.openweathermap.org/data/2.5/'+type+'?lat=' + latitude + '&lon=' + longitude + '&APPID=' + WEATHERKEY;


    // display functions
    set showHeader(show) {
        if (show) {
            unhide('.header');
        } else {
            hide('.header');
        }
    }    

    set showCards(show) {
        if (show) {
            unhide('.cards');
        } else {
            hide('.cards');
        }
    }

    set showFooter(show) {
        if (show) {
            unhide('.footer');
        } else {
            hide('.footer');
        }
    }    

    set loading(isLoading) {
        if (isLoading) {
            unhide('.loading-container');
        } else {
            hide('.loading-container');
        }
    }
}


function WeatherOld() {  
    // Weather.checkNight: check if nighttime and if so, invert colors
    this.checkNight = data => {
        var curDate = new Date().getTime();
        
        data = JSON.parse(data);
        let sunrise = data.sys.sunrise * 1000;
        let sunset = data.sys.sunset * 1000;
        
        let isDay = curDate > sunrise && curDate < sunset;
        
        // nighttime
        if (!isDay)  {
            document.querySelector('*').style.color = '#fff';
            document.body.style.backgroundColor = '#000';
        } else {
            //alert(curDate + ' ' +  data.sys.sunrise*1000);
        }
    }
    
    
    // delayedRefresh: Refreshes data after a delay.
    this.delayedRefresh = () => {
        refreshTimeout = setTimeout(() => {
            //this.getData();
            this.getCoords();
        }, REFRESHDELAY);
    }
}

export default Weather;