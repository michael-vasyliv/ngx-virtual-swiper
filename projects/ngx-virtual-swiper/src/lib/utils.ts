import { IPositionEvent } from './position-event';

const getFirstTouch = (e, key: keyof IPositionEvent): number => e?.touches?.[0]?.[key];

export const getClickPositions = (e): IPositionEvent => {
    const clientX = e.clientX;
    const clientY = e.clientY;
    return { clientX, clientY };
};

export const getTouchPositions = (e): IPositionEvent => {
    const clientX = getFirstTouch(e, 'clientX');
    const clientY = getFirstTouch(e, 'clientY');
    return { clientX, clientY };
};

export const isNumber = x => typeof x === 'number' && !isNaN(x);
