import { create } from 'zustand';

type ExpandedNodesState = {
  expandedNodes: Set<string>;
  expandNode: (nodeId: string) => void;
  collapseNode: (nodeId: string) => void;
  isExpanded: (nodeId: string) => boolean;
  setExpanded: (nodeId: string, expanded: boolean) => void;
};

export const useExpandedNodesStore = create<ExpandedNodesState>((set, get) => ({
  expandedNodes: new Set<string>(),

  expandNode: (nodeId: string) => {
    set(state => ({
      expandedNodes: new Set([...state.expandedNodes, nodeId]),
    }));
  },

  collapseNode: (nodeId: string) => {
    set(state => {
      const newExpandedNodes = new Set(state.expandedNodes);
      newExpandedNodes.delete(nodeId);

      return { expandedNodes: newExpandedNodes };
    });
  },

  isExpanded: (nodeId: string) => {
    return get().expandedNodes.has(nodeId);
  },

  setExpanded: (nodeId: string, expanded: boolean) => {
    if (expanded) {
      get().expandNode(nodeId);
    } else {
      get().collapseNode(nodeId);
    }
  },
}));
