export interface Node {
  id: string;
  index?: number;
  group?: string;
  name?: string;
  label?: string;
  objectType?: string;
}

export interface Link {
  source: string;
  index?: number;
  target: string;
  value?: number;
  type?: string;
}

export type ViewBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export interface ForceGraphOptions {
  nodeFill?: string;
  nodeStroke?: string;
  nodeStrokeWidth?: number;
  nodeStrokeOpacity?: number;
  nodeRadius?: number;
  nodeStrength?: number;
  linkSource?: (link: Link) => string;
  linkTarget?: (link: Link) => string;
  linkStroke?: string;
  linkStrokeOpacity?: number;
  linkStrokeWidth?: number;
  linkStrokeLinecap?: string;
  linkStrength?: number;
  viewBox: ViewBox;
  legendWidth?: number;
  legendPadding?: number;
  legendTextSize?: number;
}
