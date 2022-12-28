
enum ProjectStatus {
    Active, Finished
}
class Project {
    constructor(
        public id: string,
        public title: string,
        public description: string,
        public people: number,
        public status: ProjectStatus) {}
}

type Listener = (items: Project[]) => void;

class ProjectState {
    private projects: Project[] = [];
    private listeners: Listener[] = [];
    private static instance: ProjectState;

    private constructor() {

    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new ProjectState();
        }
        return this.instance
    }

    addListener(listenerFn: Listener) {
        this.listeners.push(listenerFn);
    }

    addProject(title: string, description: string, numOfPeople: number) {
        const newProject = new Project(
            Math.random().toString(),
            title,
            description,
            numOfPeople,
            ProjectStatus.Active,
    );
        this.projects.push(newProject);
        for (const listenerFn of this.listeners){
            listenerFn(this.projects.slice());
        }
    }
}

function AutoBind(_: any, _2: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        enumerable: false,
        get() {
            return originalMethod.bind(this);
        },
    }
    return adjDescriptor;
}

interface ValidatorConfig {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}

function validate(validatableInput: ValidatorConfig) {
  let isValid = true;
  if (validatableInput.required) {
    isValid = isValid && validatableInput.value.toString().trim().length !== 0;
  }
  if (typeof validatableInput.value === "string"){
    if (validatableInput.minLength != null) {
      isValid = isValid && validatableInput.value.length > validatableInput.minLength;
    }
    if (validatableInput.maxLength != null) {
      isValid = isValid && validatableInput.value.length < validatableInput.maxLength;
    }
  }
  if (typeof validatableInput.value === "number"){
    if (validatableInput.min != null) {
      isValid = isValid && validatableInput.value >= validatableInput.min;
    }
    if (validatableInput.max != null) {
      isValid = isValid && validatableInput.value <= validatableInput.max;
    }
  }
  return isValid;
}


const projectState = ProjectState.getInstance();

class ProjectInput {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element: HTMLFormElement;
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
        this.templateElement = <HTMLTemplateElement>document.getElementById("project-input")!
        this.hostElement = <HTMLDivElement>document.getElementById("app")!

        const templateNode = document.importNode(this.templateElement.content, true);
        this.element = <HTMLFormElement>templateNode.firstElementChild;
        this.element.id = "user-input";

        this.titleInputElement = <HTMLInputElement>this.element.querySelector("#title");
        this.descriptionInputElement = <HTMLInputElement>this.element.querySelector("#description");
        this.peopleInputElement = <HTMLInputElement>this.element.querySelector("#people");

        this.configure();
        this.attach();
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

    private configure() {
        this.element.addEventListener("submit", this.submitHandler)
    }

    private attach() {
        this.hostElement.insertAdjacentElement("afterbegin", this.element)
    }
}

class ProjectList {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element: HTMLElement;
    assignedProjects: Project[];

    constructor(private type: "active" | "finished") {
      this.templateElement = <HTMLTemplateElement>document.getElementById("project-list")!;
      this.hostElement = <HTMLDivElement>document.getElementById("app")!;
      this.assignedProjects = [];

      const templateNode = document.importNode(this.templateElement.content, true);
      this.element = <HTMLElement>templateNode.firstElementChild;
      this.element.id = `${this.type}-projects`;

      projectState.addListener((projects: Project[]) => {
          const filteredProjects = projects.filter((project) => {
              if (this.type === "active"){
                return project.status === ProjectStatus.Active
              } else {
                return project.status === ProjectStatus.Finished
              }
          })
          this.assignedProjects = filteredProjects;
          this.renderProjects();
      })

      this.attach();
      this.renderContent();
    }

    private renderProjects() {
        const listElement = <HTMLUListElement>document.getElementById(`${this.type}-projects-list`)
        listElement.innerHTML = "";
        for (const prjItem of this.assignedProjects){
            const listItem = document.createElement("li");
            listItem.textContent = prjItem.title
            listElement.appendChild(listItem);
        }
    }

    private renderContent() {
        this.element.querySelector("ul")!.id = `${this.type}-projects-list`;
        this.element.querySelector("h2")!.textContent = this.type.toUpperCase() + " PROJECTS";
    }
    private attach() {
        this.hostElement.insertAdjacentElement("beforeend", this.element)
    }
}

const form_ = new ProjectInput()
const activeList = new ProjectList("active")
const finishedList = new ProjectList("finished")