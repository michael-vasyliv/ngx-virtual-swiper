import { IPositionEvent } from './position-event';

const getFirstTouch = (e, key: keyof IPositionEvent): number => e && key && e.touches && e.touches[0] && e.touches[0][key];

export const getClickPositions = (event): IPositionEvent => {
    const clientX = event.clientX;
    const clientY = event.clientY;
    return { clientX, clientY };
};

export const getTouchPositions = (event): IPositionEvent => {
    const clientX = getFirstTouch(event, 'clientX');
    const clientY = getFirstTouch(event, 'clientY');
    return { clientX, clientY };
};

export const isNumber = x => typeof x === 'number' && !isNaN(x);
