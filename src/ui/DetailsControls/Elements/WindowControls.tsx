import React, { useState, useEffect } from 'react';
import { ActionIcon, NumberInput, Select, Slider } from '@mantine/core';
import { useStore } from '@/stores/EditorStore';
import { Wall } from '@/2d/editor/objects/Walls/Wall';
import { Trash, ArrowAutofitWidth, ArrowAutofitHeight, ArrowMoveUp } from 'tabler-icons-react';
import { WallConfig, WallType, wallTypeConfig } from '@/2d/editor/objects/Walls/config';

import {
    DoorOrientation,
    doorOrientationConfig,
    DoorOrientationObject,
    DoorType,
    doorTypeConfig,
    DoorTypeObject,
    doorWidthConfig,
    DoorWidthObject,
} from '@/2d/editor/objects/Furnitures/Door/config';
import { Door } from '@/2d/editor/objects/Furnitures/Door/Door';
import { WindowType, windowTypeConfig, WindowTypeObject } from '@/2d/editor/objects/Furnitures/Window/config';
import { WindowElement } from '@/2d/editor/objects/Furnitures/Window/Window';
import {
    MAX_WINDOW_BOTTOM,
    MAX_WINDOW_HEIGHT,
    MAX_WINDOW_WIDTH,
    MIN_WINDOW_BOTTOM,
    MIN_WINDOW_HEIGHT,
    MIN_WINDOW_WIDTH,
} from '@/2d/editor/objects/Furnitures/Window/constants';

const doorTypeOptions = Object.values(windowTypeConfig)
    .reverse()
    .map((window: WindowTypeObject) => ({
        label: window.label,
        value: window.type.toString(),
    }));

const windowWidthOptions = [
    { value: MIN_WINDOW_WIDTH, label: `${MIN_WINDOW_WIDTH}cm` },
    {
        value: MIN_WINDOW_WIDTH + (MAX_WINDOW_WIDTH - MIN_WINDOW_WIDTH) * 0.25,
        label: `${Math.floor((MAX_WINDOW_WIDTH - MIN_WINDOW_WIDTH) * 0.25)}cm`,
    },
    {
        value: MIN_WINDOW_WIDTH + (MAX_WINDOW_WIDTH - MIN_WINDOW_WIDTH) * 0.5,
        label: `${Math.floor((MAX_WINDOW_WIDTH - MIN_WINDOW_WIDTH) * 0.5)}cm`,
    },
    {
        value: MIN_WINDOW_WIDTH + (MAX_WINDOW_WIDTH - MIN_WINDOW_WIDTH) * 0.75,
        label: `${Math.floor((MAX_WINDOW_WIDTH - MIN_WINDOW_WIDTH) * 0.75)}cm`,
    },
    { value: MAX_WINDOW_WIDTH, label: `${MAX_WINDOW_WIDTH}cm` },
];

const windowHeightOptions = [
    { value: 0, label: `${MIN_WINDOW_HEIGHT}cm` },
    {
        value: MIN_WINDOW_HEIGHT + (MAX_WINDOW_HEIGHT - MIN_WINDOW_HEIGHT) * 0.33,
        label: `${Math.floor((MAX_WINDOW_HEIGHT - MIN_WINDOW_HEIGHT) * 0.33)}cm`,
    },
    {
        value: MIN_WINDOW_HEIGHT + (MAX_WINDOW_HEIGHT - MIN_WINDOW_HEIGHT) * 0.66,
        label: `${Math.floor((MAX_WINDOW_HEIGHT - MIN_WINDOW_HEIGHT) * 0.66)}cm`,
    },
    { value: MAX_WINDOW_HEIGHT, label: `${MAX_WINDOW_HEIGHT}cm` },
];

const windowBottomOptions = [
    { value: 0, label: `${MIN_WINDOW_BOTTOM}cm` },
    {
        value: MIN_WINDOW_BOTTOM + (MAX_WINDOW_BOTTOM - MIN_WINDOW_BOTTOM) * 0.33,
        label: `${Math.floor((MAX_WINDOW_BOTTOM - MIN_WINDOW_BOTTOM) * 0.33)}cm`,
    },
    {
        value: MIN_WINDOW_BOTTOM + (MAX_WINDOW_BOTTOM - MIN_WINDOW_BOTTOM) * 0.66,
        label: `${Math.floor((MAX_WINDOW_BOTTOM - MIN_WINDOW_BOTTOM) * 0.66)}cm`,
    },
    { value: MAX_WINDOW_BOTTOM, label: `${MAX_WINDOW_BOTTOM}cm` },
];

