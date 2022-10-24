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
  nodeDataArray: INode[];
  linkDataArray: any[];
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
      dataConfig: {},
    },
    {
      id: 'Bob',
      text: 'Bob: Waiter',
      isGroup: true,
      loc: '100 0',
      duration: 9,
      dataConfig: {
        content: '',
      },
    },
    {
      id: 'Hank',
      text: 'Hank: Cook',
      isGroup: true,
      loc: '200 0',
      duration: 9,
      dataConfig: {
        content: '',
      },
    },
    {
      id: 'Renee',
      text: 'Renee: Cashier',
      isGroup: true,
      loc: '300 0',
      duration: 9,
      dataConfig: {
        content: '',
      },
    },
    { group: 'Bob', start: 1, duration: 2 },
    { group: 'Hank', start: 2, duration: 3 },
    { group: 'Fred', start: 3, duration: 1 },
    { group: 'Bob', start: 5, duration: 1 },
    { group: 'Fred', start: 6, duration: 2 },
    { group: 'Renee', start: 8, duration: 1 },
  ],
  linkDataArray: [
    { from: 'Fred', to: 'Bob', text: 'order', zOrder: 1, id: 1 },
    { from: 'Bob', to: 'Hank', text: 'order food', zOrder: 2, id: 2 },
    { from: 'Bob', to: 'Fred', text: 'serve drinks', zOrder: 3, id: 3 },
    { from: 'Hank', to: 'Bob', text: 'finish cooking', zOrder: 5, id: 5 },
    { from: 'Bob', to: 'Fred', text: 'serve food', zOrder: 6, id: 6 },
    { from: 'Fred', to: 'Renee', text: 'pay', zOrder: 8, id: 8 },
  ],
};
