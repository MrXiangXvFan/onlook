import { EditorMode } from '@/lib/models';
import { observer } from 'mobx-react-lite';
import { useEffect, useRef } from 'react';
import { useEditorEngine } from '..';

const Overlay = observer(({ children }: { children: React.ReactNode }) => {
    const overlayContainerRef = useRef(null);
    const editorEngine = useEditorEngine();

    useEffect(() => {
        if (overlayContainerRef.current) {
            const overlayContainer = overlayContainerRef.current;
            editorEngine.overlay.setOverlayContainer(overlayContainer);
            return () => {
                editorEngine.overlay.clear();
            };
        }
    }, [overlayContainerRef]);

    return (
        <>
            {/* //webview元素 */}
            {children}
            {/* 重要 */}
            {/* 这个是点击webview元素之后，在视口区域出现的该元素的边框和元素信息等 */}
            {/* 和webview本身是分开的 */}
            <div
                ref={overlayContainerRef}
                style={{
                    position: 'absolute',
                    height: 0,
                    width: 0,
                    top: 0,
                    left: 0,
                    pointerEvents: 'none',
                    zIndex: 99,
                    visibility: editorEngine.mode === EditorMode.INTERACT ? 'hidden' : 'visible',
                }}
            />
        </>
    );
});

export default Overlay;
