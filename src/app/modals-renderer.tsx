import { Fragment } from 'react';

import { Modals } from '@shared/constants/modals';

import { useModalsStore } from '@shared/stores/use-modals-store';

const ModalsRenderer = () => {
  const { modals, closingModals, finishClosing } = useModalsStore();

  return (
    <>
      {modals.map(modal => {
        const modalName = modal.name;
        const Component = Modals[modalName];
        const isClosing = closingModals.has(modalName);

        if (!Component) {
          return null;
        }

        return (
          <Fragment key={modalName}>
            {/* @ts-expect-error props are type-checked in openModal function */}
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
