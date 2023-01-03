import {Project, ProjectStatus} from "../models/project";
import {ProjectItem} from "./project-item";
import {DragTarget} from "../models/drag-drop";
import {Component} from "./base-component";
import {projectState} from "../state/project";
import {AutoBind} from "../decorators/autobind";

export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget{
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
