import { Fragment } from 'react';

import { Modals } from '@constants/modals';

import { useModalsStore } from '@stores/use-modals-store';

const ModalsRenderer = () => {
  const { modals, closingModals, finishClosing } = useModalsStore();

  return (
    <>
      {modals.map(modal => {
        const modalName = modal.name;
        const Component = Modals[modalName as keyof typeof Modals];
        const isClosing = closingModals.has(modalName);

        if (!Component) {
          return null;
        }

        return (
          <Fragment key={modalName}>
            <Component
              {...modal.props}
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
