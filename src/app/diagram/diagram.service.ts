import { Injectable, Injector } from '@angular/core';
import { Subject } from 'rxjs';
import { data } from './data'
import { TYPE_DIAGRAM } from './diagram.constant';

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
  data = new Subject<{type: String, data: Idata}>();
  diagramData = new Subject();
  onSaveDiagram = new Subject();
  dataConfig = {
    nodeDataArray: [...data.nodeDataArray],
    linkDataArray: [...data.linkDataArray],
  };

  constructor(private injector: Injector) {
    InjectorInstance = this.injector;
    this.diagramData.subscribe(data => console.log(data))
  }

  openDiagramConfig(data: Idata, type: String) {
    if (type === TYPE_DIAGRAM.GROUP) {
      const indexItem = this.dataConfig.nodeDataArray.findIndex(i => i?.id === data.id)
      if (indexItem >= 0) {
        this.data.next({ type: type, data: this.dataConfig.nodeDataArray[indexItem] });
        return;
      }
    }
    this.data.next({ type: type, data: data });
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

  exportDiagram(data: any) {
    this.diagramData.next(data);
  }
  onExportDiagram() {
    this.onSaveDiagram.next('save');
  }
}
