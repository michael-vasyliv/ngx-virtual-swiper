import { IPositionEvent } from './interfaces';

export const touchPredicate = (e, key: keyof IPositionEvent): number => e && key && e.touches && e.touches[0] && e.touches[0][key];

export const clickPredicate = (e, key: keyof IPositionEvent): number => e && key && e[key];

export const getPositions = (originalEvent): IPositionEvent => {
    const clientX = touchPredicate(originalEvent, 'clientX') || clickPredicate(originalEvent, 'clientX');
    const clientY = touchPredicate(originalEvent, 'clientY') || clickPredicate(originalEvent, 'clientY');
    return { clientX, clientY, originalEvent };
};
