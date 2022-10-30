import { Injectable, Injector } from '@angular/core';
import { Subject } from 'rxjs';
import { data } from './data'
import { TYPE_DIAGRAM } from './diagram.constant';
import * as go from "gojs";
import { ILinkData, INodeData } from './diagram.model';

export let InjectorInstance: Injector;

@Injectable({ providedIn: 'root' })
export class ConfigDiagramService {
  dataConfigSubject = new Subject<{type?: String, data?: INodeData | ILinkData | null}>();
  diagram: go.Diagram = new go.Diagram();

  nodes: INodeData[] = [];
  links: ILinkData[] = [];

  nodesSubject = new Subject<INodeData[]>();
  linksSubject = new Subject<ILinkData[]>();

  readonly onCreateNewDiagram = (diagram: go.Diagram) => {
    this.diagram = diagram;
  }

  constructor(private injector: Injector) {
    InjectorInstance = this.injector;
    this.nodesSubject.subscribe((data: INodeData[]) => {
      this.nodes = data;
    })
    this.linksSubject.subscribe((data: ILinkData[]) => {
      this.links = data;
    })
  }

  public fetchDiagramData = () => {
    this.nodesSubject.next(data.nodeDataArray);
    this.linksSubject.next(data.linkDataArray);
  };

  openDiagramConfig(data: INodeData | ILinkData, type: String) {
    console.log(data)
    if (type === TYPE_DIAGRAM.NODE) {
      const indexItem = this.nodes.findIndex(i => i?.id === data.id)
      if (indexItem >= 0) {
        this.dataConfigSubject.next({ type: type, data: this.nodes[indexItem] });
        return;
      }
    }
  }

  closeDiagramConfig() {
    this.dataConfigSubject.next({ type: '', data: null });
  }

  saveData(data: any, type: String, content: String) {
    if (type === TYPE_DIAGRAM.NODE) {
      const indexItem = this.nodes.findIndex(i => i?.id === data.id)
      if (indexItem >= 0) {
        this.nodes[indexItem] = {...data, dataConfig: {content}}
      }
    }
  }

  onExportDiagram() {
    console.log(JSON.parse(this.diagram.model.toJson()));
  }
}
