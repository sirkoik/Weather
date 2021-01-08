const target = new EventTarget();

const state = {
    
}

const addEvent = (eventName, func) => {
    target.addEventListener(eventName, func);
}

export {target, addEvent, state};