import { makeAutoObservable, reaction } from 'mobx';
import { getGroupedStyles } from '../../styles/group';
import { ElementStyle } from '../../styles/models';
import { ActionManager } from '../action';
import { ElementManager } from '../element';
import { ActionTargetWithSelector, Change } from '/common/actions';
import { DomElement } from '/common/models/element';

export class StyleManager {
    groupedStyles: Record<string, Record<string, ElementStyle[]>> = {};
    childRect: DOMRect = {} as DOMRect;
    parentRect: DOMRect = {} as DOMRect;

    private selectedElementsDisposer: () => void;

    constructor(
        private action: ActionManager,
        private elements: ElementManager,
    ) {
        makeAutoObservable(this);

        this.selectedElementsDisposer = reaction(
            () => this.elements.selected,
            (selectedElements) => this.onSelectedElementsChanged(selectedElements),
        );
    }

    //表单组件改变后，更新元素的样式
    updateElementStyle(style: string, change: Change<string>) {
        //目标元素（正在被改变的元素）
        const targets: Array<ActionTargetWithSelector> = this.elements.selected.map((s) => ({
            webviewId: s.webviewId,
            selector: s.selector,
        }));

        this.action.run({
            type: 'update-style',
            targets: targets,
            style: style,
            change: change,
        });
    }

    private onSelectedElementsChanged(selectedElements: DomElement[]) {
        const selectedEl = selectedElements.length > 0 ? selectedElements[0] : undefined;
        const style = selectedEl?.styles ?? ({} as Record<string, string>);
        this.groupedStyles = getGroupedStyles(style as Record<string, string>);
        this.childRect = selectedEl?.rect ?? ({} as DOMRect);
        this.parentRect = selectedEl?.parent?.rect ?? ({} as DOMRect);
    }

    dispose() {
        this.selectedElementsDisposer();
    }
}
