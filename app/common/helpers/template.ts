import { compressSync, decompressSync, strFromU8, strToU8 } from 'fflate';
import { EditorAttributes } from '../constants';
import { TemplateNode } from '../models/element/templateNode';

export function getTemplateNode(element: Element): TemplateNode | undefined {
    const encodedTemplateNode = element.getAttribute(EditorAttributes.DATA_ONLOOK_ID);
    console.log(encodedTemplateNode, 'encodedTemplateNodeencodedTemplateNod2212');
    console.log(element, 'encodedTemplateNodeencodedTemplateNodeelementelement3333');
    if (!encodedTemplateNode) {
        return;
    }
    const templateNode = decode(encodedTemplateNode);
    console.log(
        templateNode,
        'encodedTemplateNodeencodedTemplateNodeelementelementtemplateNodetemplateNode',
    );
    return templateNode;
}

export function encode(templateNode: TemplateNode) {
    const buffer = strToU8(JSON.stringify(templateNode));
    const compressed = compressSync(buffer);
    const binaryString = Array.from(new Uint8Array(compressed))
        .map((byte) => String.fromCharCode(byte))
        .join('');
    const base64 = btoa(binaryString);
    return base64;
}

export function decode(encodedTemplateNode: string): TemplateNode {
    console.log(encodedTemplateNode, 'encodedTemplateNode!!!');
    //编译成二进制数据
    const buffer = new Uint8Array(
        atob(encodedTemplateNode)
            .split('')
            .map((c) => c.charCodeAt(0)),
    );
    console.log(buffer, 'bufferbuffer');
    //解压二进制数据
    const decompressed = decompressSync(buffer);
    console.log(decompressed, 'decompresseddecompressed');
    //将二进制数据转换为字符串，
    const JsonString = strFromU8(decompressed);
    console.log(JsonString, 'JsonStringJsonStringJsonString');
    //解析为对象
    const templateNode = JSON.parse(JsonString) as TemplateNode;
    console.log(templateNode, 'JSON.parse(JsonString)');
    return templateNode;
}

export function compareTemplateNodes(node1: TemplateNode, node2: TemplateNode): number {
    if (node1.startTag.start.line < node2.startTag.start.line) {
        return -1;
    } else if (node1.startTag.start.line > node2.startTag.start.line) {
        return 1;
    } else {
        if (node1.startTag.start.column < node2.startTag.start.column) {
            return -1;
        } else if (node1.startTag.start.column > node2.startTag.start.column) {
            return 1;
        } else {
            return 0;
        }
    }
}

export function areTemplateNodesEqual(node1: TemplateNode, node2: TemplateNode): boolean {
    return (
        node1.path === node2.path &&
        node1.component === node2.component &&
        compareTemplateNodes(node1, node2) === 0
    );
}
