import { Fragment } from 'react';

import { type ModalNames, Modals } from '@/shared/constants/modals';
import { useModalsStore } from '@/shared/stores/useModalsStore';

const ModalsRenderer = () => {
  const { modals, closingModals, finishClosing } = useModalsStore();

  if (!modals.length) {
    return null;
  }

  return (
    <>
      {modals.map((modal, index) => {
        const Component = Modals[modal.name as ModalNames];
        const isClosing = closingModals.has(modal.name);

        if (!Component) {
          return null;
        }

        return (
          <Fragment key={index}>
            <Component
              open={!isClosing}
              onAnimationEnd={() => {
                if (isClosing) {
                  finishClosing(modal.name);
                }
              }}
              {...modal.props}
            />
          </Fragment>
        );
      })}
    </>
  );
};

export default ModalsRenderer;
