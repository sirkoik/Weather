import { qs, hide, unhide, setHTML } from './utility.js';
import { addEvent, target, state } from './Events.js';

// default location data
const location = {
    latitude: 51.5, 
    longitude: 0.128,
    place: 'London',
    alwaysAutodetect: false
};

const endpointURL = 'https://us1.locationiq.com';
const liq = 'pk.5d8de80cc656acc11d9f866852d7642f';


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

    if (qs('#location-manual').getAttribute('change-listener') !== 'true') {
        qs('#location-manual').addEventListener('keyup', getManualLocation)
        qs('#location-manual').setAttribute('change-listener', 'true');
    }

    if (qs('#location-manual-submit').getAttribute('click-listener') !== 'true') {
        qs('#location-manual-submit').addEventListener('click', setManualLocation)
        qs('#location-manual-submit').setAttribute('click-listener', 'true');
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

        location.place = '';
        
        // get more detailed place info from LocationIQ.
        getPlaceInfo();

        // dispatch an event to Weather indicating that user position data is available.
        //target.dispatchEvent(new CustomEvent('userPositionSupplied', {detail: location}));
    })
    .catch(error => {
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

const getURL = (type, params) => {
    let page = '';

    switch(type) {
        case 'autocomplete': page = 'autocomplete.php'; break;
        case 'reverse': page = 'reverse.php'; break;
    }

    return endpointURL + '/v1/' + page + '?key=' + liq + params;
}

// getPlaceInfo: Get more detailed place info.
// This queries locationIQ for more specific location-related information, like state, country etc.
// It's not strictly needed, and the app will work without it, which is why the event dispatches regardless.
const getPlaceInfo = () => {
    fetch(getURL('reverse', '&lat=' + location.latitude + '&lon=' + location.longitude + '&format=json'))
    .then(data => data.json())
    .then(data => {
        const placeParts = [data.address.city, data.address.state, data.address.country_code].filter(v => v !== 'undefined');
        location.place = placeParts.length > 0? placeParts.join(', ') : '';
    })
    .catch(error => {
        console.log(error);
    })
    .finally(() => {
        // dispatch an event to Weather indicating that user position data is available.
        // this is okay regardless if an error occurs with locationIQ, because locationIQ only provides more specific details about the place.
        target.dispatchEvent(new CustomEvent('userPositionSupplied', {detail: location}));
    });
}


let keyTimeout = 0;
let places = [];
let selectedPlace = 0;
const getManualLocation = event => {
    const text = event.target.value;
    if (text.length < 3) return false;

    clearTimeout(keyTimeout);
    keyTimeout = setTimeout(() => {
        fetch(getURL('autocomplete', '&limit=5&q=' + text))
        .then(data => data.json())
        .then(data => {
            setHTML('.places-list', '');
            places = data.map((v, i) => {
                const el = document.createElement('div');
                el.innerHTML = v.display_name;
                el.setAttribute("placeindex", i);
                qs('.places-list').appendChild(el);
                el.addEventListener('click', populateLocationBox);

                return {
                    name: v.display_name, 
                    address: v.display_address, 
                    latitude: v.lat, 
                    longitude: v.lon
                };
            });
        });
    }, 1000);
}

const populateLocationBox = event => {
    const index = parseInt(event.target.getAttribute('placeindex'));
    selectedPlace = index;

    const place = places[index];
    qs('#location-manual').value = place.name;
}

const manualLocationIsValid = () => {
    return true;
}

// setManualLocation: trigger a user position supplied event after valid manual location data has been supplied.
const setManualLocation = () => {
    const place = places[selectedPlace];
    location.place = place.name;
    location.latitude = place.latitude;
    location.longitude = place.longitude;

    target.dispatchEvent(new CustomEvent('userPositionSupplied', {detail: location}));
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