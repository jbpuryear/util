export function create(tagname, options, ...children) {
  const el = document.createElement(tagname);

  if (options) {
    for (const [key, value] of Object.entries(options)) {
      if (el[key] === undefined) {
        el.setAttribute(key, value);
      } else {
        el[key] = value;
      }
    }
  }
  
  for (const child of children) {
    if (typeof child === 'string') {
      el.append(new Text(child));
    } else {
      el.append(child);
    }
  }

  return el;
}
