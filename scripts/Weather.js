function Weather() {
    var _self = this;
        
    this.getData = function(url) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            var data = this.response;
            _self.populateFields(data);
        }
        xhr.open('GET', url, true);
        xhr.send();
    }
    
    this.populateFields = function(data) {
        console.log(data);
        data = JSON.parse(data);

        
        //return false;
        
        var temps = this.getTemps(data);
        var wind = this.getWind(data);
        
        var fields = {...temps, ...wind};

        console.log(fields);
        
        for (var field in fields) {
            //document.querySelector('.weather-'+field).textContent = fields[field];
        }
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
        
        return {'kph': wk, 'mph': wm, 'r': r};
    }
}

window.onload = function() {
    var url = 'http://api.openweathermap.org/data/2.5/weather?id=5152333&APPID=6b80ba80e350de60e41ab0ccf87ad068';
    var weather = new Weather();
    weather.getData(url);
}

/*$.ajax({
    url: 'http://api.openweathermap.org/data/2.5/weather?class=5152333&APPclass=6b80ba80e350de60e41ab0ccf87ad068',
    jsonp: 'callback',
    success: function(data) {
        console.log(data);

        tc = data.main.temp - 273.15;
        tf = tc * 1.8 + 32;
        $('#name').html(data.name);
        $('#temp').html(Math.round(tc * 10) / 10 + "&deg; C / " + Math.round(tf * 10) / 10 + "&deg; F");

        wk = data.wind.speed;
        wm = Math.round(10 * wk / 1.6) / 10;
        r = data.wind.deg;
        $('#wind').html(data.wind.speed + ' Km/h / ' + wm + ' MPH <div style="display:inline-block;width:10px;transform:rotate(' + r + 'deg)">^</div>');

        $('#clouds').html(data.clouds.all + '% clouds');

        var rain = data.rain? data.rain : 'No rain';
        $('#rain').html(rain);

        var snow = data.snow? data.snow : 'No snow';
        $('#snow').html(snow);
    }
*/
