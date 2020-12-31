const VERSION = '0.0.12';
const WEATHERKEY = '6b80ba80e350de60e41ab0ccf87ad068';
const LATDEFAULT = 51.5;                                    // london defaults
const LONDEFAULT = 0.128;
const REFRESHDELAY = 60000;
const DATAREFRESH = 300000;
const UNITS_METRIC = 'metric';
const UNITS_IMPERIAL = 'imperial';

function Weather() {    
    var pos = {lat: LATDEFAULT, lon: LONDEFAULT};
    
    var refreshTimeout = -1;
    let units = UNITS_METRIC;

    document.querySelector('.refresh').textContent = REFRESHDELAY / 1000;
    document.querySelector('.data-refresh').textContent = DATAREFRESH / 1000 / 60;
    
    
    // Weather.getCoords: get geolocated coordinates if none manually provided.
    this.getCoords = () => {
        
        // TODO try to chain these promises.
        coordsPromise = new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                position => resolve(position),
                positionError => reject(positionError),
                {
                    enableHighAccuracy: true
                }
            );            
        });
        
        // success: got the coordinates.
        coordsPromise.then(position => {
            pos.lat = position.coords.latitude;
            pos.lon = position.coords.longitude;
            
            this.getData();
            this.getDataOneCall();
        });
        
        // fail: couldn't get the coordinates for some reason.
        coordsPromise.catch(positionError => {
            //alert(positionError.message);
            //console.log(positionError.message);
            document.querySelector('.message').textContent = ' (unable to read position data)';
            
            pos.lat = LATDEFAULT;
            pos.lon = LONDEFAULT;
            
            this.getData();
            this.getDataOneCall();
        });
    }
    
    this.getURL = (type) => 'https://api.openweathermap.org/data/2.5/'+type+'?lat=' + pos.lat + '&lon=' + pos.lon + '&APPID=' + WEATHERKEY;
    
    this.getData = () => {
        var xhr = new XMLHttpRequest();
        xhr.onload = (data) => {
            var data = xhr.response;
            this.populateFields(data);
            //this.checkNight(data);
            this.delayedRefresh();
        }
        xhr.onerror = () => {
            alert('Connection error. Check your internet connection.');
        }
        xhr.open('GET', this.getURL('weather'), true);
        xhr.send();
    }
    
    // getDataOneCall: Uses OpenWeatherMap's "one call" API.
    // currently using to get UV index data
    // I need to refactor this so it's all part of one Promise.
    this.getDataOneCall = () => {
        let xhr = new XMLHttpRequest();
        xhr.onload = (data) => {
            data = xhr.response;
            data = JSON.parse(data);
            //console.log(data);
            // "Feels like" temperature
            let feelsTemp = data.current.feels_like;
            
            var tc = feelsTemp - 273.15;
            var tf = tc * 1.8 + 32;

            tc = Math.round(tc * 10) / 10;
            tf = Math.round(tf * 10) / 10;

            var color = 160 - tf * 2.2 + 32;
            if (color < 0) color = 0;
            if (color > 160) color = 160;
            
            let weatherEmoji = '🙂';
            if (tc < 10) weatherEmoji = '⛄';
            if (tc < -5) weatherEmoji = '🥶';
            if (tc > 25) weatherEmoji = '🏖';
            if (tc > 30) weatherEmoji = '🥵';

            document.querySelector('.weather-temp-feels-like').textContent = (units === UNITS_METRIC? tc + 'C' : tf + 'F') + ' ' + weatherEmoji;
            document.querySelector('.weather-temp-feels-like').style.color = 'hsl(' + color + ', 50%, 50%)';
            
            // Wind gust
            if (data.current.wind_gust) {
                document.querySelector('.weather-wind-gust').style.display = 'block';
                
                document.querySelector('.weather-wind-gust').textContent = data.current.wind_gust;
            }
            
            // UVI
            let uvi = data.current.uvi;
            let uvRatings = ['Low', 'Moderate', 'High', 'Very High', 'Extreme'];
            let uvEmojis = ['😀', '🙂', '😯', '🔥', '☠'];
            let uvColors = ['#00ff00', '#ffff00', '#ff9900', '#ff0099', '#90c0f0'];
            let uviArrIndex = 4;
            if (uvi < 11) uviArrIndex = 3;
            if (uvi < 8) uviArrIndex = 2;
            if (uvi < 6) uviArrIndex = 1;
            if (uvi < 3) uviArrIndex = 0;
            
            document.querySelector('.weather-uvi').innerHTML = data.current.uvi + '<span title="' + uvRatings[uviArrIndex] + '">' + uvEmojis[uviArrIndex] + '</span>';
            document.querySelector('.weather-uvi').style.color = uvColors[uviArrIndex];
            
            document.querySelector('.weather-uvi-link').href = 'https://enviro.epa.gov/enviro/uv_search_v2?minx='+pos.lon+'&miny='+pos.lat+'&maxx='+pos.lon+'&maxy='+pos.lat;
        }
        xhr.open('GET', this.getURL('onecall'), true);
        xhr.send();
        
        xhr.onerror = () => {
            //alert('error');
        }
    }    
    
    
    
    this.populateFields = data => {
        data = JSON.parse(data);
        
        //console.log(data);
                
        var fields = {
            'name':       data.name, 
            'humidity':   data.main.humidity,
            'visibility': this.getVisibility(data),
            'updated':    this.getUpdated(data),
            'temps':      this.getTemps(data), 
            'pressure':   this.getPressure(data),
            'wind':       this.getWind(data), 
            'clouds':     this.getClouds(data),
            'sun':        this.getSun(data)
        };
        
        //console.log(fields);
                
        document.title = fields.name + ' ' + fields.temps.avg.c + 'C / ' + fields.temps.avg.f + 'F';
        
        document.querySelector('.version').textContent = VERSION;
        
        document.querySelector('.weather-name').textContent = fields.name;
        
        for (var tempType in fields.temps) {
            var temp = fields.temps[tempType];

            document.querySelector('.weather-temp-'+tempType).innerHTML = tempType + ' <span class="larger">' + (units == UNITS_METRIC? temp.c + 'C' : temp.f + 'F') + '</span>';
            document.querySelector('.weather-temp-'+tempType).style.color = 'hsl(' + temp.tcolor + ', 50%, 50%)'; 
            
            //if (tempType == 'avg') document.querySelector('.header').style.backgroundColor = 'hsl(' + temp.tcolor + ', 50%, 50%)';
        }
        
        document.querySelector('.weather-wind').textContent = units === UNITS_METRIC? fields.wind.kph + ' km/h ' : fields.wind.mph + ' mph ';
        
        if (fields.wind.rdir) {
            document.querySelector('.weather-wind').textContent += fields.wind.rdir;
            document.querySelector('.wind-direction').style.transform = 'rotate(' + fields.wind.r + 'deg)';
            document.querySelector('.wind-direction').innerHTML = '&uarr;';
        }
        
        const cloudEmojis = ['☁', '🌥', '⛅', '🌤', '☀'];
        let cEIndex = 5 - Math.round(fields.clouds * 0.05);
        if (cEIndex < 0) cEIndex = 0;
        const cloudEmoji = cloudEmojis[cEIndex];
        document.querySelector('.weather-clouds').textContent = fields.clouds + '% ' + cloudEmoji;
        
        if (data.rain) {
            document.querySelector('.weather-rain').textContent = this.parseObj(data.rain);
            document.querySelector('.weather-rain-container').classList.remove('hide');
        }
        
        if (data.snow) {
            document.querySelector('.weather-snow').textContent = this.parseObj(data.snow);
            document.querySelector('.weather-snow-container').classList.remove('hide');
        }
        
        const humidityEmojis = ['🌵', '💧', '💧', '💧', '🚿'];
        let humidityEmojiIndex = Math.round(fields.humidity * 0.05);
        if (humidityEmojiIndex > 4) humidityEmojiIndex = 4;
        const humidityEmoji = humidityEmojis[humidityEmojiIndex];

        document.querySelector('.weather-humidity').innerHTML = fields.humidity + '%' + '<br/>' + humidityEmoji;
        document.querySelector('.weather-pressure').textContent = 
            units === UNITS_METRIC? fields.pressure.phPa + ' hPa/mbar' : fields.pressure.pPsi + ' psi'; 
            //fields.pressure.phPa + ' hPa/mbar / ' + fields.pressure.pPsi + ' psi / ' + fields.pressure.pAtm + ' atm / ' + fields.pressure.pMmhg + ' mm Hg'; 
        
        document.querySelector('.weather-visibility').textContent = units === UNITS_METRIC? fields.visibility.km + 'km' : fields.visibility.mi + ' mi';
        
        document.querySelector('.weather-sun').innerHTML = '🌞 ' + fields.sun.sunrise + '<br/>🌛 ' + fields.sun.sunset + '<br/>🌞 ' + fields.sun.daylightHrs + 'h / ' + fields.sun.daylight + '%<br>🌛 '+ fields.sun.nightHrs + 'h / ' + fields.sun.night + '%';

        document.querySelector('.weather-last-updated').textContent = fields.updated;
    }
    
    this.parseObj = obj => {
        var arr = [];
        for (el in obj) {
            arr.push(el + ' ' + obj[el]);
        }
        return arr.join('<br/>');
    }
    
    this.getTemps = data => {
        var temps = [data.main.temp_min, data.main.temp, data.main.temp_max];
        var tempNames = ['min', 'avg', 'max'];
        var tempsOut = {};
        
        for (var x = 0; x < temps.length; x++) {
            var tc = temps[x] - 273.15;
            var tf = tc * 1.8 + 32;

            tc = Math.round(tc * 10) / 10;
            tf = Math.round(tf * 10) / 10;

            var color = 160 - tf * 2.2 + 32;
            if (color < 0) color = 0;
            if (color > 160) color = 160;
            
            tempsOut[tempNames[x]] = {'c': tc, 'f': tf, 'tcolor': color};
        }
                
        return tempsOut;
    }
    
    this.getPressure = data => {
        var phPa = data.main.pressure;
        var pPsi = Math.round(phPa * 0.0145037738 * 10) / 10;
        var pAtm = Math.round(phPa * 0.00098692326671601 * 10) / 10;
        var pMmhg = Math.round(phPa * 0.75006157584566 * 10) / 10;
        
        return {'phPa': phPa, 'pPsi': pPsi, 'pAtm': pAtm, 'pMmhg': pMmhg};
    }
    
    this.getWind = data => {
        var wk = data.wind.speed;
        var wm = Math.round(10 * wk / 1.6) / 10;

        var windObj = {'kph': wk, 'mph': wm};
        
        if (data.wind.deg) {
            var r = data.wind.deg;
            var rdirArr = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'SWW', 'W', 'WNW', 'NW', 'NNW'];
            var rdir = rdirArr[Math.ceil(14 * r / 360)];
            
            windObj.r = r;
            windObj.rdir = rdir;
        }
            
        return windObj;
    }
    
    this.getClouds = data => {
        return data.clouds.all;
    }
    
    this.getVisibility = data => {
        var k = Math.round(10 * data.visibility / 1000) / 10;
        var mi = Math.round(10 * data.visibility / 1600) / 10;
        return {'km': k, 'mi': mi};
    }
    
    this.getSun = data => {
        var sun = data.sys;
        
        var dayPct = (sun.sunset - sun.sunrise) / 86400;
        
        var daylight = Math.round(1000 * dayPct) / 10;
        var daylightHrs = Math.round(10 * 24 * dayPct) / 10;
        
        var night = 100 - daylight;
        var nightHrs = Math.round(10 * 24 * (1-dayPct)) / 10;
        
        return {
            sunrise: this.formatTime(sun.sunrise, true), 
            sunriseStamp: sun.sunrise,
            sunset: this.formatTime(sun.sunset, true),
            sunsetStamp: sun.sunset,
            daylight: daylight,
            daylightHrs: daylightHrs,
            night: night,
            nightHrs: nightHrs
        };
    }
    
    this.getUpdated = data => {
        return this.formatDate(data.dt, true, true);
    }
    
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
    
    this.formatDate = (ts, unix, noYear) => {
        if (unix) ts *= 1000;
        
        var date = new Date(ts);
         
        var options = {
            month:  'numeric', 
            day:    'numeric', 
            //year:   'numeric', 
            hour:   'numeric', 
            minute: 'numeric'
        };       
        
        if (!noYear) options.year = 'numeric';
        
        return date.toLocaleDateString([], options).replace(',', '');
    }

    this.formatTime = (ts, unix) => {
        ts = unix? ts * 1000 : ts;

        return new Date(ts).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
    }
    
    // delayedRefresh: Refreshes data after a delay.
    this.delayedRefresh = () => {
        refreshTimeout = setTimeout(() => {
            //this.getData();
            this.getCoords();
        }, REFRESHDELAY);
    }
}

window.onload = () => {
    var weather = new Weather();
    weather.getCoords();
}
