const ModalsRenderer = () => {
  // No modals currently registered - return null
  // When modals are added, uncomment the implementation below
  return null;

  /* Implementation for when modals are registered:
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
  */
};

export default ModalsRenderer;
