import { constructChangeCurried } from '@/lib/editor/styles/inputs';
import { ElementStyle } from '@/lib/editor/styles/models';
import { parsedValueToString, stringToParsedValue } from '@/lib/editor/styles/numberUnit';
import { appendCssUnit } from '@/lib/editor/styles/units';
import { useEditorEngine } from '@/routes/project';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';

/**
 *  工具栏里的 input输入框 ，作用于 margin，padding等
 */
const TextInput = observer(
    ({
        elementStyle,
        onValueChange,
    }: {
        elementStyle: ElementStyle;
        onValueChange?: (key: string, value: string) => void;
    }) => {
        const editorEngine = useEditorEngine();
        const [localValue, setLocalValue] = useState(elementStyle.value); //当前页面映射的数据，该state只作用于当前组件的视图
        const constructChange = constructChangeCurried(elementStyle.value);

        useEffect(() => {
            setLocalValue(elementStyle.value);
        }, [elementStyle]);

        function shouldSetTransaction() {
            const key = elementStyle.key.toLowerCase();
            return !(
                key === 'width' ||
                key === 'height' ||
                key.includes('padding') ||
                key.includes('margin')
            );
        }

        const onFocus = () => {
            if (shouldSetTransaction()) {
                editorEngine.history.startTransaction();
            }
        };

        const onBlur = () => {
            if (shouldSetTransaction()) {
                editorEngine.history.commitTransaction();
            }
        };

        const sendStyleUpdate = (newValue: string) => {
            setLocalValue(newValue);
            console.log(editorEngine,"editorEngineeditorEngine")
            editorEngine.style.updateElementStyle(
                elementStyle.key,
                constructChange(appendCssUnit(newValue)),
            );
            onValueChange && onValueChange(elementStyle.key, newValue);
        };

        const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.currentTarget.value;
            sendStyleUpdate(newValue);
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                e.currentTarget.blur();
                return;
            }

            let step = 1;
            if (e.shiftKey) {
                step = 10;
            }

            //监听上下按钮，进行数值的增减
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
                console.log(localValue,"localValue")
                const [parsedNumber, parsedUnit] = stringToParsedValue(localValue);
                console.log(parsedNumber,parsedUnit,"parsedUnitparsedUnit")
                const newNumber = (parsedNumber + (e.key === 'ArrowUp' ? step : -step)).toString();
                const newValue = parsedValueToString(newNumber, parsedUnit);
                sendStyleUpdate(newValue);
            }
        };

        return (
            <input
                type="text"
                className={`w-full p-[6px] text-xs px-2 rounded border-none text-active bg-bg/75 text-start focus:outline-none focus:ring-0 appearance-none`}
                placeholder="--"
                value={localValue}
                onChange={handleInput}
                onFocus={onFocus}
                onBlur={onBlur}
                onKeyDown={handleKeyDown}
            />
        );
    },
);

export default TextInput;
