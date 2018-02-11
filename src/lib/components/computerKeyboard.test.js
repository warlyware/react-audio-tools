import React from "react";
import ComputerKeyboard from "./ComputerKeyboard";
import ReactTestRenderer from "react-test-renderer";
import { shallow } from "enzyme";

const setup = propOverrides => {
	const props = Object.assign({
		keyboardLayout: "azerty",
		controlled: true,
		children: () => null,
	}, propOverrides);

	const wrapper = ReactTestRenderer.create(
		<ComputerKeyboard {...props} />
	).toJSON();

	const component = shallow(<ComputerKeyboard {...props} />);

	return {
		props,
		wrapper,
		component,
	};
};

const eventMocker = {};

window.addEventListener = jest.fn().mockImplementation((event, cb) => {
	eventMocker[event] = cb;
});

describe("ComputerKeyboard", () => {
	it("should render without crashing", () => {
		const { wrapper } = setup();

		expect(wrapper).toMatchSnapshot();
	});


	it("should set a sustain message to state when shift is pressed", () => {
		const { component } = setup();

		eventMocker.keydown({ keyCode: 16 });
		const state = component.state();
		const expectedMsg = { "pitch": 127, "type": "cc64", "velocity": 100 };

		expect(state.midiMsg).toEqual(expectedMsg);
	});


	it("should set a noteon message to state when a note key is pressed", () => {
		const { component } = setup();

		eventMocker.keydown({ keyCode: 81 });
		const state = component.state();

		expect(state.midiMsg.type).toBe("noteon");
	});

	it("should set a noteoff message to state when a note key is lifted", () => {
		const { component } = setup();

		eventMocker.keydown({ keyCode: 81 });
		eventMocker.keyup({ keyCode: 81 });

		const state = component.state();

		expect(state.midiMsg.type).toBe("noteoff");
	});


	it("should set the correct octave to state when w or x is pressed", () => {
		const { component } = setup();

		expect(component.state().currentOctave).toBe(3);
		eventMocker.keydown({ keyCode: 87 });
		expect(component.state().currentOctave).toBe(2);
		eventMocker.keydown({ keyCode: 88 });
		eventMocker.keyup({ keyCode: 88 });
		eventMocker.keydown({ keyCode: 88 });
		expect(component.state().currentOctave).toBe(4);
	});


	it("should ignore keypresses we are not listening for", () => {
		const { component } = setup();

		eventMocker.keydown({ keyCode: 45 });
		expect(component.state().midiMsg).toEqual({});
	});


	it("should ignore keypresses if the component is not controlled", () => {
		const { component } = setup({ controlled: false });

		eventMocker.keydown({ keyCode: 81 });
		expect(component.state().midiMsg).toEqual({});
	});


	it("should set a C note midiMsg when the A key on a qwerty keyboard is pressed", () => {
		const { component } = setup({ keyboardLayout: "qwerty" });

		eventMocker.keydown({ keyCode: 65 });
		expect(component.state().midiMsg.pitch).toBe(36);
	});
});