import { ClickRect, HoverRect, InsertRect, ParentRect } from './rect';
import { querySelectorCommand } from '/common/helpers';

export class OverlayManager {
    overlayContainer: HTMLElement | undefined; //这个是 ，webview在被点击的时候，出现元素信息的框（el的ref 的current）
    hoverRect: HoverRect;
    insertRect: InsertRect;
    clickedRects: ClickRect[];
    parentRect: ParentRect;
    scrollPosition: { x: number; y: number } = { x: 0, y: 0 };

    constructor() {
        this.hoverRect = new HoverRect();
        this.insertRect = new InsertRect();
        this.parentRect = new ParentRect();
        this.clickedRects = [];
        this.bindMethods();
    }

    //初始化把元素信息框ref映射到当前类中
    setOverlayContainer = (container: HTMLElement) => {
        this.overlayContainer = container;
        this.appendRectToPopover(this.hoverRect.element);
        this.appendRectToPopover(this.insertRect.element);
        this.appendRectToPopover(this.parentRect.element);
    };

    bindMethods = () => {
        this.setOverlayContainer = this.setOverlayContainer.bind(this);
        this.updateHoverRect = this.updateHoverRect.bind(this);
        this.updateInsertRect = this.updateInsertRect.bind(this);
        this.updateParentRect = this.updateParentRect.bind(this);
        this.hideHoverRect = this.hideHoverRect.bind(this);
        this.showHoverRect = this.showHoverRect.bind(this);
        this.removeHoverRect = this.removeHoverRect.bind(this);
        this.removeClickedRects = this.removeClickedRects.bind(this);
        this.clear = this.clear.bind(this);
    };

    getBoundingRect(selector: string, sourceWebview: Electron.WebviewTag) {
        return sourceWebview.executeJavaScript(
            `${querySelectorCommand(selector)}.getBoundingClientRect().toJSON()`,
            true,
        );
    }

    getComputedStyle(
        selector: string,
        sourceWebview: Electron.WebviewTag,
    ): Promise<CSSStyleDeclaration> {
        return sourceWebview.executeJavaScript(
            `getComputedStyle(${querySelectorCommand(selector)})`,
            true,
        );
    }

    /**
     * 获取当前鼠标点击or悬浮的元素位置信息 top-left
     * @param element  webview
     * @param ancestor  当前悬浮/点击的节点
     * @returns
     */
    getRelativeOffset(element: HTMLElement, ancestor: HTMLElement) {
        let top = 0,
            left = 0;
        while (element && element !== ancestor) {
            // console.log(element,"elementelement")
            // console.log(element.offsetTop,"offsetTop")
            // console.log(element.offsetLeft,"offsetLeft")
            top += element.offsetTop || 0;
            left += element.offsetLeft || 0;
            element = element.offsetParent as HTMLElement;
        }
        // console.log({ top, left }, 'topLeft111');
        return { top, left };
    }

    /**
     * //设置鼠标点击/悬浮 线框所需要展示的位置 left+top
     * @param rect  当前元素
     * @param webview  webview整个视图
     * @returns
     */
    adaptRectFromSourceElement(rect: DOMRect, webview: Electron.WebviewTag) {
        const commonAncestor = this.overlayContainer?.parentElement as HTMLElement;
        const sourceOffset = this.getRelativeOffset(webview, commonAncestor);

        const overlayOffset = this.overlayContainer
            ? this.getRelativeOffset(this.overlayContainer, commonAncestor)
            : { top: 0, left: 0 };

        // console.log(overlayOffset, 'overlayOffsetoverlayOffset');

        const adjustedRect = {
            ...rect, //这个是节点信息
            top: rect.top + sourceOffset.top - overlayOffset.top, //后两个位置信息不详
            left: rect.left + sourceOffset.left - overlayOffset.left, //后两个位置信息不详
        };
        // console.log(adjustedRect, 'adjustedRect22');
        // console.log({ top: rect.top, left: rect.left }, 'adjustedRect11');
        // console.log({ top: sourceOffset.top, left: sourceOffset.left }, 'adjustedRect33');
        return adjustedRect;
    }

    appendRectToPopover = (rect: HTMLElement) => {
        if (this.overlayContainer) {
            this.overlayContainer.appendChild(rect);
        }
    };

    clear = () => {
        this.removeParentRect();
        this.removeHoverRect();
        this.removeClickedRects();
    };

    addClickRect = (
        rect: DOMRect,
        style: Record<string, string> | CSSStyleDeclaration,
        isComponent?: boolean,
    ) => {
        const clickRect = new ClickRect();
        this.appendRectToPopover(clickRect.element);
        this.clickedRects.push(clickRect);
        clickRect.render(
            {
                width: rect.width,
                height: rect.height,
                top: rect.top,
                left: rect.left,
                padding: style.padding,
                margin: style.margin,
            },
            isComponent,
        );
    };

    updateParentRect = (el: HTMLElement) => {
        if (!el) {
            return;
        }
        const rect = el.getBoundingClientRect();
        this.parentRect.render(rect);
    };

    //move到不同节点的时候,更新那个节点的框框
    updateHoverRect = (rect: DOMRect, isComponent?: boolean) => {
        this.hoverRect.render(rect, isComponent);
    };

    updateInsertRect = (rect: DOMRect) => {
        this.insertRect.render(rect);
    };

    hideHoverRect = () => {
        this.hoverRect.element.style.display = 'none';
    };

    showHoverRect = () => {
        this.hoverRect.element.style.display = 'block';
    };

    removeHoverRect = () => {
        this.hoverRect.render({ width: 0, height: 0, top: 0, left: 0 });
    };

    removeInsertRect = () => {
        this.insertRect.render({ width: 0, height: 0, top: 0, left: 0 });
    };

    /**
     *  清除上一个元素信息框
     *  //点击一次之后会有框框表示当前节点的宽高
     *  //第二次点击其他元素需要把上一个元素的框擦掉，这就是擦掉的方法
     */
    removeClickedRects = () => {
        this.clickedRects.forEach((clickRect) => {
            clickRect.element.remove();
        });
        this.clickedRects = [];
    };

    removeParentRect = () => {
        this.parentRect.render({ width: 0, height: 0, top: 0, left: 0 });
    };
}
