import { create } from '../dom/Dom.js';


export class Folder {
  constructor(name = 'Folder') {
    this._widgets = [];
    this._domChildren = create('div', { class: 'jpgui_folder_children' });
    this.domElement = create('div', null,
      create('span', {
          class: 'jpgui_folder_header',
          onclick: () => this._domChildren.style.display = this._domChildren.classList.toggle('jpgui_hidden'),
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
}


export class Num extends Control {
  constructor(obj, key, min = null, max = null, step = null, label = key) {
    let initVal = obj[key];
    if (typeof min === 'number' && initVal < min) {
      initVal = min;
    }
    if (typeof max === 'number' && initVal > max) {
      initVal = max;
    }
    if (obj[key] !== initVal) { obj[key] = initVal; }

    super(label,
      create('input', {
        min, max, step,
        value: initVal,
        type: 'number', oninput: e => obj[key] = parseFloat(e.target.value)
      })
    );
  }
}


export class Range extends Control {
  constructor(obj, key, min = 0, max = 1, step = 0.01, label = key) {
    const initVal = Math.max(min, Math.min(max, obj[key]));
    if (obj[key] !== initVal) { obj[key] = initVal; }

    const num = create('input', {
      min, max, step,
      value: initVal,
      type: 'number',
    });

    const slider = create('input', {
      min, max, step,
      value: initVal,
      type: 'range',
    });

    num.addEventListener('input', e => {
      const val = parseFloat(e.target.value);
      obj[key] = val;
      slider.value = val;
    });

    slider.addEventListener('input', e => {
      const val = parseFloat(e.target.value);
      obj[key] = val;
      num.value = val;
    });

    super(label, num, slider);
  }
}


export class Str extends Control {
  constructor(obj, key, label = key) {
    super(label,
      create('input', {
        value: obj[key],
        oninput: e => obj[key] = e.target.value
      })
    );
  }
}


export class Select extends Control {
  constructor(obj, key, opts, label = key) {
    const optEls = opts.map(o => create('option', null, o));
    super(label,
      create('select', {
        value: obj[key],
        oninput: e => obj[key] = e.target.value
      }, ...optEls)
    );
  }
}


export class Color extends Control {
  constructor(obj, key, label = key) {
    super(label,
      create('input', {
        type: 'color',
        value: `#${obj[key].toString(16)}`,
        oninput: e => obj[key] = parseInt(e.target.value.substring(1), 16)
      })
    );
  }
}


export class ColorAlpha extends Control {
  constructor(obj, key, label = key) {
    let value = obj[key];
    let c = (value & 0xffffff00) >>> 8;
    let a = value & 0xff;
    const cInput = create('input', { type: 'color', value: `#${c.toString(16)}` })
    const aInput = create('input', { type: 'range', min: 0, max: 1, step: 0.001, value: `${a/255}` })
    const onInput = () => obj[key] = (parseInt(cInput.value.substring(1), 16) << 8) | (parseFloat(aInput.value) * 255);
    cInput.addEventListener('input', onInput);
    aInput.addEventListener('input', onInput);
    super(label, cInput, aInput);
  }
}


export class Bool extends Control {
  constructor(obj, key, label = key) {
    super(label,
      create('input', {
        type: 'checkbox',
        value: !!obj[key],
        oninput: e => obj[key] = e.target.value,
      })
    );
  }
}


export class Btn {
  constructor(text, callback) {
    this.domElement = create('button', { class: 'jpgui_button', onclick: callback }, text);
  }
}
