import * as go from "gojs";
import { ConfigDiagramService, InjectorInstance } from "./diagram.service";

// some parameters
export const LinePrefix = 20;  // vertical starting point in document for all Messages and Activations
export const LineSuffix = 30;  // vertical length beyond the last message time
export const MessageSpacing = 20;  // vertical distance between Messages at different steps
export const ActivityWidth = 10;  // width of each vertical activity bar
export const ActivityStart = 5;  // height before start message time
export const ActivityEnd = 5;  // height beyond end message time
export const diagramDivClassName = 'myDiagramDiv';

export const TYPE_DIAGRAM = {
  NODE: 'NODE',
  LINK: 'LINK',
  GROUP: 'GROUP',
}

export function initDiagram(): go.Diagram {
  const $ = go.GraphObject.make;
  const configDiagramService = InjectorInstance.get(ConfigDiagramService);

  const dia = $(go.Diagram, {
    model: new go.GraphLinksModel(
      {
        nodeKeyProperty: 'id',
        linkKeyProperty: 'id'
      }
      ),
    allowCopy: false,
    linkingTool: $(MessagingTool),  // defined below
    "resizingTool.isGridSnapEnabled": true,
    draggingTool: $(MessageDraggingTool),  // defined below
    "draggingTool.gridSnapCellSize": new go.Size(1, MessageSpacing / 4),
    "draggingTool.isGridSnapEnabled": true,
    // automatically extend Lifelines as Activities are moved or resized
    "SelectionMoved": () => {
      const arr = dia.model.nodeDataArray;
      let max = -1;
      for (let i = 0; i < arr.length; i++) {
        const act = arr[i];
        if (act['isGroup']) continue;
        max = Math.max(max, act['start'] + act['duration']);
      }
      if (max > 0) {
        // now iterate over only Groups
        for (let i = 0; i < arr.length; i++) {
          const gr = arr[i];
          if (!gr['isGroup']) continue;
          if (max > gr['duration']) {  // this only extends, never shrinks
            dia.model.setDataProperty(gr, "duration", max);
          }
        }
      }
    },
    "PartResized": () => {
      const arr = dia.model.nodeDataArray;
      let max = -1;
      for (let i = 0; i < arr.length; i++) {
        const act = arr[i];
        if (act['isGroup']) continue;
        max = Math.max(max, act['start'] + act['duration']);
      }
      if (max > 0) {
        // now iterate over only Groups
        for (let i = 0; i < arr.length; i++) {
          const gr = arr[i];
          if (!gr['isGroup']) continue;
          if (max > gr['duration']) {  // this only extends, never shrinks
            dia.model.setDataProperty(gr, "duration", max);
          }
        }
      }
    },
    'undoManager.isEnabled': true,
  });

  dia.groupTemplate =
    $(go.Group, "Vertical",
      {
        locationSpot: go.Spot.Bottom,
        locationObjectName: "HEADER",
        minLocation: new go.Point(0, 0),
        maxLocation: new go.Point(9999, 0),
        selectionObjectName: "HEADER"
      },
      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
      $(go.Panel, "Auto",
        { name: "HEADER" },
        $(go.Shape, "Rectangle",
          {
            fill: $(go.Brush, "Linear", { 0: "#bbdefb", 1: go.Brush.darkenBy("#bbdefb", 0.1) }),
            stroke: null
          }),
        $(go.TextBlock,
          {
            margin: 5,
            font: "400 10pt Source Sans Pro, sans-serif"
          },
          new go.Binding("text", "text"))
      ),
      $(go.Shape,
        {
          figure: "LineV",
          fill: null,
          stroke: "gray",
          strokeDashArray: [3, 3],
          width: 1,
          alignment: go.Spot.Center,
          portId: "",
          fromLinkable: true,
          fromLinkableDuplicates: true,
          toLinkable: true,
          toLinkableDuplicates: true,
          cursor: "pointer"
        },
        new go.Binding("height", "duration", computeLifelineHeight)),
      {
        click: function(e, obj) {
          console.log(obj)
          // dia.model.addNodeData({
          //   id: 'thdfjh',
          //   text: 'hfgdhfdgh',
          //   isGroup: true,
          //   loc: '600 0',
          //   duration: 9,
          //   dataConfig: {
          //     content: '',
          //   },
          // },)
          // dia.model.removeNodeData(obj?.part?.data)
          configDiagramService.openDiagramConfig(obj?.part?.data, TYPE_DIAGRAM.GROUP)
        },
      }
    );

  dia.nodeTemplate =
    $(go.Node,
      {
        locationSpot: go.Spot.Top,
        locationObjectName: "HEADER",
        minLocation: new go.Point(NaN, LinePrefix - ActivityStart),
        maxLocation: new go.Point(NaN, 19999),
        selectionObjectName: "SHAPE",
        resizable: true,
        resizeObjectName: "SHAPE",
        resizeAdornmentTemplate:
          $(go.Adornment, "Spot",
            $(go.Placeholder),
            $(go.Shape,  // only a bottom resize handle
              {
                alignment: go.Spot.Bottom, cursor: "col-resize",
                desiredSize: new go.Size(6, 6), fill: "yellow"
              })
          )
      },
      new go.Binding("location", "",
        (act) => {
          const groupdata = dia.model.findNodeDataForKey(act.group);
          if (groupdata === null) return new go.Point();
          // get location of Lifeline's starting point
          const grouploc = go.Point.parse(groupdata['loc']);
          return new go.Point(grouploc.x, convertTimeToY(act.start) - ActivityStart);
      }).makeTwoWay((loc, act) => {
        dia.model.setDataProperty(act, "start", convertYToTime(loc.y + ActivityStart));
      }),
      $(go.Shape, "Rectangle",
        {
          name: "SHAPE",
          fill: "white", stroke: "black",
          width: ActivityWidth,
          // allow Activities to be resized down to 1/4 of a time unit
          minSize: new go.Size(ActivityWidth, computeActivityHeight(0.25))
        },
        new go.Binding("height", "duration", computeActivityHeight).makeTwoWay(backComputeActivityHeight)),
        {
          click: function(e, obj) {
            configDiagramService.openDiagramConfig(obj?.part?.data, TYPE_DIAGRAM.NODE)
          },
        }
    );

  dia.linkTemplate =
    $(MessageLink,  // defined below
      { selectionAdorned: true, curviness: 0 },
      $(go.Shape, "Rectangle",
        { stroke: "black" }),
      $(go.Shape,
        { toArrow: "OpenTriangle", stroke: "black" }),
      $(go.TextBlock,
        {
          font: "400 9pt Source Sans Pro, sans-serif",
          segmentIndex: 0,
          segmentOffset: new go.Point(NaN, NaN),
          isMultiline: false,
          editable: true
        },
        new go.Binding("text", "text").makeTwoWay()),
      {
        click: function(e, obj) {
          configDiagramService.openDiagramConfig(obj?.part?.data, TYPE_DIAGRAM.LINK)
        },
      }
    );
  configDiagramService.onCreateNewDiagram(dia)
  return dia;
}

