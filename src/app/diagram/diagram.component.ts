import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { data } from './data';
import { diagramDivClassName, initDiagram } from './diagram.constant';
import { ILinkData, INodeData } from './diagram.model';
import { ConfigDiagramService } from './diagram.service';

@Component({
  selector: 'app-diagram',
  templateUrl: './diagram.component.html',
  styleUrls: ['./diagram.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DiagramComponent implements OnInit {
  initDiagram = initDiagram;
  data = data;
  diagramDivClassName = diagramDivClassName;
  dataConfig: any;
  content: any;

  listNodeChoose: INodeData[] = [];
  nodeDataArray: INodeData[] = [];
  linkDataArray: ILinkData[] = [];

  constructor(public diagramService: ConfigDiagramService) {
    this.diagramService.dataConfigSubject.subscribe((data) => {
      this.dataConfig = data;
      this.content = data?.data?.dataConfig?.content;
    });
    this.diagramService.nodesSubject.subscribe((data) => {
      this.nodeDataArray = data
      this.listNodeChoose = data
    });
    this.diagramService.linksSubject.subscribe((data) => {
      this.linkDataArray = data;
    });
  }

  ngOnInit() {
    this.diagramService.fetchDiagramData();
  }

  diagramModelChange(event: any) {
    console.log(event);
  }

  onSave() {
    this.diagramService.saveData(
      this.dataConfig.data,
      this.dataConfig.type,
      this.content
    );
  }

  onExport() {
    this.diagramService.onExportDiagram();
  }
}
