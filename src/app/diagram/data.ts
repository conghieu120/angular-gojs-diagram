import { ILinkData, INodeData } from "./diagram.model";

interface INode {
  id?: number | string;
  dataConfig?: { content?: string},
  text?: string;
  isGroup?: boolean;
  loc?: string;
  duration?: number;
  group?: string;
  start?: number;
}

interface Idata {
  class: string;
  nodeDataArray: INodeData[];
  linkDataArray: ILinkData[];
}

export const data: Idata = {
  class: 'go.GraphLinksModel',
  nodeDataArray: [
    {
      id: 'Fred',
      text: 'Fred: Patron',
      isGroup: true,
      loc: '0 0',
      duration: 9,
      dataConfig: {
        isUse: true,
      },
    },
    {
      id: 'Bob',
      text: 'Bob: Waiter',
      isGroup: true,
      loc: '100 0',
      duration: 9,
      dataConfig: {
        isUse: true,
      },
    },
    {
      id: 'Hank',
      text: 'Hank: Cook',
      isGroup: true,
      loc: '200 0',
      duration: 9,
      dataConfig: {
        isUse: false,
      },
    },
    {
      id: 'Renee',
      text: 'Renee: Cashier',
      isGroup: true,
      loc: '300 0',
      duration: 9,
      dataConfig: {
        isUse: false,
      },
    },
  ],
  linkDataArray: [
    { from: 'Fred', to: 'Bob', text: 'order', zOrder: 1, id: 1, dataConfig: {} },
    { from: 'Bob', to: 'Hank', text: 'order food', zOrder: 2, id: 2, dataConfig: {} },
    { from: 'Bob', to: 'Fred', text: 'serve drinks', zOrder: 3, id: 3, dataConfig: {} },
    { from: 'Hank', to: 'Bob', text: 'finish cooking', zOrder: 5, id: 5, dataConfig: {} },
    { from: 'Bob', to: 'Fred', text: 'serve food', zOrder: 6, id: 6, dataConfig: {} },
    { from: 'Fred', to: 'Renee', text: 'pay', zOrder: 8, id: 8, dataConfig: {} },
  ],
};
