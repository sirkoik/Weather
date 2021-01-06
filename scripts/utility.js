const qs = (query) => {
    return document.querySelector(query);
}

const hide = query => {
    document.querySelector(query).classList.add('hide');
}

const unhide = query => {
    document.querySelector(query).classList.remove('hide');
}

const setHTML = (query, html) => {
    document.querySelector(query).innerHTML = html;
}

export {qs, hide, unhide, setHTML};