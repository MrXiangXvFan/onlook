

interface BaseDomElement {
    selector: string; //当前选中的节点id ---唯一标识符。案例："[data-onlook-unique-id="0c6bc166-3562-4cc5-8ae3-f0bda0db5d85"]"
    rect: DOMRect; //节点信息 包含xy轴位置，宽高等
    encodedTemplateNode?: string;
}

export interface DomElement extends BaseDomElement {
    tagName: string;//当前节点的标签类型
    styles: Record<string, string>;//当前节点的样式信息
    parent?: ParentDomElement;//父节点相关信息
}

export interface ParentDomElement extends BaseDomElement {}

export interface WebViewElement extends DomElement {
    webviewId: string; //webview id
}

export interface ElementPosition {
    x: number;
    y: number;
}
