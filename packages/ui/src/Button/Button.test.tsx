import { fireEvent, render, screen } from "@testing-library/react-native";

import { Button } from "./Button";

describe("Button", () => {
  it("fires onPress when enabled", async () => {
    const onPress = jest.fn();
    await render(<Button label="Submit" onPress={onPress} />);

    await fireEvent.press(screen.getByRole("button", { name: "Submit" }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not fire onPress when disabled", async () => {
    const onPress = jest.fn();
    await render(<Button label="Submit" disabled onPress={onPress} />);

    await fireEvent.press(screen.getByRole("button", { name: "Submit" }));

    expect(onPress).not.toHaveBeenCalled();
  });

  it("does not fire onPress while loading", async () => {
    const onPress = jest.fn();
    await render(<Button label="Submit" loading onPress={onPress} />);

    await fireEvent.press(screen.getByRole("button", { name: "Submit" }));

    expect(onPress).not.toHaveBeenCalled();
  });

  it("marks disabled and busy state for assistive technology", async () => {
    await render(<Button label="Submit" loading />);

    const button = screen.getByRole("button", { name: "Submit" });
    expect(button.props.accessibilityState).toMatchObject({ disabled: true, busy: true });
  });
});
