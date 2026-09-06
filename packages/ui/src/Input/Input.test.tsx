import { fireEvent, render, screen } from '@testing-library/react-native';

import { Input } from './Input';

describe('Input', () => {
  it('calls onChangeText with the new value', async () => {
    const onChangeText = jest.fn();
    await render(<Input label="Email" onChangeText={onChangeText} />);

    await fireEvent.changeText(screen.getByLabelText('Email'), 'user@example.com');

    expect(onChangeText).toHaveBeenCalledWith('user@example.com');
  });

  it('renders the current value', async () => {
    await render(<Input label="Email" value="user@example.com" onChangeText={jest.fn()} />);

    expect(screen.getByDisplayValue('user@example.com')).toBeTruthy();
  });

  it('renders an error message when provided', async () => {
    await render(<Input label="Email" error="Email is required" onChangeText={jest.fn()} />);

    expect(screen.getByText('Email is required')).toBeTruthy();
  });

  it('marks the field disabled for assistive technology', async () => {
    await render(<Input label="Email" disabled onChangeText={jest.fn()} />);

    const field = screen.getByLabelText('Email');
    expect(field.props.accessibilityState).toMatchObject({ disabled: true });
    expect(field.props.editable).toBe(false);
  });
});
