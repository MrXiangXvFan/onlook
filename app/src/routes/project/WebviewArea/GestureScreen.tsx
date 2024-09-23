import { EditorMode } from '@/lib/models';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { useEditorEngine } from '..';
import RightClickMenu from '../RightClickMenu';
import { MouseAction } from '/common/models';
import { DomElement, ElementPosition } from '/common/models/element';

interface GestureScreenProps {
    webviewRef: React.RefObject<Electron.WebviewTag>; //webview实例
    setHovered: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * webview在electron的模拟视口
 */
const GestureScreen = observer(({ webviewRef, setHovered }: GestureScreenProps) => {
    const editorEngine = useEditorEngine();

    /**
     * 点击之后选中当前节点
     * @param webview 整个webview视图
     */
    function selectWebview(webview: Electron.WebviewTag) {
        editorEngine.webviews.deselectAll();
        editorEngine.webviews.select(webview);
        editorEngine.webviews.notify();
    }

    /**
     * webview 被点击
     * 备注：和工具栏和左侧dom节点树的交互不在这里 在handleMouseDown里
     * @param e
     * @returns
     */
    function handleClick(e: React.MouseEvent<HTMLDivElement>) {
        console.log('模拟视口被点击');
        const webview = webviewRef.current as Electron.WebviewTag | null;
        if (!webview) {
            return;
        }
        selectWebview(webview);
    }

    function getRelativeMousePosition(e: React.MouseEvent<HTMLDivElement>, rect: DOMRect) {
        const scale = editorEngine.canvas.scale;
        const x = (e.clientX - rect.left) / scale;
        const y = (e.clientY - rect.top) / scale;
        return { x, y };
    }

    function getRelativeMousePositionToOverlay(
        e: React.MouseEvent<HTMLDivElement>,
    ): ElementPosition {
        if (!editorEngine.overlay.overlayContainer) {
            throw new Error('overlay container not found');
        }
        const rect = editorEngine.overlay.overlayContainer?.getBoundingClientRect();
        const { x, y } = getRelativeMousePosition(e, rect);
        return { x, y };
    }

    /**
     * 返回webview整个视口的位置信息（不是当前元素，是整个webview对于app来说的位置信息）
     * @param e
     * @returns
     */
    function getRelativeMousePositionToWebview(
        e: React.MouseEvent<HTMLDivElement>,
    ): ElementPosition {
        const webview = webviewRef.current as Electron.WebviewTag | null;
        if (!webview) {
            throw new Error('webview not found');
        }
        //获取当前元素的为hi信息
        //参考：https://developer.baidu.com/article/details/3294938
        const rect = webview.getBoundingClientRect();
        console.log(rect, 'rectrect');
        const { x, y } = getRelativeMousePosition(e, rect);
        return { x, y };
    }

    /**
     * 元素被点击 按下之后，开始进行和工具栏以及侧边dom节点树的交互
     * @param e
     */
    function handleMouseDown(e: React.MouseEvent<HTMLDivElement>) {
        console.log(editorEngine.mode, 'editorEngine');
        if (editorEngine.mode === EditorMode.DESIGN) {
            handleMouseEvent(e, MouseAction.CLICK);
        } else if (
            editorEngine.mode === EditorMode.INSERT_DIV ||
            editorEngine.mode === EditorMode.INSERT_TEXT
        ) {
            editorEngine.insert.start(
                e,
                getRelativeMousePositionToOverlay,
                getRelativeMousePositionToWebview,
            );
        }
    }

    /**
     * 鼠标正在模拟视口move事件监听
     * 用于给出节点信息
     * @param e
     */
    function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
        console.log('move');
        if (editorEngine.move.isDragging) {
            editorEngine.move.drag(e, webviewRef.current, getRelativeMousePositionToWebview);
        } else if (
            editorEngine.mode === EditorMode.DESIGN ||
            (editorEngine.mode === EditorMode.INSERT_DIV && !editorEngine.insert.isDrawing)
        ) {
            handleMouseEvent(e, MouseAction.MOVE);
        } else if (editorEngine.insert.isDrawing) {
            editorEngine.insert.draw(e, getRelativeMousePositionToOverlay);
        }
    }

    async function handleMouseUp(e: React.MouseEvent<HTMLDivElement>) {
        editorEngine.insert.end(e, webviewRef.current, getRelativeMousePositionToWebview);
        editorEngine.move.end(e, webviewRef.current);
    }

    /**
     * 这里对视口的 点击和 move事件进行处理
     * 点击 => 公共状态流转数据（与工具栏和dom节点交互）
     * move => 显示边框
     * @param e
     * @param action
     * @returns
     */
    async function handleMouseEvent(e: React.MouseEvent<HTMLDivElement>, action: MouseAction) {
        const webview = webviewRef.current as Electron.WebviewTag | null;
        if (!webview) {
            return;
        }

        const pos = getRelativeMousePositionToWebview(e);
        //根据当前光标位置,在webview中获取到当前光标位置所处的最上层dom节点信息,然后返回 也就是下面的 el
        //getElementAtLoc 是一个在当前项目内的函数,通过vite插件的集成调用到(全局搜就能搜到)
        //也就是 在webview里执行 getElementAtLoc 这个自定义函数
        const el: DomElement = await webview.executeJavaScript(
            `window.api?.getElementAtLoc(${pos.x}, ${pos.y}, ${action === MouseAction.CLICK} )`,
        );
        console.log(el, 'elelel');
        if (!el) {
            return;
        }
        switch (action) {
            //move事件的处理
            case MouseAction.MOVE:
                editorEngine.elements.mouseover(el, webview);
                break;
            //点击事件的处理
            case MouseAction.CLICK:
                // Not right-click
                if (e.button !== 2) {
                    console.log(el, 'clickel');
                    console.log(
                        await webview.executeJavaScript(
                            `window.api?.getElementAtLoc(${pos.x}, ${pos.y}, ${action === MouseAction.CLICK} )`,
                        ),
                        'clickMouseAction',
                    );

                    console.log(
                        await webview.executeJavaScript('document.documentElement.outerHTML'),
                        'clickMouseActionBody',
                    );
                    editorEngine.elements.click([el], webview);
                    editorEngine.move.start(el, pos, webview);
                }
                break;
        }
    }

    return (
        <RightClickMenu>
            <div
                className={clsx(
                    'absolute inset-0 bg-transparent',
                    editorEngine.mode === EditorMode.INTERACT ? 'hidden' : 'visible',
                    editorEngine.mode === EditorMode.INSERT_DIV ||
                        editorEngine.mode === EditorMode.INSERT_TEXT
                        ? 'cursor-crosshair'
                        : '',
                )}
                // style={{ background: 'red' }}
                onClick={handleClick}
                onMouseOver={() => setHovered(true)}
                onMouseOut={() => {
                    setHovered(false);
                    editorEngine.elements.clearHoveredElement();
                    editorEngine.overlay.removeHoverRect();
                }}
                onMouseLeave={handleMouseUp}
                onMouseMove={handleMouseMove}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
            ></div>
        </RightClickMenu>
    );
});

export default GestureScreen;
