import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { ElementStyle, ElementStyleSubGroup, ElementStyleType } from '@/lib/editor/styles/models';
import { observer } from 'mobx-react-lite';
import { useEditorEngine } from '..';
import AutoLayoutInput from './inputs/AutoLayoutInput';
import BorderInput from './inputs/BorderInput';
import DisplayInput from './inputs/DisplayInput';
import NestedInputs from './inputs/NestedInputs';
import ColorInput from './inputs/primitives/ColorInput';
import NumberUnitInput from './inputs/primitives/NumberUnitInput';
import SelectInput from './inputs/primitives/SelectInput';
import TextInput from './inputs/primitives/TextInput';
import TagDetails from './inputs/TagDetails';

const ManualTab = observer(() => {
    const editorEngine = useEditorEngine();

    function getSingleInput(elementStyle: ElementStyle) {
        if (elementStyle.type === ElementStyleType.Select) {
            return <SelectInput elementStyle={elementStyle} />;
        } else if (elementStyle.type === ElementStyleType.Dimensions) {
            return <AutoLayoutInput elementStyle={elementStyle} />;
        } else if (elementStyle.type === ElementStyleType.Color) {
            return <ColorInput elementStyle={elementStyle} />;
        } else if (elementStyle.type === ElementStyleType.Number) {
            return <NumberUnitInput elementStyle={elementStyle} />;
        } else {
            return <TextInput elementStyle={elementStyle} />;
        }
    }

    //获取不同类型的表单项（输入框）
    function getNestedInput(elementStyles: ElementStyle[], subGroupKey: ElementStyleSubGroup) {
        if (
            [
                ElementStyleSubGroup.Margin,
                ElementStyleSubGroup.Padding,
                ElementStyleSubGroup.Corners,
            ].includes(subGroupKey as ElementStyleSubGroup)
        ) {
            return <NestedInputs elementStyles={elementStyles} />;
        } else if (subGroupKey === ElementStyleSubGroup.Border) {
            return <BorderInput elementStyles={elementStyles} />;
        } else if (subGroupKey === ElementStyleSubGroup.Display) {
            return <DisplayInput elementStyles={elementStyles} />;
        } else {
            return elementStyles.map((elementStyle, i) => (
                <div className={`flex flex-row items-center ${i === 0 ? '' : 'mt-2'}`} key={i}>
                    <p className="text-xs w-24 mr-2 text-start text-text">
                        {elementStyle.displayName}
                    </p>
                    <div className="text-end ml-auto">{getSingleInput(elementStyle)}</div>
                </div>
            ));
        }
    }

    function renderGroupStyles(groupedStyles: Record<string, Record<string, ElementStyle[]>>) {
        console.log(groupedStyles, Object.entries(groupedStyles), 'groupedStylesgroupedStyles');
        //这一层，渲染样式的几种类型，layout/styles/text
        return Object.entries(groupedStyles).map(([groupKey, subGroup]) => (
            <AccordionItem key={groupKey} value={groupKey}>
                <AccordionTrigger>
                    {/* 工具栏标题  todo*/}
                    <h2 className="text-xs font-semibold">{groupKey}</h2>
                </AccordionTrigger>
                <AccordionContent>
                    {/* 工具栏 输入区域  todo*/}
                    {groupKey === 'Text' && (
                        <>
                            <TagDetails tagName={editorEngine.elements.selected[0].tagName} />
                        </>
                    )}
                    {console.log(subGroup, Object.entries(subGroup), 'subGroupsubGroup')}
                    {/* //这一层，渲染每种类型下的几种属性 */}
                    {/* 比如 styles 下的color，border等 */}
                    {Object.entries(subGroup).map(([subGroupKey, elementStyles]) => (
                        <div key={subGroupKey}>
                            {console.log(elementStyles, 'elementStyles', subGroupKey)}
                            {getNestedInput(elementStyles, subGroupKey as ElementStyleSubGroup)}
                        </div>
                    ))}
                </AccordionContent>
            </AccordionItem>
        ));
    }

    return (
        editorEngine.elements.selected.length > 0 && (
            <Accordion
                className="px-4"
                type="multiple"
                defaultValue={[...Object.keys(editorEngine.style.groupedStyles), 'Custom']}
            >
                {renderGroupStyles(editorEngine.style.groupedStyles)}
            </Accordion>
        )
    );
});

export default ManualTab;
