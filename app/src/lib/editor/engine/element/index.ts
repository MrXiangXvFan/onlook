import { debounce } from 'lodash';
import { makeAutoObservable } from 'mobx';
import { AstManager } from '../ast';
import { OverlayManager } from '../overlay';
import { DomElement, WebViewElement } from '/common/models/element';

/**
 * 节点选中以后，状态更行等都在这里处理
 *  核心组件
 */
export class ElementManager {
    private hoveredElement: WebViewElement | undefined; //当前hover的元素
    private selectedElements: WebViewElement[] = []; //当前选中的元素

    constructor(
        private overlay: OverlayManager,
        private ast: AstManager,
    ) {
        makeAutoObservable(this, {});
    }

    get hovered() {
        return this.hoveredElement;
    }

    get selected() {
        return this.selectedElements;
    }

    mouseover(domEl: DomElement, webview: Electron.WebviewTag) {
        if (!domEl) {
            this.overlay.removeHoverRect();
            this.clearHoveredElement();
            return;
        }
        if (this.hoveredElement && this.hoveredElement.selector === domEl.selector) {
            return;
        }

        const webviewEl: WebViewElement = {
            ...domEl,
            webviewId: webview.id,
        };
        const adjustedRect = this.overlay.adaptRectFromSourceElement(webviewEl.rect, webview);
        const isComponent = this.ast.getInstanceSync(domEl.selector) !== undefined;
        this.overlay.updateHoverRect(adjustedRect, isComponent);
        this.setHoveredElement(webviewEl);
    }

    click(domEls: DomElement[], webview: Electron.WebviewTag) {
        this.overlay.removeClickedRects();
        this.clearSelectedElements();

        const webviewEls: WebViewElement[] = domEls.map((el) => {
            const webviewElement: WebViewElement = {
                ...el,
                webviewId: webview.id,
            };
            return webviewElement;
        });

        for (const webviewEl of webviewEls) {
            const adjustedRect = this.overlay.adaptRectFromSourceElement(webviewEl.rect, webview);
            const isComponent = this.ast.getInstanceSync(webviewEl.selector) !== undefined;
            this.overlay.addClickRect(adjustedRect, webviewEl.styles, isComponent);
            this.addSelectedElement(webviewEl);
        }
    }

    //更新选中的视图
    refreshSelectedElements(webview: Electron.WebviewTag) {
        this.debouncedRefreshClickedElements(webview);
    }

    setHoveredElement(element: WebViewElement) {
        // console.log(element,"hoveredElementhoveredElement")
        this.hoveredElement = element;
    }

    clearHoveredElement() {
        this.hoveredElement = undefined;
    }

    addSelectedElement(element: WebViewElement) {
        this.selectedElements.push(element);
    }

    clearSelectedElement(element: WebViewElement) {
        this.selectedElements = this.selectedElements.filter(
            (el) => el.selector !== element.selector,
        );
    }

    clear() {
        this.hoveredElement = undefined;
        this.selectedElements = [];
    }

    private clearSelectedElements() {
        this.selectedElements = [];
    }

    // 更新选中的节点
    private async undebouncedRefreshClickedElements(webview: Electron.WebviewTag) {
        const clickedElements = this.selected;
        const newClickedRects: {
            adjustedRect: DOMRect;
            computedStyle: CSSStyleDeclaration;
            isComponent?: boolean;
        }[] = [];

        console.log(clickedElements, 'clickedElementsclickedElements');
        for (const element of clickedElements) {
            const rect = await this.overlay.getBoundingRect(element.selector, webview);
            const computedStyle = await this.overlay.getComputedStyle(element.selector, webview);
            const adjustedRect = this.overlay.adaptRectFromSourceElement(rect, webview);
            const isComponent = this.ast.getInstanceSync(element.selector) !== undefined;
            newClickedRects.push({ adjustedRect, computedStyle, isComponent });
        }

        this.overlay.clear();
        newClickedRects.forEach(({ adjustedRect, computedStyle, isComponent }) => {
            this.overlay.addClickRect(adjustedRect, computedStyle, isComponent);
        });
    }
    private debouncedRefreshClickedElements = debounce(this.undebouncedRefreshClickedElements, 10);
}
