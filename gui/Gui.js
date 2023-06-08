import { create } from '../dom/Dom.js';


export class Folder {
  constructor(name = 'Folder') {
    this._widgets = [];
    this._domChildren = create('div', { class: 'jpgui_folder_children jpgui_hidden' });
    this.domElement = create('div', null,
      create('span', {
          class: 'jpgui_folder_header',
          onclick: () => this._domChildren.classList.toggle('jpgui_hidden'),
        }, name
      ),
      this._domChildren,
    );
    this.domElement.classList.add('jpgui', 'jpgui_folder');
  }


  add(widget, index = this._widgets.length) {
    const widgets = this._widgets;
    if (index >= widgets.length) {
      widgets.push(widget);
      this._domChildren.append(widget.domElement);
    }
    index = index < 0 ? 0 : index;
    this._widgets.splice(index, 0, widget);
    this._domChildren.insertBefore(widget.domElement, this._domChildren.childNodes[index]);
  }


  remove(widget) {
    const widgets = this._widgets;
    const index = widgets.indexOf(widget);
    if (index === -1) { return false; }
    this._widgets.splice(index, 1);
    this._domChildren.removeChild(widget.domElement);
  }


  open() {
    this._domChildren.classList.add('jpgui_hidden');
  }


  close() {
    this._domChildren.classList.add('jpgui_hidden');
  }
}


export class Gui extends Folder {
  constructor(name) {
    super(name);
    this.domElement.classList.add('jpgui_root');
  }
}


export class Control {
  constructor(label, ...chidren) {
    this.domElement = create('div', null,
      create('div', { class: 'jpgui_label' }, create('span', null, label)),
      create('div', { class: 'jpgui_inputs' }, ...chidren),
    );
    this.domElement.classList.add('jpgui_control');
  }


  bind(obj, key) {
    this.setValue(obj[key]);
    this.addListener(val => obj[key] = val);
    return this;
  }


  addListener() { throw new Error('Unimplemented method'); }
  getValue() { throw new Error('Unimplemented method'); }
  setValue() { throw new Error('Unimplemented method'); }
}


export class Num extends Control {
  constructor(label = 'number', min = null, max = null, step = null) {
    const input = create('input', {
      min, max, step,
      value: min ?? 0,
      type: 'number',
    })
    super(label, input);
    this._input = input;
  }


  addListener(f) {
    this._input.addEventListener('input', () => f(this.getValue()));
    return this;
  }


  getValue() {
    return parseFloat(this._input.value);
  }


  setValue(value) {
    this._input.value = value;
    this._input.dispatchEvent(new Event('input'));
  }
}


export class Range extends Control {
  constructor(label = 'range', min = 0, max = 1, step = 0.01) {
    const num = create('input', {
      min, max, step,
      value: min,
      type: 'number',
    });

    const slider = create('input', {
      min, max, step,
      value: min,
      type: 'range',
    });

    num.addEventListener('input', e => {
      const val = parseFloat(e.target.value);
      slider.value = val;
    });

    slider.addEventListener('input', e => {
      const val = parseFloat(e.target.value);
      num.value = val;
    });

    super(label, num, slider);
    this._number = num;
    this._range = slider;
  }

  
  addListener(f) {
    this._number.addEventListener('input', () => f(this.getValue()));
    this._range.addEventListener('input', () => f(this.getValue()));
    return this;
  }


  getValue() {
    return parseFloat(this._number.value);
  }


  setValue(value) {
    this._number.value = value;
    this._range.value = value;
    this._number.dispatchEvent(new Event('input'));
  }
}


export class Str extends Control {
  constructor(label = 'string') {
    const input = create('input');
    super(label, input);
    this._input = input;
  }


  addListener(f) {
    this._input.addEventListener('input', e => f(e.target.value));
    return this;
  }


  getValue() {
    return this._input.value;
  }


  setValue(value) {
    this._input.value = value;
    this._input.dispatchEvent(new Event('input'));
  }
}


export class Select extends Control {
  constructor(label = 'select', opts = []) {
    const sel = create('select', null, ...opts.map(o => create('option', null, o)));
    super(label, sel);
    this._opts = opts;
    this._input = sel;
  }


  addListener(f) {
    this._input.addEventListener('input', e => f(e.target.value));
    return this;
  }


  getValue() {
    return this._input.value;
  }


  setValue(opt) {
    if (this._opts.indexOf(opt) !== -1) {
      this._input.value = opt;
      this._input.dispatchEvent(new Event('input'));
    }
  }
}


export class Color extends Control {
  constructor(label = 'color') {
    const input = create('input', { type: 'color', });
    super(label, input);
    this._input = input;
  }


  addListener(f) {
    this._input.addEventListener('input', () => f(this.getValue()));
    return this;
  }


  getValue() {
    return parseInt(e.target.value.substring(1), 16);
  }


  setValue(hex) {
    this._input.value = `#${hex.toString(16).padStart(6, '0')}`;
    this._input.dispatchEvent(new Event('input'));
  }
}


export class ColorAlpha extends Control {
  constructor(label = 'color alpha') {
    const cInput = create('input', { type: 'color' });
    const aInput = create('input', { type: 'range', min: 0, max: 1, step: 0.001, value: 1 });
    super(label, cInput, aInput);
    this._color = cInput;
    this._alpha = aInput;
  }


  addListener(f) {
    const wrap = () => f(this.getValue());
    this._color.addEventListener('input', wrap);
    this._alpha.addEventListener('input', wrap);
    return this;
  }


  getValue() {
    return (parseInt(this._color.value.substring(1), 16) << 8) | (parseFloat(this._alpha.value) * 255);
  }


  setValue(hex) {
    this._color.value = `#${((hex & 0xffffff00) >>> 8).toString(16)}`;
    this._alpha.value = ((hex & 0xff) / 255).toString();
    this._color.dispatchEvent(new Event('input'));
  }
}


export class Bool extends Control {
  constructor(label = 'bool') {
    const input = create('input', {
      type: 'checkbox',
    });
    super(label, input);
    this._input = input;
  }


  addListener(f) {
    this._input.addEventListener('input', e => f(e.target.checked));
    return this;
  }


  getValue() {
    return this._input.checked;
  }


  setValue(value) {
    this._input.checked = value;
    this._input.dispatchEvent(new Event('input'));
  }
}


export class Btn {
  constructor(text, callback = null) {
    this.domElement = create('button', { class: 'jpgui_button' }, text);
    if (callback) {
      this.domElement.addEventListener('click', callback);
    }
  }


  addListener(f) {
    this.domElement.addEventListener('click', f);
    return this;
  }
}