const WindowControls = ({}: any) => {
    const { focusedElement, setFocusedElement } = useStore();

    const element = focusedElement as WindowElement;

    const [details, setDetails] = useState({
        type: element.type,
        length: element.length,
        height: element.height,
        bottom: element.bottom,
    });

    const handleRemove = () => {
        focusedElement?.delete();
        setFocusedElement(null);
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Delete') handleRemove();
        };
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [focusedElement]);

    const handleChangeWindowType = (type: WindowType) => {
        element.setType(type);

        setDetails((prevDetails) => ({ ...prevDetails, type }));
    };

    const handleUpdate = (type: 'length' | 'height' | 'bottom', value: number) => {
        if (type === 'length') {
            element.setLength(value);
            setDetails((prevDetails) => ({ ...prevDetails, length: value }));
        }

        if (type === 'height' || type === 'bottom') {
            element[type] = value;

            setDetails((prevDetails) => ({ ...prevDetails, [type]: value }));
        }
    };

    return (
        <div>
            <h2 className="text-base font-medium my-0 -mt-2">Okno</h2>

            {/* <div className="mt-4">
                <NumberInput
                    label="Długość"
                    description="Długość ściany (cm)"
                    value={details.length}
                    onChange={(value) => handleUpdate('length', +value)}
                />
            </div> */}

            <div className="mt-4 ">
                <Select
                    label="Typ"
                    data={doorTypeOptions}
                    value={element.type.toString()}
                    onChange={(val) => val && handleChangeWindowType(+val)}
                />
            </div>

            <div className="mt-4">
                <label className="flex items-center gap-2 text-sm font-semibold">
                    <ArrowAutofitWidth size={20} /> Szerokość
                </label>
                <div className="mt-2 pl-1 pr-3">
                    <Slider
                        color="blue"
                        size="lg"
                        showLabelOnHover={false}
                        label={(value) => `${value}cm`}
                        step={5}
                        min={MIN_WINDOW_WIDTH}
                        max={MAX_WINDOW_WIDTH}
                        marks={windowWidthOptions}
                        value={element.length}
                        onChange={(value) => handleUpdate('length', +value)}
                    />
                </div>
            </div>

            <div className="mt-10">
                <label className="flex items-center gap-2 text-sm font-semibold">
                    <ArrowAutofitHeight size={20} />
                    Wysokość
                </label>
                <div className="mt-2 pl-1 pr-3">
                    <Slider
                        color="blue"
                        size="lg"
                        showLabelOnHover={false}
                        label={(value) => `${value}cm`}
                        step={5}
                        min={MIN_WINDOW_HEIGHT}
                        max={MAX_WINDOW_HEIGHT}
                        marks={windowHeightOptions}
                        value={element.height}
                        onChange={(value) => handleUpdate('height', +value)}
                    />
                </div>
            </div>

            <div className="mt-10">
                <label className="flex items-center gap-2 text-sm font-semibold">
                    <ArrowMoveUp size={20} /> Odległość od ziemi
                </label>
                <div className="mt-2 pl-1 pr-3">
                    <Slider
                        color="blue"
                        size="lg"
                        showLabelOnHover={false}
                        label={(value) => `${value}cm`}
                        step={5}
                        min={MIN_WINDOW_BOTTOM}
                        max={MAX_WINDOW_BOTTOM}
                        marks={windowBottomOptions}
                        value={element.bottom}
                        onChange={(value) => handleUpdate('bottom', +value)}
                    />
                </div>
            </div>

            <div className="mt-10">
                <div className="flex gap-2 items-center">
                    <ActionIcon onClick={handleRemove} size={32} variant="default" aria-label="ActionIcon with delete">
                        <Trash className="w-5 h-5 text-red-600" />
                    </ActionIcon>
                    <span className="text-xs text-gray-600">(delete)</span>
                </div>
            </div>
        </div>
    );
};

export default WindowControls;
