import 'raf/polyfill';
import React from 'react';
import Enzyme, {mount} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Typeahead from './Typeahead';

Enzyme.configure({adapter: new Adapter()});

const KEY_TAB = 9;
const KEY_ENTER = 13;
const KEY_UP = 38;
const KEY_DOWN = 40;

const options = [
    {label: 'label1', value: 'value1'},
    {label: 'label2', value: 'value2'}
];

const option = {
    label: 'label',
    value: 'value'
};

const groups = [
    {label: 'Group 1', value: 'group1'},
    {label: 'Group 2', value: 'group2'}
];

const optionsWithGroups = [
    {label: 'label1', value: 'value1', group: 'group1'},
    {label: 'label2', value: 'value2', group: 'group2'},
    {label: 'label3', value: 'value3', group: 'group1'},
    {label: 'label4', value: 'value4', group: 'group2'}
];

describe('Typeahead should', () => {
    it('render with fieldName only', () => {
        mount(<Typeahead fieldName="fieldName"/>);
    });

    it('render with options', () => {
        mount(<Typeahead fieldName="fieldName" options={options}/>);
    });

    it('don\' open menu by default', () => {
        const wrapper = mount(<Typeahead fieldName="fieldName" options={options}/>);

        expect(wrapper.state('isOpen')).toBe(false);
    });

    it('open menu on focus enter', () => {
        const wrapper = mount(<Typeahead fieldName="fieldName" options={options}/>);
        wrapper.find('input').simulate('focus');

        expect(wrapper.state('isOpen')).toBe(true);
    });

    it('open menu on arrow key down', () => {
        const wrapper = mount(<Typeahead fieldName="fieldName" options={options}/>);
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_DOWN});

        expect(wrapper.state('isOpen')).toBe(true);
    });

    it('close menu on focus lost', () => {
        const wrapper = mount(<Typeahead fieldName="fieldName" options={options}/>);
        wrapper.find('input').simulate('focus');
        wrapper.find('input').simulate('blur');

        expect(wrapper.state('isOpen')).toBe(false);
    });

    it('accept value from props when value is known from options', () => {
        const wrapper = mount(<Typeahead fieldName="fieldName" options={options} value="value1"/>);
        expect(wrapper.find('input').prop('value')).toEqual('label1');
    });

    it('not accept value from props when value is not known from options', () => {
        const wrapper = mount(<Typeahead fieldName="fieldName" options={options} value="unknownValue"/>);
        expect(wrapper.find('input').prop('value')).toEqual('');
    });

    it('update value from props when value prop has changed', () => {
        const wrapper = mount(<Typeahead fieldName="fieldName" options={options} value="value1"/>);
        wrapper.setProps({
            value: 'value2'
        });
        expect(wrapper.find('input').prop('value')).toEqual('label2');
    });

    it('render menu when focussed', () => {
        const wrapper = mount(<Typeahead fieldName="fieldName" options={options}/>);
        wrapper.find('input').simulate('focus');
        expect(wrapper.find('.typeahead__options').exists()).toBe(true);
    });

    it('render menu when clicked', () => {
        const wrapper = mount(<Typeahead fieldName="fieldName" options={options}/>);
        wrapper.find('input').simulate('mouseDown');
        expect(wrapper.find('.typeahead__options').exists()).toBe(true);
    });

    it('render options in menu when focussed', () => {
        const wrapper = mount(<Typeahead fieldName="fieldName" options={options}/>);
        wrapper.find('input').simulate('focus');
        const value1Option = wrapper.find('.typeahead__option[data-value="value1"]');
        expect(value1Option.exists()).toBe(true);
        const value2Option = wrapper.find('.typeahead__option[data-value="value2"]');
        expect(value2Option.exists()).toBe(true);
    });

    it('highlight option with value from props', function () {
        const wrapper = mount(<Typeahead fieldName="fieldName" options={options} value="value1"/>);
        wrapper.find('input').simulate('focus');
        const value1Option = wrapper.find('.typeahead__option[data-value="value1"]');
        expect(Boolean(value1Option.prop('data-highlighted'))).toEqual(true);
    });

    it('highlight no option when no value is set', function () {
        const wrapper = mount(<Typeahead fieldName="fieldName" options={options}/>);
        wrapper.find('input').simulate('focus');
        const highlightedOption = wrapper.find('.typeahead__option[data-highlighted=true]');
        expect(highlightedOption.exists()).toEqual(false);
    });

    it('highlight first option when no value is set and arrow down key is pressed', function () {
        const wrapper = mount(<Typeahead fieldName="fieldName" options={options}/>);
        wrapper.find('input').simulate('focus');
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_DOWN});
        const value1Option = wrapper.find('.typeahead__option[data-value="value1"]');
        expect(Boolean(value1Option.prop('data-highlighted'))).toEqual(true);
    });

    it('highlight second option when no value is set and arrow down key is pressed twice', function () {
        const wrapper = mount(<Typeahead fieldName="fieldName" options={options}/>);
        wrapper.find('input').simulate('focus');
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_DOWN});
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_DOWN});
        const value1Option = wrapper.find('.typeahead__option[data-value="value2"]');
        expect(Boolean(value1Option.prop('data-highlighted'))).toEqual(true);
    });

    it('highlight first option when no value is set and arrow up key is pressed', function () {
        const wrapper = mount(<Typeahead fieldName="fieldName" options={options}/>);
        wrapper.find('input').simulate('focus');
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_UP});
        const value1Option = wrapper.find('.typeahead__option[data-value="value1"]');
        expect(Boolean(value1Option.prop('data-highlighted'))).toEqual(true);
    });

    it('filter rendered options when (partial) value is entered', () => {
        const wrapper = mount(<Typeahead fieldName="fieldName" options={options}/>);
        wrapper.find('input').simulate('focus');
        simulateKeyPresses(wrapper.find('input'), 'label2');
        const value1Option = wrapper.find('.typeahead__option[data-value="value1"]');
        expect(value1Option.exists()).toBe(false);
        const value2Option = wrapper.find('.typeahead__option[data-value="value2"]');
        expect(value2Option.exists()).toBe(true);
    });

    it('highlight first filtered option when (partial) value is entered', () => {
        const wrapper = mount(<Typeahead fieldName="fieldName" options={options}/>);
        wrapper.find('input').simulate('focus');
        simulateKeyPresses(wrapper.find('input'), 'label1');
        const value1Option = wrapper.find('.typeahead__option[data-value="value1"]');
        expect(value1Option.exists()).toBe(true);
        expect(Boolean(value1Option.prop('data-highlighted'))).toEqual(true);
    });

    it('don\'t update value to highlighted option when no other key is pressed', () => {
        const wrapper = mount(<Typeahead fieldName="fieldName" options={options} value="value1"/>);
        wrapper.find('input').simulate('focus');
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_DOWN});
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_DOWN});
        expect(wrapper.state('value')).toEqual('value1');
    });

    it('update value to highlighted option when tab is pressed and focus is lost', () => {
        const wrapper = mount(<Typeahead fieldName="fieldName" options={options}/>);
        wrapper.find('input').simulate('focus');
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_DOWN});
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_DOWN});
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_TAB});
        wrapper.find('input').simulate('blur');
        expect(wrapper.state('value')).toEqual('value2');
    });

    it('update value to highlighted option when enter is pressed', () => {
        const wrapper = mount(<Typeahead fieldName="fieldName" options={options}/>);
        wrapper.find('input').simulate('focus');
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_DOWN});
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_DOWN});
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_ENTER});
        expect(wrapper.state('value')).toEqual('value2');
    });

    it('update value to highlighted option after highlight changes when tab is pressed and focus is lost', () => {
        const wrapper = mount(<Typeahead fieldName="fieldName" options={options}/>);
        wrapper.find('input').simulate('focus');
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_UP}); // => value1
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_DOWN}); // => value2
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_DOWN}); // => value2
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_UP}); // => value1
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_UP}); // => value1
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_UP}); // => value1
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_DOWN}); // => value2
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_TAB});
        wrapper.find('input').simulate('blur');
        expect(wrapper.state('value')).toEqual('value2');
    });

    it('update value to highlighted option after highlight changes when enter is pressed', () => {
        const wrapper = mount(<Typeahead fieldName="fieldName" options={options}/>);
        wrapper.find('input').simulate('focus');
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_UP}); // => value1
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_DOWN}); // => value2
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_DOWN}); // => value2
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_UP}); // => value1
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_UP}); // => value1
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_UP}); // => value1
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_DOWN}); // => value2
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_ENTER});
        expect(wrapper.state('value')).toEqual('value2');
    });

    it('update value to clicked option', () => {
        const wrapper = mount(<Typeahead fieldName="fieldName" options={options}/>);
        wrapper.find('input').simulate('focus');
        const value2Option = wrapper.find('.typeahead__option[data-value="value2"]');
        value2Option.simulate('mouseDown');
        expect(wrapper.state('value')).toEqual('value2');
    });

    it('render initial value', () => {
        const wrapper = mount(<Typeahead fieldName="fieldName" options={options} value="value1"/>);
        expect(wrapper.find('input').prop('value')).toEqual('label1');
    });

    it('render updated value', () => {
        const wrapper = mount(<Typeahead fieldName="fieldName" options={options}/>);
        wrapper.find('input').simulate('focus');
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_UP}); // => value1
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_ENTER});
        expect(wrapper.find('input').prop('value')).toEqual('label1');
    });

    it('close menu when tab is pressed and focus is lost', () => {
        const wrapper = mount(<Typeahead fieldName="fieldName" options={options}/>);
        wrapper.find('input').simulate('focus');
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_TAB});
        wrapper.find('input').simulate('blur');
        expect(wrapper.state('isOpen')).toBe(false);
    });

    it('close menu when enter is pressed', () => {
        const wrapper = mount(<Typeahead fieldName="fieldName" options={options}/>);
        wrapper.find('input').simulate('focus');
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_ENTER});
        expect(wrapper.state('isOpen')).toBe(false);
    });

    it('close menu when option is clicked', function () {
        const wrapper = mount(<Typeahead fieldName="fieldName" options={options}/>);
        wrapper.find('input').simulate('focus');
        const value2Option = wrapper.find('.typeahead__option[data-value="value1"]');
        value2Option.simulate('mouseDown');
        expect(wrapper.state('isOpen')).toBe(false);
    });

    it('be disabled when isDisabled prop is true', () => {
        const wrapper = mount(<Typeahead fieldName="fieldName" isDisabled={true}/>);
        expect(Boolean(wrapper.find('input').prop('disabled'))).toEqual(true);
    });

    it('not be disabled when isDisabled prop is false', () => {
        const wrapper = mount(<Typeahead fieldName="fieldName" isDisabled={false}/>);
        expect(Boolean(wrapper.find('input').prop('disabled'))).toEqual(false);
    });

    it('not be disabled when isDisabled prop is missing', () => {
        const wrapper = mount(<Typeahead fieldName="fieldName"/>);
        expect(Boolean(wrapper.find('input').prop('disabled'))).toEqual(false);
    });

    it('call onChange prop with fieldName and value when value is set using arrow keys and pressing enter', () => {
        const handleChange = jest.fn();
        const wrapper = mount(<Typeahead fieldName="fieldName" options={options} onChange={handleChange}/>);
        wrapper.find('input').simulate('focus');
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_DOWN});
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_ENTER});
        expect(handleChange.mock.calls.length).toBe(1);
        expect(handleChange.mock.calls[0][0]).toBe('fieldName');
        expect(handleChange.mock.calls[0][1]).toBe('value1');
    });

    it('call onChange prop with fieldName and value when value is set using arrow keys and losing focus', () => {
        const handleChange = jest.fn();
        const wrapper = mount(<Typeahead fieldName="fieldName" options={options} onChange={handleChange}/>);
        wrapper.find('input').simulate('focus');
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_DOWN});
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_DOWN});
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_TAB});
        wrapper.find('input').simulate('blur');
        expect(handleChange.mock.calls.length).toBe(1);
        expect(handleChange.mock.calls[0][0]).toBe('fieldName');
        expect(handleChange.mock.calls[0][1]).toBe('value2');
    });

    it('call onChange prop with fieldName and value when value is set using mouse click', () => {
        const handleChange = jest.fn();
        const wrapper = mount(<Typeahead fieldName="fieldName" options={options} onChange={handleChange}/>);
        wrapper.find('input').simulate('focus');
        const value1Option = wrapper.find('.typeahead__option[data-value="value1"]');
        value1Option.simulate('mouseDown');
        expect(handleChange.mock.calls.length).toBe(1);
        expect(handleChange.mock.calls[0][0]).toBe('fieldName');
        expect(handleChange.mock.calls[0][1]).toBe('value1');
    });

    it('not call onChange with fieldName and value when allowUnknownValue prop is missing and value is unknown', () => {
        const handleChange = jest.fn();
        const wrapper = mount(<Typeahead fieldName="fieldName" options={options} onChange={handleChange}/>);
        wrapper.find('input').simulate('focus');
        simulateKeyPresses(wrapper.find('input'), 'unknownValue');
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_TAB});
        expect(handleChange.mock.calls.length).toBe(0);
    });

    it('call onChange with fieldName and value when allowUnknownValue prop is true and value is unknown', () => {
        const handleChange = jest.fn();
        const wrapper = mount(
            <Typeahead fieldName="fieldName" options={options} allowUnknownValue={true} onChange={handleChange}/>
        );
        wrapper.find('input').simulate('focus');
        simulateKeyPresses(wrapper.find('input'), 'unknownValue');
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_TAB});
        wrapper.find('input').simulate('blur');
        expect(handleChange.mock.calls.length).toBe(1);
        expect(handleChange.mock.calls[0][0]).toBe('fieldName');
        expect(handleChange.mock.calls[0][1]).toBe('unknownValue');
    });

    it('call onBlur with fieldName and value when focus is lost', () => {
        const handleBlur = jest.fn();
        const wrapper = mount(
            <Typeahead fieldName="fieldName" options={options} onBlur={handleBlur}/>
        );
        wrapper.find('input').simulate('focus');
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_DOWN});
        wrapper.find('input').simulate('blur');
        expect(handleBlur.mock.calls.length).toBe(1);
        expect(handleBlur.mock.calls[0][0]).toBe('fieldName');
        expect(handleBlur.mock.calls[0][1]).toBe('value1');
    });

    it('call onChange only once when focus is lost by pressing tab', () => {
        const handleChange = jest.fn();
        const wrapper = mount(
            <Typeahead fieldName="fieldName" options={options} onChange={handleChange}/>
        );
        wrapper.find('input').simulate('focus');
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_DOWN});
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_TAB});
        wrapper.find('input').simulate('blur');
        expect(handleChange.mock.calls.length).toBe(1);
    });

    it('call onChange multiple times when value is changed multiple times', () => {
        const handleChange = jest.fn();
        const wrapper = mount(
            <Typeahead fieldName="fieldName" options={options} onChange={handleChange}/>
        );
        wrapper.find('input').simulate('focus');
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_DOWN}); // value1
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_ENTER});
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_DOWN}); // value1
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_DOWN}); // value2
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_TAB});
        wrapper.find('input').simulate('blur');
        expect(handleChange.mock.calls.length).toBe(2);
    });

    it('call onChange multiple times with the correct values', () => {
        const handleChange = jest.fn();
        const wrapper = mount(
            <Typeahead fieldName="fieldName" options={options} onChange={handleChange}/>
        );
        wrapper.find('input').simulate('focus');
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_DOWN}); // value1
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_ENTER});
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_DOWN}); // value1
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_DOWN}); // value2
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_TAB});
        wrapper.find('input').simulate('blur');
        expect(handleChange.mock.calls.length).toBe(2);
        expect(handleChange.mock.calls[0][1]).toBe('value1');
        expect(handleChange.mock.calls[1][1]).toBe('value2');
    });

    it('call onChange with new value when value is changed by clicking', () => {
        const handleChange = jest.fn();
        const wrapper = mount(
            <Typeahead fieldName="fieldName" options={options} onChange={handleChange}/>
        );
        wrapper.find('input').simulate('focus');
        const value2Option = wrapper.find('.typeahead__option[data-value="value2"]');
        value2Option.simulate('mouseDown');
        wrapper.find('input').simulate('focus');
        const value1Option = wrapper.find('.typeahead__option[data-value="value1"]');
        value1Option.simulate('mouseDown');
        expect(handleChange.mock.calls.length).toBe(2);
        expect(handleChange.mock.calls[0][1]).toEqual('value2');
        expect(handleChange.mock.calls[1][1]).toEqual('value1');
    });

    it('call onChange and onBlur with new value when value is changed by clicking and blurring', () => {
        const handleChange = jest.fn();
        const handleBlur = jest.fn();
        const wrapper = mount(
            <Typeahead fieldName="fieldName" options={options} onChange={handleChange} onBlur={handleBlur}/>
        );
        wrapper.find('input').simulate('focus');
        const value2Option = wrapper.find('.typeahead__option[data-value="value2"]');
        value2Option.simulate('mouseDown');
        wrapper.find('input').simulate('blur');
        expect(handleChange.mock.calls.length).toBe(1);
        expect(handleChange.mock.calls[0][1]).toEqual('value2');
        expect(handleBlur.mock.calls.length).toBe(1);
        expect(handleBlur.mock.calls[0][1]).toEqual('value2');
    });

    it('call onChange and onBlur with new value when value is changed by clicking and blurring repeatedly', () => {
        const handleChange = jest.fn();
        const handleBlur = jest.fn();
        const wrapper = mount(
            <Typeahead fieldName="fieldName" options={options} onChange={handleChange} onBlur={handleBlur}/>
        );
        wrapper.find('input').simulate('focus');
        const value2Option = wrapper.find('.typeahead__option[data-value="value2"]');
        value2Option.simulate('mouseDown');
        wrapper.setProps({value: 'value2'});
        wrapper.update();
        wrapper.find('input').simulate('focus');
        const value1Option = wrapper.find('.typeahead__option[data-value="value1"]');
        value1Option.simulate('mouseDown');
        wrapper.find('input').simulate('blur');
        wrapper.find('input').simulate('blur');
        expect(handleChange.mock.calls.length).toBe(2);
        expect(handleChange.mock.calls[0][1]).toEqual('value2');
        expect(handleChange.mock.calls[1][1]).toEqual('value1');
        expect(handleBlur.mock.calls.length).toBe(2);
        expect(handleBlur.mock.calls[0][1]).toEqual('value1');
        expect(handleBlur.mock.calls[1][1]).toEqual('value1');
    });

    it('set new label when value is changed by clicking', () => {
        const wrapper = mount(
            <Typeahead fieldName="fieldName" options={options}/>
        );
        wrapper.find('input').simulate('focus');
        const value2Option = wrapper.find('.typeahead__option[data-value="value2"]');
        value2Option.simulate('mouseDown');
        expect(wrapper.find('input').prop('value')).toEqual('label2');
        wrapper.find('input').simulate('focus');
        const value1Option = wrapper.find('.typeahead__option[data-value="value1"]');
        value1Option.simulate('mouseDown');
        expect(wrapper.find('input').prop('value')).toEqual('label1');
    });

    it('call onBlur only once when focus is lost by pressing tab', () => {
        const handleBlur = jest.fn();
        const wrapper = mount(
            <Typeahead fieldName="fieldName" options={options} onBlur={handleBlur}/>
        );
        wrapper.find('input').simulate('focus');
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_DOWN});
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_TAB});
        wrapper.find('input').simulate('blur');
        expect(handleBlur.mock.calls.length).toBe(1);
    });

    it('lose focus when tab is pressed', () => {
        const wrapper = mount(
            <Typeahead fieldName="fieldName"/>
        );
        wrapper.find('input').simulate('focus');
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_TAB});
        wrapper.find('input').simulate('blur');
        expect(document.activeElement.tagName).toEqual('BODY');
    });

    it('render no found options message when unknown value is entered', () => {
        const wrapper = mount(
            <Typeahead fieldName="fieldName" options={options}/>
        );
        wrapper.find('input').simulate('focus');
        simulateKeyPresses(wrapper.find('input'), 'unknownValue');
        expect(wrapper.find('.typeahead__no_options').exists()).toBe(true);
        expect(wrapper.find('.typeahead__no_options__keyword').text()).toEqual('unknownValue');
        expect(wrapper.find('.typeahead__no_options').html()).toContain('nicht gefunden');
    });

    it('don\'t render no found options message when unknown value is entered and allowUnknownValue is true', () => {
        const wrapper = mount(
            <Typeahead fieldName="fieldName" options={options} allowUnknownValue={true}/>
        );
        wrapper.find('input').simulate('focus');
        simulateKeyPresses(wrapper.find('input'), 'unknownValue');
        expect(wrapper.find('.typeahead__no_options').exists()).toBe(false);
    });

    it('render special option while typing for unknown value when allowUnknownValue is true', () => {
        const wrapper = mount(
            <Typeahead fieldName="fieldName" options={options} allowUnknownValue={true}/>
        );
        wrapper.find('input').simulate('focus');
        simulateKeyPresses(wrapper.find('input'), 'unknownValue');
        expect(wrapper.find('.typeahead__option').exists()).toBe(true);
        expect(wrapper.find('.typeahead__option').html()).toContain('unknownValue');
        expect(wrapper.find('.typeahead__option').html()).toContain('(+)');
    });

    it('render special option when menu is reopened for unknown value when allowUnknownValue is true', () => {
        const wrapper = mount(
            <Typeahead fieldName="fieldName" options={options} allowUnknownValue={true}/>
        );
        wrapper.find('input').simulate('focus');
        simulateKeyPresses(wrapper.find('input'), 'unknownValue');
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_TAB});
        wrapper.find('input').simulate('blur');
        wrapper.find('input').simulate('focus');
        expect(wrapper.find('.typeahead__option[data-value="unknownValue"]').exists()).toBe(true);
        expect(wrapper.find('.typeahead__option[data-value="unknownValue"]').html()).toContain('unknownValue');
        expect(wrapper.find('.typeahead__option[data-value="unknownValue"]').html()).toContain('(+)');
    });

    it('render clear button when isClearable prop is true', () => {
        const wrapper = mount(
            <Typeahead fieldName="fieldName" options={options} allowUnknownValue={true} isClearable={true}
                value="value1"/>
        );
        expect(wrapper.find('.typeahead__clear').exists()).toBe(true);
    });

    it('clear value when clear button is clicked', () => {
        const wrapper = mount(
            <Typeahead fieldName="fieldName" options={options} allowUnknownValue={true} isClearable={true}
                value="value1"/>
        );
        wrapper.find('.typeahead__clear').simulate('click');
        expect(wrapper.state('value')).not.toBeDefined();
        expect(wrapper.state('highlightedIndex')).not.toBeDefined();
        expect(wrapper.state('typedLabel')).toEqual('');
    });

    it('clear value when label is emptied and isClearable is true', () => {
        const wrapper = mount(<Typeahead fieldName="fieldName" options={options} isClearable={true}/>);
        wrapper.find('input').simulate('focus');
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_DOWN});
        wrapper.find('input').simulate('keyDown', {keyCode: KEY_TAB});
        wrapper.find('input').simulate('blur');
        wrapper.find('input').simulate('focus');
        wrapper.find('input').simulate('change', {target: {value: ''}});
        wrapper.find('input').simulate('blur');
        expect(wrapper.find('input').prop('value')).toEqual('');
    });

    it('call onChange with empty value when clear button is clicked', () => {
        const handleChange = jest.fn();
        const wrapper = mount(
            <Typeahead fieldName="fieldName" options={options} allowUnknownValue={true} isClearable={true}
                value="value1" onChange={handleChange}/>
        );
        wrapper.find('.typeahead__clear').simulate('click');
        expect(handleChange.mock.calls.length).toBe(1);
        expect(handleChange.mock.calls[0][1]).toBeUndefined();
    });

    it('set value to the first option when autoSelectSingleOption is true', () => {
        const wrapper = mount(<Typeahead fieldName="fieldName" options={[option]} autoSelectSingleOption={true}/>);
        expect(wrapper.find('input').prop('value')).toEqual('label');
    });

    it('call onChange with the first option when autoSelectSingleOption is true', () => {
        const handleChange = jest.fn();
        mount(
            <Typeahead fieldName="fieldName" options={[option]} autoSelectSingleOption={true} onChange={handleChange}/>
        );
        expect(handleChange.mock.calls.length).toBe(1);
        expect(handleChange.mock.calls[0][1]).toEqual('value');
    });

    it('render groups when groups prop is provided', () => {
        const wrapper = mount(<Typeahead fieldName="fieldName" options={optionsWithGroups} groups={groups}/>);
        wrapper.find('input').simulate('focus');

        const value1Option = wrapper.find('.typeahead__option[data-value="value1"]');
        expect(value1Option.exists()).toBe(true);
        expect(value1Option.prop('data-group')).toEqual('group1');

        const value2Option = wrapper.find('.typeahead__option[data-value="value2"]');
        expect(value2Option.exists()).toBe(true);
        expect(value2Option.prop('data-group')).toEqual('group2');

        const value3Option = wrapper.find('.typeahead__option[data-value="value3"]');
        expect(value3Option.exists()).toBe(true);
        expect(value3Option.prop('data-group')).toEqual('group1');

        const value4Option = wrapper.find('.typeahead__option[data-value="value4"]');
        expect(value4Option.exists()).toBe(true);
        expect(value4Option.prop('data-group')).toEqual('group2');

        const group1 = wrapper.find('.typeahead__group[data-value="group1"]');
        expect(group1.exists()).toBe(true);
        const group2 = wrapper.find('.typeahead__group[data-value="group2"]');
        expect(group2.exists()).toBe(true);
    });

    it('render options of a group when searching for a group label', () => {
        const wrapper = mount(<Typeahead fieldName="fieldName" options={optionsWithGroups} groups={groups}/>);
        wrapper.find('input').simulate('focus');
        simulateKeyPresses(wrapper.find('input'), 'Group 1');

        const value1Option = wrapper.find('.typeahead__option[data-value="value1"]');
        expect(value1Option.exists()).toBe(true);
        expect(value1Option.prop('data-group')).toEqual('group1');

        const value2Option = wrapper.find('.typeahead__option[data-value="value2"]');
        expect(value2Option.exists()).toBe(false);

        const value3Option = wrapper.find('.typeahead__option[data-value="value3"]');
        expect(value3Option.exists()).toBe(true);
        expect(value3Option.prop('data-group')).toEqual('group1');

        const value4Option = wrapper.find('.typeahead__option[data-value="value4"]');
        expect(value4Option.exists()).toBe(false);

        const group1 = wrapper.find('.typeahead__group[data-value="group1"]');
        expect(group1.exists()).toBe(true);
        const group2 = wrapper.find('.typeahead__group[data-value="group2"]');
        expect(group2.exists()).toBe(false);
    });

    it('render empty groups when renderEmptyGroups prop is true', () => {
        const wrapper = mount(<Typeahead fieldName="fieldName" options={optionsWithGroups} groups={groups}
            renderEmptyGroups={true}/>);
        wrapper.find('input').simulate('focus');
        simulateKeyPresses(wrapper.find('input'), 'does not exist');

        const group1 = wrapper.find('.typeahead__group[data-value="group1"]');
        expect(group1.exists()).toBe(true);
        const group2 = wrapper.find('.typeahead__group[data-value="group2"]');
        expect(group2.exists()).toBe(true);
    });

    it('not render empty groups when renderEmptyGroups prop is false', () => {
        const wrapper = mount(<Typeahead fieldName="fieldName" options={optionsWithGroups} groups={groups}
            renderEmptyGroups={false}/>);
        wrapper.find('input').simulate('focus');
        simulateKeyPresses(wrapper.find('input'), 'does not exist');

        const group1 = wrapper.find('.typeahead__group[data-value="group1"]');
        expect(group1.exists()).toBe(false);
        const group2 = wrapper.find('.typeahead__group[data-value="group2"]');
        expect(group2.exists()).toBe(false);
    });

    it('not render empty groups when renderEmptyGroups prop is missing', () => {
        const wrapper = mount(<Typeahead fieldName="fieldName" options={optionsWithGroups} groups={groups}/>);
        wrapper.find('input').simulate('focus');
        simulateKeyPresses(wrapper.find('input'), 'does not exist');

        const group1 = wrapper.find('.typeahead__group[data-value="group1"]');
        expect(group1.exists()).toBe(false);
        const group2 = wrapper.find('.typeahead__group[data-value="group2"]');
        expect(group2.exists()).toBe(false);
    });

    it('select correct option using mouse click when options are filtered', () => {
        const wrapper = mount(<Typeahead fieldName="fieldName" options={options}/>);
        wrapper.find('input').simulate('focus');
        simulateKeyPresses(wrapper.find('input'), 'bel2');
        const value1Option = wrapper.find('.typeahead__option[data-value="value2"]');
        value1Option.simulate('mouseDown');
        wrapper.find('input').simulate('blur');
        expect(wrapper.state('value')).toEqual('value2');
    });

    it('not crash when options are filtered and an outside click occurs', () => {
        const wrapper = mount(<Typeahead fieldName="fieldName" options={options}/>);
        wrapper.find('input').simulate('focus');
        simulateKeyPresses(wrapper.find('input'), 'bel2');
        wrapper.find('input').simulate('blur');
    });

    it('select correct option when value is set before options (due to race condition)', () => {
        const wrapper = mount(<Typeahead fieldName="fieldName" options={[]} value="myVal"/>);
        expect(wrapper.state('typedLabel')).toEqual(''); // label cannot be set, no options available
        wrapper.setProps({options: [{value: 'myVal', label: 'somethingElse'}]});
        expect(wrapper.state('typedLabel')).toEqual('somethingElse'); // label can now be set appropriately
    });

    function simulateKeyPresses(wrapper, text) {
        for (let i = 0; i < text.length; i++) {
            wrapper.simulate('keyPress', {
                which: text.charCodeAt(i),
                key: text[i],
                keyCode: text.charCodeAt(i)
            });
            wrapper.simulate('change', {
                target: {
                    value: text.substring(0, i + 1)
                }
            });
        }
    }
});
