
/**
 * Get the component for a node
 * When the node is slotted, it will return the component of the parent element
 * This is ok for a textfield (when the input is faulty) but might lead to other issues
 * That might need to be refined
 * @param node
 */
import {ComponentReference, getComponents} from "./copy-component-util";

export function getComponentForNode(node: Node): ComponentReference | undefined {
    const elementForNode = getElementForNode(node);
    if (elementForNode) {
        const componentList = getComponents(elementForNode);
        return componentList[componentList.length - 1];
    }
    return undefined;
}

export function  getElementForNode(node: Node) {
    if (node instanceof HTMLElement) {
        const rootNode = node.getRootNode();
        if (rootNode instanceof ShadowRoot) {
            return rootNode.host as HTMLElement;
        } else if (node.parentElement && node.slot == 'input' && node.parentElement.tagName.startsWith("VAADIN")) {
            // the input slot for the textfield is a bit different
            // use the parent element
            return node.parentElement!;
        } else {
            return node;
        }
    }
    return undefined;
}

export function  getUiId() {
    const vaadin = (window as any).Vaadin;
    if (vaadin && vaadin.Flow) {
        const { clients } = vaadin.Flow;
        const appIds = Object.keys(clients);
        for (const appId of appIds) {
            const client = clients[appId];
            if (client.getNodeId) {
                return client.getUIId();
            }
        }
    }
    return -1;
}