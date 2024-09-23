export interface LayerNode {
    id: string; //唯一id
    textContent: string;
    type: number;
    tagName: string;
    style: {
        display: string;
        flexDirection: string;
    };
    children?: LayerNode[];
    originalIndex: number;
}
