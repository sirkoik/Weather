const VERSION = '0.0.4a';
const WEATHERKEY = '6b80ba80e350de60e41ab0ccf87ad068';
const LATDEFAULT = 51.5;                                    // london defaults
const LONDEFAULT = 0.128;

function Weather() {    
    var pos = {lat: LATDEFAULT, lon: LONDEFAULT};
    
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
        });
        
        // fail: couldn't get the coordinates for some reason.
        coordsPromise.catch(positionError => {
            //alert(positionError.message);
            console.log(positionError.message);
            document.querySelector('.message').textContent = ' (unable to read position data)';
            
            pos.lat = LATDEFAULT;
            pos.lon = LONDEFAULT;
            
            this.getData();
        });
    }
    
    this.getURL = () => 'https://api.openweathermap.org/data/2.5/weather?lat=' + pos.lat + '&lon=' + pos.lon + '&APPID=' + WEATHERKEY;
    
    this.getData = () => {
        var xhr = new XMLHttpRequest();
        xhr.onload = (data) => {
            var data = xhr.response;
            this.populateFields(data);
        }
        xhr.open('GET', this.getURL(), true);
        xhr.send();
    }
    
    this.populateFields = data => {
        data = JSON.parse(data);
        
        console.log(data);
        
        var name = {'name': data.name};
        var temps = this.getTemps(data);
        var pressure= this.getPressure(data);
        var wind = this.getWind(data);
        var clouds = this.getClouds(data);
        var visibility = this.getVisibility(data);
        
        var fields = {
            'name': data.name, 
            'humidity': data.main.humidity,
            'visibility': visibility,
            ...temps, 
            ...pressure,
            ...wind, 
            ...clouds
        };

        console.log(fields);
        
        for (var field in fields) {
            //document.querySelector('.weather-'+field).textContent = fields[field];
        }
        
        document.title = fields.name + ' ' + fields.c + 'C / ' + fields.f + 'F';
        
        document.querySelector('.version').textContent = VERSION;
        
        document.querySelector('.weather-name').textContent = fields.name;
        document.querySelector('.weather-temp').textContent = fields.c + 'C / ' + fields.f + 'F';
        document.querySelector('.weather-wind').textContent = fields.kph + ' km/h / ' + fields.mph + ' mph ' + fields.rdir;
        document.querySelector('.wind-direction').style.transform = 'rotate(' + fields.r + 'deg)';
        document.querySelector('.wind-direction').innerHTML = '&uarr;';
        document.querySelector('.weather-clouds').textContent = fields.clouds + '%';
        if (data.rain) {
            document.querySelector('.weather-rain').textContent = this.parseObj(data.rain);
            document.querySelector('.weather-rain-container').classList.remove('hide');
        }
        if (data.snow) {
            document.querySelector('.weather-snow').textContent = this.parseObj(data.snow);
            document.querySelector('.weather-snow-container').classList.remove('hide');

        }
        document.querySelector('.weather-humidity').textContent = fields.humidity + '%';
        document.querySelector('.weather-pressure').textContent = 
            fields.phPa + ' hPa/mbar / ' + fields.pPsi + ' psi / ' + fields.pAtm + ' atm / ' + fields.pMmhg + ' mm Hg'; 
        
        document.querySelector('.weather-visibility').textContent = fields.visibility.km + 'km / ' + fields.visibility.mi + ' mi';
    }
    
    this.parseObj = obj => {
        var arr = [];
        for (el in obj) {
            arr.push(el + ' ' + obj[el]);
        }
        return arr.join('<br/>');
    }
    
    this.getTemps = data => {
        var tc = data.main.temp - 273.15;
        var tf = tc * 1.8 + 32;
        
        tc = Math.round(tc * 10) / 10;
        tf = Math.round(tf * 10) / 10;
        
        return {'c': tc, 'f': tf};
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

        var r = data.wind.deg;
        var rdirArr = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'SWW', 'W', 'WNW', 'NW', 'NNW'];
        var rdir = rdirArr[Math.ceil(14 * r / 360)];
        
        return {'kph': wk, 'mph': wm, 'r': r, 'rdir': rdir};
    }
    
    this.getClouds = data => {
        return {'clouds': data.clouds.all};
    }
    
    this.getVisibility = data => {
        var k = Math.round(10 * data.visibility / 1000) / 10;
        var mi = Math.round(10 * data.visibility / 1600) / 10;
        return {'km': k, 'mi': mi};
    }
}

window.onload = () => {
    var weather = new Weather();
    weather.getCoords();
}