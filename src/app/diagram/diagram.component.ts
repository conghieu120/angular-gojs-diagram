import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { data } from './data';
import { diagramDivClassName, initDiagram } from './diagram.constant';
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

  constructor(
    public configDiagramService: ConfigDiagramService,
    ) {
      this.configDiagramService.data.subscribe(data => {
        this.dataConfig = data;
        this.content = data?.data?.dataConfig?.content
      })
    }

  ngOnInit() {
  }

  diagramModelChange(event: any) {
    console.log(event);
  }

  onSave() {
    this.configDiagramService.saveData(this.dataConfig.data, this.dataConfig.type, this.content)
  }

  onExport() {
    this.configDiagramService.onExportDiagram();
  }

}
