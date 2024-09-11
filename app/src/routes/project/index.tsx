import { EditorEngine } from '@/lib/editor/engine';
import { createContext, useContext } from 'react';
import Canvas from './Canvas';
import EditPanel from './EditPanel';
import LayersPanel from './LayersPanel';
import ResizablePanel from './LayersPanel/ResizablePanel';
import Toolbar from './Toolbar';
import EditorTopBar from './TopBar';
import WebviewArea from './WebviewArea';

const EditorEngineContext = createContext(new EditorEngine());

//useContent来控制页面的解析和视图更新
//案例：选中视图：工具栏的padding +1 ,中间浏览器是否里的dom可以同步更新，就是通过这个来进行数据传递的
export const useEditorEngine = () => useContext(EditorEngineContext); 

function ProjectEditor() {
    return (
        <EditorEngineContext.Provider value={useEditorEngine()}>
            <div className="relative flex flex-row h-[calc(100vh-2.5rem)] select-none">

                {/* //中间，浏览器预览 */}
                <Canvas>
                    <WebviewArea />
                </Canvas>
                {/* //左侧树级结构 todo */}
                <ResizablePanel>
                    <div className="left-0 animate-layer-panel-in">
                        <LayersPanel />
                    </div>
                </ResizablePanel>
                {/* //左侧编辑器 todo */}
                <div className="fixed right-0 top-20 animate-edit-panel-in">
                    <EditPanel />
                </div>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-toolbar-up">
                    <Toolbar />
                </div>
                <div className="absolute top-0 w-full">
                    <EditorTopBar />
                </div>
            </div>
        </EditorEngineContext.Provider>
    );
}

export default ProjectEditor;
