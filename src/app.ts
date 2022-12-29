interface Draggable {
    dragStartHandler(event: DragEvent): void;
    dragEndHandler(event: DragEvent): void;
}

interface DragTarget{
    dragOverHandler(event: DragEvent): void;
    dropHandler(event: DragEvent): void
    dragLeaveHandler(event: DragEvent): void
}
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

type Listener<T> = (items: T[]) => void;

class State<T> {
    protected listeners: Listener<T>[] = [];

    addListener(listenerFn: Listener<T>) {
        this.listeners.push(listenerFn);
    }
}
class ProjectState extends State<Project>{
    private projects: Project[] = [];
    private static instance: ProjectState;

    private constructor() {
        super()
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new ProjectState();
        }
        return this.instance
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
        this.updateListeners();
    }

    moveProject(projectId: string, newStatus: ProjectStatus){
        const project = this.projects.find(prj => prj.id === projectId);
        if (project && project.status !== newStatus) {
            project.status = newStatus
            this.updateListeners();
        }
    }

    private updateListeners(){
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

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
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
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement>{
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

class ProjectItem extends Component<HTMLUListElement, HTMLLIElement>  implements Draggable{
    private project: Project;

    get persons(){
        if (this.project.people === 1){
            return "1 person"
        }
        return `${this.project.people} persons`
    }
    constructor(hostId: string, project: Project) {
        super("single-project", hostId, false, project.id);
        this.project = project;
        this.configure()
        this.renderContent()
    }

    configure() {
        this.element.addEventListener("dragstart", this.dragStartHandler);
        this.element.addEventListener("dragend", this.dragEndHandler);
    }

    renderContent() {
        this.element.querySelector("h2")!.textContent = this.project.title;
        this.element.querySelector("h3")!.textContent = this.persons + " assigned";
        this.element.querySelector("p")!.textContent = this.project.description;
    }

    @AutoBind
    dragStartHandler(event: DragEvent) {
        event.dataTransfer!.setData('text/plain', this.project.id);
        event.dataTransfer!.effectAllowed = "move";
        console.log(event);
    }

    @AutoBind
    dragEndHandler(_: DragEvent) {
        console.log("Drag end");
    }
}

class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget{
    assignedProjects: Project[];

    constructor(private type: "active" | "finished") {
      super("project-list", "app", false, `${type}-projects`)
      this.assignedProjects = [];
      this.configure();
      this.renderContent();

    }
    renderProjects() {
        const listElement = <HTMLUListElement>document.getElementById(`${this.type}-projects-list`)
        listElement.innerHTML = "";
        for (const prjItem of this.assignedProjects){
            new ProjectItem(listElement.id, prjItem);
        }
    }

    configure() {
        this.element.addEventListener("dragover", this.dragOverHandler)
        this.element.addEventListener("drop", this.dropHandler)
        this.element.addEventListener("dragleave", this.dragLeaveHandler)
        projectState.addListener((projects: Project[]) => {
            this.assignedProjects = projects.filter((project) => {
              if (this.type === "active") {
                  return project.status === ProjectStatus.Active
              } else {
                  return project.status === ProjectStatus.Finished
              }
          });
          this.renderProjects();
      })
    }

    renderContent() {
        this.element.querySelector("ul")!.id = `${this.type}-projects-list`;
        this.element.querySelector("h2")!.textContent = this.type.toUpperCase() + " PROJECTS";
    }

    @AutoBind
    dragOverHandler(event: DragEvent) {
        if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
            event.preventDefault()
            const listEl = this.element.querySelector("ul")!;
            listEl.classList.add('droppable');
        }

    }

    @AutoBind
    dropHandler(event: DragEvent) {
        const projId = event.dataTransfer!.getData("text/plain");
        projectState.moveProject(
            projId,
            this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished
        )
        this.dragLeaveHandler(event);
    }

    @AutoBind
    dragLeaveHandler(_: DragEvent) {
        const listEl = this.element.querySelector("ul")!;
        listEl.classList.remove('droppable');
    }
}

const form_ = new ProjectInput()
const activeList = new ProjectList("active")
const finishedList = new ProjectList("finished")