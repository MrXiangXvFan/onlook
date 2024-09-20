import { WebviewMessageBridge } from '@/lib/editor/messageBridge';

import { Button } from '@/components/ui/button';
import { ExternalLinkIcon } from '@radix-ui/react-icons';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { useEffect, useRef, useState } from 'react';
import { useEditorEngine } from '..';
import BrowserControls from './BrowserControl';
import GestureScreen from './GestureScreen';
import ResizeHandles from './ResizeHandles';
import { Links } from '/common/constants';
import { FrameSettings } from '/common/models/settings';

const Frame = observer(
    ({
        messageBridge,
        settings,
    }: {
        messageBridge: WebviewMessageBridge;
        settings: FrameSettings;
    }) => {
        const RETRY_TIMEOUT = 3000;
        const editorEngine = useEditorEngine();
        const webviewRef = useRef<Electron.WebviewTag>(null);

        const [selected, setSelected] = useState<boolean>(false);
        const [focused, setFocused] = useState<boolean>(false);
        const [hovered, setHovered] = useState<boolean>(false);
        const [domFailed, setDomFailed] = useState(false); //webview时候有存在模拟项目（被修改的项目是否启动了）
        const [onlookEnabled, setOnlookEnabled] = useState(false);

        const [webviewSize, setWebviewSize] = useState(settings.dimension);
        const [webviewSrc, setWebviewSrc] = useState<string>(settings.url); //被监测项目的地址 比如demo里面next项目跑起来这里就是:http://localhost:3000/

        useEffect(setupFrame, [webviewRef]);
        useEffect(
            () => setSelected(editorEngine.webviews.isSelected(settings.id)),
            [editorEngine.webviews.webviews],
        );

        useEffect(() => {
            editorEngine.canvas.saveFrame(settings.id, {
                url: webviewSrc,
                dimension: webviewSize,
            });
        }, [webviewSize, webviewSrc]);

        function setupFrame() {
            console.log('setupFrame');
            const webview = webviewRef.current as Electron.WebviewTag | null;
            if (!webview) {
                return;
            }
            editorEngine.webviews.register(webview);
            messageBridge.register(webview, settings.id);
            setBrowserEventListeners(webview);

            return () => {
                editorEngine.webviews.deregister(webview);
                messageBridge.deregister(webview);
                webview.removeEventListener('did-navigate', handleUrlChange);
            };
        }

        function setBrowserEventListeners(webview: Electron.WebviewTag) {
            // 当webview中的页面开始导航时触发，无论是新的页面还是页内跳转，都适用于检测URL变化
            webview.addEventListener('did-navigate', handleUrlChange);
            // 当webview中的页面发生页内导航时触发，例如通过JavaScript更改了页面的hash或调用了history.pushState
            webview.addEventListener('did-navigate-in-page', handleUrlChange);
            // 当webview中的DOM内容加载并准备就绪时触发，可以用于执行依赖于DOM的操作
            webview.addEventListener('dom-ready', handleDomReady);
            // 当webview加载页面失败时触发，可以用于处理加载错误的情况
            webview.addEventListener('did-fail-load', handleDomFailed);
            // 当webview获得焦点时触发，例如用户点击了webview区域
            webview.addEventListener('focus', handleWebviewFocus);
            // 当webview失去焦点时触发，例如用户点击了webview外部的其他区域
            webview.addEventListener('blur', handleWebviewBlur);
        }

        function handleUrlChange(e: any) {
            setWebviewSrc(e.url);
            editorEngine.clear();
        }

        //监测被修改的项目是否已经被准备完成
        async function handleDomReady() {
            const webview = webviewRef.current as Electron.WebviewTag | null;
            if (!webview) {
                return;
            }
            webview.setZoomLevel(0);
            const body = await editorEngine.dom.getBodyFromWebview(webview);
            //如果webview里面一个节点都都没有（说明需要监测的项目未启动，没有可以更改的内容）
            //没有监测的任何内容（被修改的项目未启动）的时候 body ===<body></body>。 否则 body ===<body xxxxxx>xxxxxx</body>
            setDomFailed(body.children.length === 0);
            checkForOnlookEnabled(body);
        }

        function checkForOnlookEnabled(body: Element) {
            const doc = body.ownerDocument;
            const attributeExists = doc.evaluate(
                '//*[@data-onlook-id]',
                doc,
                null,
                XPathResult.BOOLEAN_TYPE,
                null,
            ).booleanValue;
            setOnlookEnabled(attributeExists);
        }

        // webview加载错误的情况  --比如：被监听的项目未启动
        function handleDomFailed() {
            setDomFailed(true);
            setTimeout(() => {
                const webview = webviewRef.current as Electron.WebviewTag | null;
                if (webview) {
                    webview.reload();
                }
            }, RETRY_TIMEOUT);
        }

        function handleWebviewFocus() {
            console.log("点击了")
            setFocused(true);
        }

        function handleWebviewBlur() {
            setFocused(false);
        }

        return (
            <div className="flex flex-col space-y-4">
                {/* 浏览器视口的 url输入栏区域 */}
                <BrowserControls
                    webviewRef={webviewRef}
                    webviewSrc={webviewSrc}
                    setWebviewSrc={setWebviewSrc}
                    selected={selected}
                    hovered={hovered}
                    setHovered={setHovered}
                    onlookEnabled={onlookEnabled}
                />
                <div className="relative">
                    <ResizeHandles
                        webviewRef={webviewRef}
                        webviewSize={webviewSize}
                        setWebviewSize={setWebviewSize}
                    />
                    {/* 浏览器视口的 webview区域 */}
                    <webview
                        id={settings.id}
                        ref={webviewRef}
                        className={clsx(
                            'w-[96rem] h-[60rem] backdrop-blur-sm transition outline outline-4',
                            domFailed ? 'bg-transparent' : 'bg-white',
                            focused
                                ? 'outline-blue-300'
                                : selected
                                  ? 'outline-teal-300'
                                  : 'outline-transparent',
                        )}
                        src={settings.url}
                        // src={'http://localhost:8080/'}
                        preload={`file://${window.env.WEBVIEW_PRELOAD_PATH}`}
                        allowpopups={'true' as any}
                        style={{
                            width: webviewSize.width,
                            height: webviewSize.height,
                        }}
                    ></webview>
                    {/* //这个才是映射到当前electron项目中的视图，可以监测点击的那个视图 --重要 */}
                    <GestureScreen webviewRef={webviewRef} setHovered={setHovered} />
                    {/* //未监测到视口项目启动时的提示视图 */}
                    {domFailed && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-gray-200/40 via-gray-500/40 to-gray-600/40 border-gray-500 border-[0.5px] space-y-4 rounded-xl">
                            <p className="text-active text-title1">
                                Run your React app to start editing1
                            </p>
                            <p className="text-text text-title2 text-center">
                                {
                                    "Make sure Onlook is installed on your app with 'npx onlook setup'"
                                }
                            </p>
                            <Button
                                variant={'link'}
                                size={'lg'}
                                className="text-title2"
                                onClick={() => {
                                    window.open(Links.USAGE_DOCS, '_blank');
                                }}
                            >
                                Read the get started guide
                                <ExternalLinkIcon className="ml-2 w-6 h-6" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        );
    },
);

export default Frame;