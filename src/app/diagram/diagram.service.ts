import { Injectable, Injector } from '@angular/core';
import { Subject } from 'rxjs';
import { data } from './data'
import { TYPE_DIAGRAM } from './diagram.constant';
import * as go from "gojs";

export let InjectorInstance: Injector;

interface Idata {
  id?: number | string;
  dataConfig?: { content?: string},
  text?: string;
  isGroup?: boolean;
  loc?: string;
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class ConfigDiagramService {
  data = new Subject<{type?: String, data?: Idata}>();
  dataConfig = {
    nodeDataArray: [...data.nodeDataArray],
    linkDataArray: [...data.linkDataArray],
  };
  diagram: go.Diagram = new go.Diagram();

  readonly onCreateNewDiagram = (diagram: go.Diagram) => {
    this.diagram = diagram;
  }

  constructor(private injector: Injector) {
    InjectorInstance = this.injector;
  }

  openDiagramConfig(data?: Idata, type?: String) {
    if (!!data && !!type) {
      if (type === TYPE_DIAGRAM.GROUP) {
        const indexItem = this.dataConfig.nodeDataArray.findIndex(i => i?.id === data.id)
        if (indexItem >= 0) {
          this.data.next({ type: type, data: this.dataConfig.nodeDataArray[indexItem] });
          return;
        }
      }
      this.data.next({ type: type, data: data });
    } else {
      this.data.next({});
    }
  }

  closeDiagramConfig() {
    this.data.next({ type: '', data: {} });
  }

  saveData(data: any, type: String, content: String) {
    if (type === TYPE_DIAGRAM.GROUP) {
      const indexItem = this.dataConfig.nodeDataArray.findIndex(i => i?.id === data.id)
      if (indexItem >= 0) {
        this.dataConfig.nodeDataArray[indexItem] = {...data, dataConfig: {content}}
      }
    }
  }

  onExportDiagram() {
    console.log(this.diagram.model.toJson());
  }
}
