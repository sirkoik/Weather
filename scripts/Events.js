const target = new EventTarget();

let state = {
    persist: false
}

const addEvent = (eventName, func) => {
    target.addEventListener(eventName, func);
}

// setState: set a property in the state and then save it to localStorage.
const setState = (prop, val) => {
    state[prop] = val;
    if (state.persist) saveState();
}

// getState: get a property from the state
const getState = prop => {
    return state[prop];
}

const saveState = () => {
    localStorage.setItem('sirkoik-weather-data', JSON.stringify(state));
}

const loadState = () => {
    state = JSON.parse(localStorage.getItem('sirkoik-weather-data')) || {};
}

export { target, addEvent };
export { state, loadState, saveState, setState, getState };