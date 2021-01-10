import { loadState } from './Events.js';
import * as Weather from './Weather.js';
import { getFirst } from './WeatherLocation.js';

const run = () => {
    loadState();
    getFirst();
}

run();

export default run;