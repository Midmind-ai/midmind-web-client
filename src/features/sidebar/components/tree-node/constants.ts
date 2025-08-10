export const TOOLTIP_DELAY = 500;

export const NODE_STYLES = {
  menuButton: `group/item relative cursor-pointer gap-1.5 rounded-sm p-1.5
    group-has-data-[sidebar=menu-action]/menu-item:pr-1.5 hover:pr-8
    data-[active=true]:font-normal`,
  chevron: `hover:bg-sidebar-accent cursor-pointer rounded p-1 transition-transform`,
  collapsible: `group/collapsible [&[data-state=open]>div>svg:first-child]:rotate-90`,
  icon: `stroke-[1.5px]`,
  nodeText: `text-primary block truncate`,
  moreActionsMenu: `opacity-0 group-hover/item:opacity-100`,
  childrenContainer: `ml-2.5 pl-3.5`,
  loadingContainer: `space-y-2`,
  expandContainer: `flex items-center gap-[3px]`,
} as const;

export const SKELETON_COUNT = 1;
