import { TooltipProvider } from '@/components/ui/tooltip';
import Announcement from './components/Announcement';
import AppBar from './components/AppBar';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from './components/ui/toaster';
import ProjectEditor from './routes/project';
function App() {
    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <TooltipProvider>
                {/* //electron最头部 */}
                <AppBar />
                {/* //核心视口（dom结构+webview+操作栏） */}
                <ProjectEditor />
                {/* //最新消息提示Modal */}
                {/* <Announcement /> */}
                <Toaster />
            </TooltipProvider>
        </ThemeProvider>
    );
}

export default App;
