export interface QlikStream {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  count: number;
  isPersonal?: boolean;
}

export interface QlikSheet {
  id: string;
  title: string;
  description: string;
  chartType: 'kpi' | 'bar' | 'table' | 'line' | 'scatter' | 'combo';
  metricsSummary: {
    label: string;
    value: string;
    delta?: string;
    isPositive?: boolean;
  }[];
}

export interface QlikFilterSelection {
  field: string;
  selectedValues: string[];
  mode: 'selected' | 'alternative' | 'excluded';
}

export interface QlikApp {
  id: string;
  title: string;
  description: string;
  streamId: string;
  streamName: string;
  owner: string;
  lastReloadTime: string;
  tags: string[];
  thumbnailGradient: string;
  iconName: string;
  activeBadge?: {
    text: string;
    type: 'success' | 'info' | 'warning' | 'neutral';
  };
  sheets: QlikSheet[];
  isFavorite?: boolean;
}
