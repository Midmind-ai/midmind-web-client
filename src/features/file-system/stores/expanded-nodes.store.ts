import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ExpandedNodesState = {
  expandedNodes: Set<string>;
  expandNode: (nodeId: string) => void;
  collapseNode: (nodeId: string) => void;
  isExpanded: (nodeId: string) => boolean;
  setExpanded: (nodeId: string, expanded: boolean) => void;
};

export const useExpandedNodesStore = create<ExpandedNodesState>()(
  persist(
    (set, get) => ({
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
    }),
    {
      name: 'expanded-nodes-storage',
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error('Error rehydrating expanded nodes store:', error);
          } else {
            console.warn('Rehydrated expanded nodes:', state?.expandedNodes);
          }
        };
      },
      storage: {
        getItem: name => {
          try {
            const str = localStorage.getItem(name);
            if (!str) {
              return null;
            }

            const parsed = JSON.parse(str);

            return {
              ...parsed,
              state: {
                ...parsed.state,
                expandedNodes: new Set(parsed.state?.expandedNodes || []),
              },
            };
          } catch (error) {
            console.error('Error loading expanded nodes from storage:', error);

            return null;
          }
        },
        setItem: (name, value) => {
          try {
            const { expandedNodes, ...rest } = value.state;
            localStorage.setItem(
              name,
              JSON.stringify({
                ...value,
                state: {
                  ...rest,
                  expandedNodes: Array.from(expandedNodes),
                },
              })
            );
          } catch (error) {
            console.error('Error saving expanded nodes to storage:', error);
          }
        },
        removeItem: name => localStorage.removeItem(name),
      },
    }
  )
);
