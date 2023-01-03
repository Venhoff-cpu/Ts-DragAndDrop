import {Component} from "./base-component";
import {validate, ValidatorConfig} from "../util/validation";
import { AutoBind } from "../decorators/autobind";
import {projectState} from "../state/project";

export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement>{
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
        super("project-input", "app", true, `user-input`)
        this.titleInputElement = <HTMLInputElement>this.element.querySelector("#title");
        this.descriptionInputElement = <HTMLInputElement>this.element.querySelector("#description");
        this.peopleInputElement = <HTMLInputElement>this.element.querySelector("#people");
        this.configure();
    }

    configure() {
        this.element.addEventListener("submit", this.submitHandler)
    }

    renderContent() {
    }

    private gatherUserInput(): [string, string, number] | void {
        const inputTitle = this.titleInputElement.value
        const inputDescription = this.descriptionInputElement.value
        const inputPeople = +this.peopleInputElement.value

        const titleValidatable: ValidatorConfig = {
            value: inputTitle,
            required: true,
        }
        const descriptionValidatable: ValidatorConfig = {
            value: inputDescription,
            required: true,
        }
        const peopleValidatable: ValidatorConfig = {
            value: inputPeople,
            required: true,
            min: 1,
            max: 10,
        }

        if (!validate(titleValidatable) || !validate(descriptionValidatable) || !validate(peopleValidatable)){
            alert("incorrect input")
            return;
        }
        return [inputTitle, inputDescription, inputPeople]
    }

    private clearInputs() {
        this.titleInputElement.value = ""
        this.descriptionInputElement.value = ""
        this.peopleInputElement.value = ""
    }
    @AutoBind
    private submitHandler(event: Event) {
        event.preventDefault();
        const userInput = this.gatherUserInput();
        if (Array.isArray(userInput)){
            const [title, description, people] = userInput;
            projectState.addProject(title, description, people)
            this.clearInputs();
        }
    }
}
