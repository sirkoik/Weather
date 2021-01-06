const target = new EventTarget();

const addEvent = (eventName, func) => {
    target.addEventListener(eventName, func);
}

export {target, addEvent};