class MessagingTool extends go.LinkingTool {
  constructor() {
    super();

    // Since 2.2 you can also author concise templates with method chaining instead of GraphObject.make
    // For details, see https://gojs.net/latest/intro/buildingObjects.html
    const $ = go.GraphObject.make;
    this.temporaryLink =
      $(MessageLink,
        $(go.Shape, "Rectangle",
          { stroke: "magenta", strokeWidth: 2 }),
        $(go.Shape,
          { toArrow: "OpenTriangle", stroke: "magenta" }));
  }

  override doActivate() {
    super.doActivate();
    const zOrder = convertYToTime(this.diagram.firstInput.documentPoint.y);
    this.temporaryLink.zOrder = Math.ceil(zOrder);  // round up to an integer value
  }

  override insertLink(fromnode: go.Node | null, fromport: go.GraphObject | null, tonode: go.Node | null, toport: go.GraphObject | null) {
    const newlink = super.insertLink(fromnode, fromport, tonode, toport);
    if (newlink !== null) {
      const model = this.diagram.model;
      // specify the zOrder of the message
      const start = this.temporaryLink.zOrder;
      const duration = 1;
      newlink.data.zOrder = start;
      newlink.data.duration = duration;
      model.setDataProperty(newlink.data, "text", "msg");
      // and create a new Activity node data in the "to" group data => not use group
      // const newact = {
      //   group: newlink.data.to,
      //   start: start,
      //   duration: duration
      // };
      // model.addNodeData(newact);
      // now make sure all Lifelines are long enough
      // ensureLifelineHeights();
      const arr = model.nodeDataArray;
      let max = -1;
      for (let i = 0; i < arr.length; i++) {
        const act = arr[i];
        max = Math.max(max, act['duration']) + 2;
      }
      if (max > 0) {
        for (let i = 0; i < arr.length; i++) {
          const gr = arr[i];
          console.log(gr)
          // if (!gr['isGroup']) continue;
          if (max > gr['duration']) {  // this only extends, never shrinks
            model.setDataProperty(gr, "duration", max);
          }
        }
      }
    }
    return newlink;
  }
}

