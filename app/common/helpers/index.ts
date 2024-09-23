import { EditorAttributes } from '../constants';
import { finder } from '../selector';
import { assignUniqueId } from '/electron/preload/webview/elements/helpers';

export function escapeSelector(selector: string) {
    return CSS.escape(selector);
}
export function querySelectorCommand(selector: string) {
    return `document.querySelector('${escapeSelector(selector)}')`;
}

export const getUniqueSelector = (el: HTMLElement, root?: Element | undefined): string => {
    let selector = el.tagName.toLowerCase();
    console.log(selector, 'selector!!!!');

    assignUniqueId(el);

    const onlookUniqueId = getOnlookUniqueSelector(el);
    console.log(onlookUniqueId, 'onlookUniqueIdonlookUniqueId');
    //如果有 data-onlook-unique-id 这个属性，说明是旧的节点。则返回该属性值。
    //如果没有这个属性，则说明是新的节点。则生成一个
    if (onlookUniqueId) {
        return onlookUniqueId;
    }
    try {
        if (el.nodeType !== Node.ELEMENT_NODE) {
            return selector;
        }
        if (root) {
            selector = finder(el, { className: () => false, root });
        } else {
            selector = finder(el, { className: () => false });
        }
    } catch (e) {
        console.warn('Error creating selector ', e);
    }
    console.log(selector, 'selector????');
    return selector;
};

//获取元素节点上的 data-onlook-unique-id
export const getOnlookUniqueSelector = (el: HTMLElement): string | null => {
    const uniqueId = el.getAttribute(EditorAttributes.DATA_ONLOOK_UNIQUE_ID);
    if (uniqueId) {
        return `[${EditorAttributes.DATA_ONLOOK_UNIQUE_ID}="${uniqueId}"]`;
    }
    return null;
};

export function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
