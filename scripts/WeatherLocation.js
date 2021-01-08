import { qs, hide, unhide } from './utility.js';
import { addEvent, target, state } from './Events.js';

// default location data
const location = {
    latitude: 51.5, 
    longitude: 0.128,
    place: 'London'
};

// Get location data on load.
// note that navigator.permissions, which could be used to autodetect 
// permissions, is not supported in iOS Safari.
const getFirst = () => {
    if (1 == 2) {
        //const stored = 
        // autoload card.
        // right now, it always shows the location popup information.
    } else {
        locPopup();
    }
}

// show location popup container
const locPopup = () => {
    unhide('#weather-app');
    unhide('.popup-container');
    state.userPositionIsSupplied = false;

    console.log(qs('#location-autodetect'));

    if (qs('#location-autodetect').getAttribute('click-listener') !== 'true') {
        qs('#location-autodetect').addEventListener('click', browserLocationDetect);
        qs('#location-autodetect').setAttribute('click-listener', 'true');
    }
}

// try to autodetect location, and handle user decline or other error.
const browserLocationDetect = () => {
    //target.dispatchEvent(new CustomEvent('userPositionSupplied', {detail: location}));
    //return false;

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
        location.latitude = position.coords.latitude;
        location.longitude = position.coords.longitude;
        
        // dispatch an event to Weather indicating that user position data is available.
        target.dispatchEvent(new CustomEvent('userPositionSupplied', {detail: location}));
    })
    .catch(error => {alert(error.message);
        const errorType = Object.prototype.toString.apply(error);
        if (errorType === '[object GeolocationPositionError]' && error.code === 1) {
            alert(
                'It looks like you declined to share your location. Nothing wrong with that - who likes to be tracked?' +
                '\n\nTo use the weather app, you can enter your location manually. If you enter your city name or zip code, the location data will be vague enough to protect your privacy but still relevant enough to provide weather information.' +
                '\n\nOr, you could type in a different location to get weather for another place.'
            );
            showLocPopup(true);
        } else {
            alert('General error: ' + error.message);
        }
    });
}

// show the location options popup.
const showLocPopup = show => {
    if (show) {
        unhide('#weather-app');
        unhide('.popup-container');
        hide('.loading-container');
    } else {
        hide('.popup-container');
    }
}

qs('#change-location').addEventListener('click', locPopup);

export { location, getFirst, showLocPopup };