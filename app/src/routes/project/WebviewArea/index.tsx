import { WebviewMessageBridge } from '@/lib/editor/messageBridge';
import { useEditorEngine } from '..';
import Frame from './Frame';
import Overlay from './Overlay';

/**
 * 中间的webview的区域 （整个）
 * @returns 
 */
function WebviewArea() {
    //获取到公共状态，用户接受工具栏change的数值
    const editorEngine = useEditorEngine();
    const messageBridge = new WebviewMessageBridge(editorEngine);

    return (
        <Overlay>
            <div className="grid grid-flow-col gap-72">
                {editorEngine.canvas.frames.map((settings, index) => (
                    <Frame key={index} settings={settings} messageBridge={messageBridge} />
                ))}
            </div>
        </Overlay>
    );
}

export default WebviewArea;
