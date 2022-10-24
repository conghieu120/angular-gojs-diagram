import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { GojsAngularModule } from 'gojs-angular';

import { AppComponent } from './app.component';
import { DiagramComponent } from './diagram/diagram.component';
import { initDiagram } from './diagram/diagram.constant';
import { ConfigDiagramService } from './diagram/diagram.service';

@NgModule({
  declarations: [
    AppComponent,
    DiagramComponent,
   ],
  imports: [
    BrowserModule,
    GojsAngularModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
