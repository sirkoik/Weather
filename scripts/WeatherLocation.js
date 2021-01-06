import { qs, hide, unhide } from './utility.js';
import { addEvent, target } from './Events.js';

class WeatherLocation {
    // default location data
    locData = {
        latitude: 51.5, 
        longitude: 0.128,
        place: 'London'
    };

    constructor() {

    }

    // Get location data on load.
    getFirst = () => {
        if (1 == 2) {
            // autoload card.
            // right now, it always shows the location popup information.
        } else {
            this.locPopup();
        }
    }

    // show location popup container
    locPopup = () => {
        unhide('#weather-app');
        unhide('.popup-container');

        if (qs('#location-autodetect').getAttribute('click-listener') !== 'true') {
            qs('#location-autodetect').addEventListener('click', this.browserLocationDetect);
            qs('#location-autodetect').setAttribute('click-listener', 'true');
        }
    }

    // try to autodetect location, and handle user decline or other error.
    browserLocationDetect = () => {
        const getCoords = new Promise(
        (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                position => resolve(position),
                positionError => reject(positionError),
                {
                    enableHighAccuracy: true
                }
            );
        })
        .then(position => {
            this.locData.latitude = position.coords.latitude;
            this.locData.longitude = position.coords.longitude;
            
            // dispatch an event to Weather indicating that user position data is available.
            target.dispatchEvent(new CustomEvent('userPositionSupplied', {detail: this.locData}));
        })
        .catch(error => {
            const errorType = Object.prototype.toString.apply(error);
            if (errorType === '[object GeolocationPositionError]' && error.code === 1) {
                alert(
                    'It looks like you declined to share your location. Nothing wrong with that - who likes to be tracked?' +
                    '\n\nTo use the weather app, you can enter your location manually. If you enter your city name or zip code, the location data will be vague enough to protect your privacy but still relevant enough to provide weather information.' +
                    '\n\nOr, you could type in a different location to get weather for another place.'
                );
                this.showLocPopup = true;
            } else {
                alert('General error: ' + error.message);
            }
        });
    }

    // show the location options popup.
    static set showLocPopup(show) {
        if (show) {
            unhide('#weather-app');
            unhide('.popup-container');
            hide('.loading-container');
        } else {
            hide('.popup-container');
        }
    }    
}

export default WeatherLocation;