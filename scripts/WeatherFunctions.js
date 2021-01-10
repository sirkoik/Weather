// getTemps: get min, average, and max temperatures at the moment.
const getTemps = (tempMin, tempAvg, tempMax, metric) => {
    var temps = [tempMin, tempAvg, tempMax];
    var tempNames = ['min', 'avg', 'max'];
    var tempsOut = {};
    
    for (var x = 0; x < temps.length; x++) {
        var t = getTemp(temps[x], metric);
        
        tempsOut[tempNames[x]] = t;
    }

    tempsOut.hue = getTempHue(tempAvg);
            
    return tempsOut;
}

// getFeelsLike: get the "feels like" temperature and an emoji as well.
const getFeelsLike = (tempKelvin, metric) => {
    const t = getTemp(tempKelvin, metric);
    const h = getTempHue(tempKelvin);

    let emoji = '🙂';
    const tc = tempKelvin - 273.15

    if (tc < 10) emoji = '⛄';
    if (tc < -5) emoji = '🥶';
    if (tc > 25) emoji = '🏖';
    if (tc > 30) emoji = '🥵';

    return {t: t, emoji: emoji, hue: h};
}

// getUVI: return a UVI index with color and grade information.
const getUVI = uvi => {
    const grades = ['Low', 'Moderate', 'High', 'Very High', 'Extreme'];
    //const colors = ['#00ff00', '#ffff00', '#ff9900', '#ff0099', '#90c0f0'];
    const hues = [120, 60, 36, 324, 210];
    const emojis = ['😀', '🙂', '😯', '🔥', '☠'];

    let i = 4;
    if (uvi < 11) i = 3;
    if (uvi < 8) i = 2;
    if (uvi < 6) i = 1;
    if (uvi < 3) i = 0;
    
    return {
        uvi: uvi,
        grade: grades[i], 
        hue: hues[i], 
        emoji: emojis[i]
    };
}

// getTemp: convert a kelvin temperature to either metric or imperial.
const getTemp = (tempKelvin, metric) => {
    var tc = tempKelvin - 273.15;
    var tf = tc * 1.8 + 32;

    tc = Math.round(tc * 10) / 10;
    tf = Math.round(tf * 10) / 10;

    return metric? tc + '&deg;C' : tf + '&deg;F';
}

// getTempHue: get a color hue for a temperature (260K = very cold, 320K = very hot)
const getTempHue = tempKelvin => {
    // color range: blue = 260K, red = 320K
    const colorPercent = 1 - (320 - tempKelvin) / 60 // temp in K
    let h = 225 + 30 * colorPercent;
    
    if (tempKelvin < 260) h = 225;
    if (tempKelvin > 320) h = 255;

    return h;
}

// getClouds: get cloud cover in % and the emoji
const getClouds = cloudCover => {
    const cloudEmojis = ['☁', '🌥', '⛅', '🌤', '☀'];
    let cEIndex = 5 - Math.round(cloudCover * 0.05);
    if (cEIndex < 0) cEIndex = 0;
    if (cEIndex >= 4) cEIndex = 4;
    const cloudEmoji = cloudEmojis[cEIndex];

    return {cloudCover: cloudCover, emoji: cloudEmoji};
}    
    
const getWind = (windData, metric) => {
    const speedkmh = windData.speed * 3.6;
    const speed = metric? Math.round(10 * speedkmh) / 10 + 'km/h' : Math.round(10 * speedkmh / 1.6) / 10 + 'mph';

    const wind = {
        speed: speed
    };

    if (windData.deg) {
        const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'SWW', 'W', 'WNW', 'NW', 'NNW'];
        const direction = directions[Math.ceil(14 * windData.deg / 360)];
        
        wind.angle = windData.deg;
        wind.direction = direction;
    }

    if (windData.gust) {
        const gustSpeedkmh = windData.speed * 3.6;
        const gustSpeed = metric? Math.round(10 * gustSpeedkmh) / 10 + 'km/h' : Math.round(10 * gustSpeedkmh / 1.6) / 10 + 'mph';
        wind.gustSpeed = gustSpeed;
    }
        
    return wind;
}

const getHumidityDewPoint = (humidity, dewPointData, metric) => {
    const emojis = ['🌵', '💧', '💧', '💧', '🚿'];
    let i = Math.round(humidity * 0.05);
    if (i > 4) i = 4;
    const emoji = emojis[i];

    const dewPoint = getTemp(dewPointData, metric);

    return {humidity: humidity + '%', emoji: emoji, dewPoint: dewPoint};
}

// getPressure: Get pressure in various units.
const getPressure = (pressureData, metric) => {
    const hPa  = pressureData;
    const psi  = Math.round(hPa * 0.0145037738 * 10) / 10;
    const atm  = Math.round(hPa * 0.00098692326671601 * 10) / 10;
    const mmhg = Math.round(hPa * 0.75006157584566 * 10) / 10;

    const pressure = metric? hPa + ' hPa' : psi + ' psi';

    return {
        pressure: pressure,
        hPa: hPa, 
        psi: psi, 
        atm: atm, 
        mmhg: mmhg
    };
}

// getVisibility: Get visibility forecast.
const getVisibility = (visibility, metric) => {
    var k = Math.round(10 * visibility / 1000) / 10;
    var mi = Math.round(10 * visibility / 1600) / 10;

    return metric? k + ' km': mi + ' mi';
}

const getRain = rain => {
    return '1h: ' + rain.rain1h + 'mm\n' + '3h:' + rain.rain3h;
}

const getSnow = snow => {
    return '1h: ' + snow.snow1h + 'mm\n' + '3h:' + snow.snow3h;
}

const getWeatherTypes = weather => {
    const weatherTypes = [];

    weather.map((el, i) => {
        weatherTypes.push('<div>' + el.main + ': ' + el.description + '</div>');
    })

    return weatherTypes;
}

const getSun = sys => {
    const rise = sys.sunrise;
    const set = sys.sunset;
    
    var dayPct = (set - rise) / 86400;
    
    var daylight = Math.round(1000 * dayPct) / 10;
    var daylightHrs = Math.round(10 * 24 * dayPct) / 10;
    
    var night = 100 - daylight;
    var nightHrs = Math.round(10 * 24 * (1-dayPct)) / 10;
    
    return {
        sunrise: formatTime(rise, true), 
        sunriseStamp: rise,
        sunset: formatTime(set, true),
        sunsetStamp: set,
        daylight: daylight,
        daylightHrs: daylightHrs,
        night: night,
        nightHrs: nightHrs
    };
}

// formatDate: format a locale-based date
const formatDate = (ts, unix, noYear) => {
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

// formatTime: format a locale-based time
const formatTime = (ts, unix) => {
    ts = unix? ts * 1000 : ts;

    return new Date(ts).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
}

//export default WeatherFunctions;
export { 
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
};