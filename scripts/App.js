import Weather from './Weather.js';
import WeatherLocation from './WeatherLocation.js';

const run = () => {
    const weather = new Weather();
    const weatherLoc = new WeatherLocation();

    weatherLoc.getFirst();
}

run();

export default run;