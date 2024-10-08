import { observer } from 'mobx-react-lite';
import { useEffect, useRef, useState } from 'react';
import { Tree, TreeApi } from 'react-arborist';
import { useEditorEngine } from '..';
import RightClickMenu from '../RightClickMenu';
import TreeNode from './Tree/TreeNode';
import TreeRow from './Tree/TreeRow';
import { LayerNode } from '/common/models/element/layers';

/**
 *  左侧dom --- 树级结构主体组件
 */
const LayersTab = observer(() => {
    const treeRef = useRef<TreeApi<LayerNode>>();
    const editorEngine = useEditorEngine();
    const tabRef = useRef<HTMLDivElement>(null);
    const [domTree, setDomTree] = useState<LayerNode[]>([]);
    const [treeHovered, setTreeHovered] = useState(false);

    //监听editorEngine.ast.layers重新渲染树结构
    useEffect(() => setDomTree(editorEngine.ast.layers), [editorEngine.ast.layers]);
    useEffect(handleSelectChange, [editorEngine.elements.selected]);

    function handleMouseLeaveTree() {
        setTreeHovered(false);
        editorEngine.overlay.removeHoverRect();
    }

    function handleSelectChange() {
        if (editorEngine.elements.selected.length > 0) {
            treeRef.current?.scrollTo(editorEngine.elements.selected[0].selector);
        }
    }

    return (
        <div
            ref={tabRef}
            className="flex h-[calc(100vh-8.25rem)] text-xs text-active"
            onMouseOver={() => setTreeHovered(true)}
            onMouseLeave={() => handleMouseLeaveTree()}
        >
            {console.log(domTree, 'domTreedomTree')}
            <RightClickMenu>
                <Tree
                    ref={treeRef}
                    data={domTree}
                    openByDefault={true}
                    overscanCount={1}
                    indent={8}
                    padding={0}
                    rowHeight={24}
                    width={365}
                    height={(tabRef.current?.clientHeight ?? 8) - 16}
                    renderRow={TreeRow as any}
                >
                    {(props) => <TreeNode {...props} treeHovered={treeHovered} />}
                </Tree>
            </RightClickMenu>
        </div>
    );
});

export default LayersTab;
