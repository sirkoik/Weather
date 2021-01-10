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

const round2 = (num, places) => {
    if (!places) return Math.round(num);

    return Math.round(num * 10 * places) / (10 * places);
}

export { qs, hide, unhide, setHTML };
export { round2 };