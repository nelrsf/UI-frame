export abstract class DOMHelpers {
    static isPointerOverElement(pointerX: number, pointerY: number, element: HTMLElement): boolean {
        const rect = element.getBoundingClientRect();
        return pointerX >= rect.left && pointerX <= rect.right && pointerY >= rect.top && pointerY <= rect.bottom;
    }
}