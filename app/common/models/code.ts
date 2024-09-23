import { InsertedElement, MovedElementWithTemplate } from './element/domAction';
import { TemplateNode } from './element/templateNode';

export interface CodeDiffRequest {
    selector: string;
    templateNode: TemplateNode;
    insertedElements: InsertedElement[];
    movedElements: MovedElementWithTemplate[];
    attributes: Record<string, string>;
}

export interface CodeDiff {
    original: string; //旧的dom节点
    generated: string; //新的dom节点
    path: string;
}
