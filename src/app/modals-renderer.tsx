import { Fragment } from 'react';

import { Modals, type ModalNames } from '@constants/modals';

import { useModalsStore } from '@stores/use-modals-store';

const ModalsRenderer = () => {
  const { modals, closingModals, finishClosing } = useModalsStore();

  return (
    <>
      {modals.map(modal => {
        const modalName = modal.name as ModalNames;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Component = Modals[modalName] as React.ComponentType<any>;
        const isClosing = closingModals.has(modalName);

        if (!Component) {
          return null;
        }

        return (
          <Fragment key={modalName}>
            <Component
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              {...(modal.props as any)}
              open={!isClosing}
              onAnimationEnd={() => {
                if (isClosing) {
                  finishClosing(modalName);
                }
              }}
            />
          </Fragment>
        );
      })}
    </>
  );
};

export default ModalsRenderer;
