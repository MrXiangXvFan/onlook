export interface ElementStyle {
    key: string;
    value: string;
    displayName: string;
    type: ElementStyleType;
    group: ElementStyleGroup;

    // Optional depending on types
    options?: string[];
    units?: string[];
    max?: number;
    subGroup?: ElementStyleSubGroup;
}

export enum ElementStyleType {
    Text = 'text', //文本类型
    Dimensions = 'dimensions',
    Number = 'number', //数字输入
    Select = 'select', //下拉选择类型
    Color = 'color', //颜色选择类型
}

export enum ElementStyleGroup {
    Size = 'Size',
    Position = 'Position & Dimensions',
    Layout = 'Layout',
    Style = 'Styles',
    Text = 'Text',
    Effects = 'Effects',
}

export enum ElementStyleSubGroup {
    Corners = 'Corners',
    Margin = 'Margin',
    Padding = 'Padding',
    Border = 'Border',
    Shadow = 'Shadow',
    Display = 'Display',
}
