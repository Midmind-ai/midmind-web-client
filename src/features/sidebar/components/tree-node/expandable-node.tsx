import { useState } from 'react';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@radix-ui/react-collapsible';
import { ChevronRight } from 'lucide-react';

import EditableText from '@shared/components/ui/editable-text';
import { SidebarMenuButton, SidebarMenuItem } from '@shared/components/ui/sidebar';

import { useInlineEditStore } from '@shared/stores/use-inline-edit-store';

import MoreActionsMenu from '@features/sidebar/components/more-actions-menu/more-actions-menu';
import { useCreateDirectory } from '@features/sidebar/hooks/use-create-directory';
import type { TreeNode as TreeNodeType } from '@features/sidebar/hooks/use-tree-data';
import { useUpdateDirectory } from '@features/sidebar/hooks/use-update-directory';

import ChildrenList from './children-list';
import NodeIcon from './node-icon';
import TooltipWrapper from './tooltip-wrapper';
import { useTreeNodeActions } from './use-tree-node-actions';

type Props = {
  node: TreeNodeType;
  isActive: boolean;
  isDeleting: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  childNodes?: TreeNodeType[];
  isLoadingChildren: boolean;
  onDelete: VoidFunction;
  onOpenInSidePanel: (id: string) => void;
  onOpenInNewTab: (id: string) => void;
  onClick: VoidFunction;
  TreeNodeComponent: React.ComponentType<{
    node: TreeNodeType;
    isDeleting: boolean;
    onDelete: VoidFunction;
    onOpenInSidePanel: (id: string) => void;
    onOpenInNewTab: (id: string) => void;
  }>;
};

const ExpandableNode = ({
  node,
  isActive,
  isDeleting,
  isOpen,
  setIsOpen,
  childNodes,
  isLoadingChildren,
  onDelete,
  onOpenInSidePanel,
  onOpenInNewTab,
  onClick,
  TreeNodeComponent,
}: Props) => {
  const [isHovered, setIsHovered] = useState(false);

  const { updateDirectory } = useUpdateDirectory();
  const { finalizeDirectoryCreation, removeTemporaryDirectory } = useCreateDirectory();
  const { isEditing } = useInlineEditStore();
  const isCurrentlyEditing = isEditing(node.id);

  const { handleDelete, handleOpenInSidePanel, handleOpenInNewTab } = useTreeNodeActions({
    nodeId: node.id,
    onDelete,
    onOpenInSidePanel,
    onOpenInNewTab,
  });

  const handleDirectoryRename = async (newName: string) => {
    if (node.type === 'directory') {
      // Check if this is a new directory (empty name means it was just created)
      if (node.name === '') {
        // This is a new directory being named for the first time
        await finalizeDirectoryCreation(node.id, newName);
      } else {
        // This is an existing directory being renamed
        await updateDirectory({ id: node.id, name: newName });
      }
    }
  };

  const handleDirectoryCancel = async () => {
    if (node.type === 'directory' && node.name === '') {
      // This is a new directory being canceled - remove from cache
      const parentDirectoryId = node.parentDirectoryId || undefined;
      await removeTemporaryDirectory(node.id, parentDirectoryId);
    }
  };

  const handleChevronClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Prevent expand/collapse when in edit mode
    if (isCurrentlyEditing) {
      return;
    }

    setIsOpen(!isOpen);
  };

  return (
    <SidebarMenuItem>
      <Collapsible
        className="group/collapsible [&[data-state=open]>div>svg:first-child]:rotate-90"
        open={isOpen}
        onOpenChange={isCurrentlyEditing ? undefined : setIsOpen}
      >
        <div className="flex items-center gap-[3px]">
          <TooltipWrapper content={node.name}>
            <SidebarMenuButton
              isActive={isActive}
              className="group/item relative cursor-pointer gap-1.5 rounded-sm p-1 pr-8
                data-[active=true]:font-normal"
              onClick={onClick}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <CollapsibleTrigger asChild>
                <div
                  onClick={handleChevronClick}
                  className={`relative flex size-6 flex-shrink-0 items-center
                    justify-center rounded-[4px] transition-colors ${
                      isCurrentlyEditing
                        ? 'cursor-not-allowed opacity-50'
                        : 'hover:bg-sidebar cursor-pointer'
                    }`}
                >
                  <ChevronRight
                    className={`absolute size-5 stroke-[1.5px] transition-transform
                      ${isOpen ? 'rotate-90' : ''}
                      ${isHovered && !isCurrentlyEditing ? 'opacity-100' : 'opacity-0'}`}
                  />
                  <div
                    className={`${isHovered && !isCurrentlyEditing ? 'opacity-0' : 'opacity-100'}`}
                  >
                    <NodeIcon
                      nodeType={node.type}
                      hasChildren={node.hasChildren}
                    />
                  </div>
                </div>
              </CollapsibleTrigger>
              <EditableText
                entityId={node.id}
                currentValue={node.name}
                onSave={handleDirectoryRename}
                onCancel={handleDirectoryCancel}
                className="text-primary block truncate"
                placeholder="Directory name..."
              />
              <MoreActionsMenu
                triggerClassNames="opacity-0 group-hover/item:opacity-100"
                isDeleting={isDeleting}
                onDelete={handleDelete}
                onOpenInSidePanel={handleOpenInSidePanel}
                onOpenInNewTab={handleOpenInNewTab}
              />
            </SidebarMenuButton>
          </TooltipWrapper>
        </div>
        <CollapsibleContent>
          <ChildrenList
            isLoadingChildren={isLoadingChildren}
            childNodes={childNodes}
            isDeleting={isDeleting}
            onDelete={onDelete}
            onOpenInSidePanel={onOpenInSidePanel}
            onOpenInNewTab={onOpenInNewTab}
            TreeNodeComponent={TreeNodeComponent}
          />
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
};

export default ExpandableNode;