class MessageDraggingTool extends go.DraggingTool {
  // override the standard behavior to include all selected Links,
  // even if not connected with any selected Nodes
  override computeEffectiveCollection(parts: any, options: go.DraggingOptions) {
    const result = super.computeEffectiveCollection(parts, options);
    // add a dummy Node so that the user can select only Links and move them all
    result.add(new go.Node(), new go.DraggingInfo(new go.Point()));
    // normally this method removes any links not connected to selected nodes;
    // we have to add them back so that they are included in the "parts" argument to moveParts
    parts.each((part: go.Part) => {
      if (part instanceof go.Link) {
        result.add(part, new go.DraggingInfo(part.getPoint(0).copy()));
      }
    })
    return result;
  }

  // override to allow dragging when the selection only includes Links
  override mayMove() {
    return !this.diagram.isReadOnly && this.diagram.allowMove;
  }

  override moveParts(parts: go.Map<go.Part, go.DraggingInfo>, offset: go.Point, check: boolean | undefined) {
    super.moveParts(parts, offset, check);
    const it = parts.iterator;
    while (it.next()) {
      if (it.key instanceof go.Link) {
        const link = it.key;
        const startY = it.value.point.y;  // DraggingInfo.point.y
        let y = startY + offset.y;  // determine new Y coordinate value for this link
        const cellY = this.gridSnapCellSize.height;
        y = Math.round(y / cellY) * cellY;  // snap to multiple of gridSnapCellSize.height
        const t = Math.max(0, convertYToTime(y));
        link.diagram?.model.set(link.data, "zOrder", t);
        link.invalidateRoute();
      }
    }
  }
}

class MessageLink extends go.Link {
  constructor() {
    super();
    this.zOrder = 0;  // use this "time" value when this is the temporaryLink
  }

  override getLinkPoint(node: any, port: { getDocumentPoint: (arg0: go.Spot) => any; getDocumentBounds: () => any; }, spot: any, from: any, ortho: any, othernode: any, otherport: { getDocumentPoint: (arg0: go.Spot) => any; }) {
    const p = port.getDocumentPoint(go.Spot.Center);
    const r = port.getDocumentBounds();
    const op = otherport.getDocumentPoint(go.Spot.Center);

    const data = this.data;
    const zOrder = data !== null ? data.zOrder : this.zOrder;  // if not bound, assume this has its own "zOrder" property

    const aw = this.findActivityWidth(node, zOrder);
    const x = (op.x > p.x ? p.x + aw / 2 : p.x - aw / 2);
    const y = convertTimeToY(zOrder);
    return new go.Point(x, y);
  }

  findActivityWidth(node: go.Node | null, zOrder: number) {
    let aw = ActivityWidth;
    if (node instanceof go.Group) {
      // see if there is an Activity Node at this point -- if not, connect the link directly with the Group's lifeline
      if (!node.memberParts.any(mem => {
        const act = mem.data;
        return (act !== null && act.start <= zOrder && zOrder <= act.start + act.duration);
      })) {
        aw = 0;
      }
    }
    return aw;
  }

  override computePoints() {
    if (this.fromNode && this.fromNode === this.toNode) {  // also handle a reflexive link as a simple orthogonal loop
      const data = this.data;
      const zOrder = data !== null ? data.zOrder : this.zOrder;  // if not bound, assume this has its own "zOrder" property
      const p = this.fromNode.port.getDocumentPoint(go.Spot.Center);
      const aw = this.findActivityWidth(this.fromNode, zOrder);

      const x = p.x + aw / 2;
      const y = convertTimeToY(zOrder);
      this.clearPoints();
      this.addPoint(new go.Point(x, y));
      this.addPoint(new go.Point(x + 50, y));
      this.addPoint(new go.Point(x + 50, y + 5));
      this.addPoint(new go.Point(x, y + 5));
      return true;
    } else {
      return super.computePoints();
    }
  }
}


function computeLifelineHeight(duration: number) {
  return LinePrefix + duration * MessageSpacing + LineSuffix;
}

function convertTimeToY(t: number) {
  return t * MessageSpacing + LinePrefix;
}

function convertYToTime(y: number) {
  return (y - LinePrefix) / MessageSpacing;
}

function computeActivityHeight(duration: number) {
  return ActivityStart + duration * MessageSpacing + ActivityEnd;
}

function backComputeActivityHeight(height: number) {
  return (height - ActivityStart - ActivityEnd) / MessageSpacing;
}
