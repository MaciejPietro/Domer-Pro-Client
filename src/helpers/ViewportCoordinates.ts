import { main } from '../2d/EditorRoot';

import { useStore } from '../stores/EditorStore';

export function viewportX(x: number, customSnap?: any) {
    let newX = x / main.scale.x + main.corner.x;
    const shouldSnap = customSnap ?? useStore.getState().snap;

    if (shouldSnap) {
        newX = snap(newX);
    }

    return Math.trunc(newX);
}

export function viewportY(y: number, customSnap?: any) {
    let newY = y / main.scale.y + main.corner.y;
    const shouldSnap = customSnap ?? useStore.getState().snap;

    if (shouldSnap) {
        newY = snap(newY);
    }

    return Math.trunc(newY);
}

export function snap(val: number) {
    const rest = val % 10;
    const cat = val - rest;

    if (rest < 5) {
        return cat;
    }

    return cat + 10;
}
