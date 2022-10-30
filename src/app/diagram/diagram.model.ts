export interface INodeData {
    id: String;
    text: String;
    isGroup: true,
    loc: String;
    duration: number;
    dataConfig: any;
}

export interface ILinkData {
    from: String;
    to: String;
    text: String;
    zOrder: Number;
    id: number;
    dataConfig: any;
}
