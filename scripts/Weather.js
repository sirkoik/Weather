const VERSION = '0.0.3a';
const WEATHERKEY = '6b80ba80e350de60e41ab0ccf87ad068';

function Weather(pos) {
    var _self = this;
    
    var pos = pos;
    
    // Weather.getCoords: get geolocated coordinates if none manually provided.
    this.getCoords = function() {
        
        var coordsPromise = new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    pos.lat = position.coords.latitude;
                    pos.lon = position.coords.longitude;
                },
                function(positionError) {
                    alert(positionError.message);
                },
                {
                    enableHighAccuracy: true
                }
            );            
        });
        
        coordsPromise.then(function(value) {
            alert(pos.lat + ' ' + pos.lon);
        });

    }
    
    this.getURL = function() {
        return 'http://api.openweathermap.org/data/2.5/weather?lat='+pos.lat+'&lon='+pos.lon+'&APPID='+WEATHERKEY;
    }
    
    this.getData = function() {
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
            var data = this.response;
            _self.populateFields(data);
        }
        xhr.open('GET', this.getURL(), true);
        xhr.send();
    }
    
    this.populateFields = function(data) {
        data = JSON.parse(data);
        
        console.log(data);
        
        var name = {'name': data.name};
        var temps = this.getTemps(data);
        var wind = this.getWind(data);
        var clouds = this.getClouds(data);
        var visibility = this.getVisibility(data);
        
        var fields = {
            'name': data.name, 
            'humidity': data.main.humidity,
            'pressure': data.main.pressure,
            'visibility': visibility,
            ...temps, 
            ...wind, 
            ...clouds            
        };

        console.log(fields);
        
        for (var field in fields) {
            //document.querySelector('.weather-'+field).textContent = fields[field];
        }
        
        /*var node = document.createElement('div');
        var textNode = document.createTextNode(fields);
        node.appendChild(textNode);
        
        document.body.appendChild(node);*/
        
        document.title = fields.name + ' ' + fields.c + 'C / ' + fields.f + 'F';
        
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
        document.querySelector('.weather-pressure').textContent = fields.pressure + ' hPa';
        
        document.querySelector('.weather-visibility').textContent = fields.visibility.km + 'km / ' + fields.visibility.mi + ' mi';
    }
    
    this.parseObj = function(obj) {
        var arr = [];
        for (el in obj) {
            arr.push(el + ' ' + obj[el]);
        }
        return arr.join('<br/>');
    }
    
    this.getTemps = function(data) {
        var tc = data.main.temp - 273.15;
        var tf = tc * 1.8 + 32;
        
        tc = Math.round(tc * 10) / 10;
        tf = Math.round(tf * 10) / 10;
        
        return {'c': tc, 'f': tf};
    }
    
    this.getWind = function(data) {
        var wk = data.wind.speed;
        var wm = Math.round(10 * wk / 1.6) / 10;

        var r = data.wind.deg;
        var rdirArr = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'SWW', 'W', 'WNW', 'NW', 'NNW'];
        var rdir = rdirArr[Math.ceil(14 * r / 360)];
        
        return {'kph': wk, 'mph': wm, 'r': r, 'rdir': rdir};
    }
    
    this.getClouds = function(data) {
        return {'clouds': data.clouds.all};
    }
    
    this.getVisibility = function(data) {
        var k = Math.round(10 * data.visibility / 1000) / 10;
        var mi = Math.round(10 * data.visibility / 1600) / 10;
        return {'km': k, 'mi': mi};
    }
}

window.onload = function() {
    var lat = 40.1;
    var lon = -83.11;
    
    var weather = new Weather({lat: lat, lon: lon});
    //weather.getCoords();
    weather.getData();
}