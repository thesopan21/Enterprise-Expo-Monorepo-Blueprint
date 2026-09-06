import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { Modal } from './Modal';

describe('Modal', () => {
  it('calls onClose when the backdrop is pressed', async () => {
    const onClose = jest.fn();
    await render(
      <Modal visible onClose={onClose} title="Details">
        <Text>Content</Text>
      </Modal>,
    );

    await fireEvent.press(screen.getByLabelText('Close'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when the content is pressed', async () => {
    const onClose = jest.fn();
    await render(
      <Modal visible onClose={onClose} title="Details">
        <Text>Content</Text>
      </Modal>,
    );

    await fireEvent.press(screen.getByText('Content'));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when the system dismiss (onRequestClose) fires', async () => {
    const onClose = jest.fn();
    await render(
      <Modal visible onClose={onClose} title="Details" testID="modal">
        <Text>Content</Text>
      </Modal>,
    );

    await fireEvent(screen.getByTestId('modal'), 'requestClose');

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
