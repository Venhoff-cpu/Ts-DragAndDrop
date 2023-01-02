export abstract class Component<T extends HTMLElement, U extends HTMLElement> {
    templateElement: HTMLTemplateElement;
    hostElement: T;
    element: U;

    constructor(
        templateId: string,
        hostElementId: string,
        insertAtBeginning: boolean,
        newElementId?: string
    ) {
        this.templateElement = <HTMLTemplateElement>document.getElementById(templateId)!
        this.hostElement = <T>document.getElementById(hostElementId)!

        const templateNode = document.importNode(this.templateElement.content, true);
        this.element = <U>templateNode.firstElementChild;
        if(newElementId){
            this.element.id = newElementId;
        }
        this.attach(insertAtBeginning);
    }

    private attach(insertAtBeginning: boolean) {
        this.hostElement.insertAdjacentElement(
            insertAtBeginning ? "afterbegin" : "beforeend",
            this.element
        )
    }

    abstract configure(): void;
    abstract renderContent(): void;
}
