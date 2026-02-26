function include_HTML(callback) {
  const elements = document.querySelectorAll("[include-html]");
  let remaining = elements.length;
  if (remaining === 0) {
    if (callback) callback();
    return;
  }
  elements.forEach(el => {
    const file = el.getAttribute("include-html");
    fetch(file)
      .then(response => {
        if (!response.ok) {
          el.innerHTML = "Include failed: " + file;
        } else {
          return response.text().then(html => {
            el.innerHTML = html;
          });
        }
      })
      .catch(() => {
        el.innerHTML = "Include failed: " + file;
      })
      .finally(() => {
        el.removeAttribute("include-html");
        remaining--;
        if (remaining === 0 && callback) callback();
      });
  });
}

function load_scripts() {
  return new Promise(resolve => {
    let index = 0;
    const js = [
      'js/constants.js',
      'js/main/functions.js', 'js/main/listeners.js', 
      'js/manual/functions.js', 'js/manual/listeners.js'];
    function next() {
      if (index >= js.length) return resolve();
      const script = document.createElement("script");
      script.src = js[index];
      script.onload = () => {
        index++;
        next();
      };
      document.body.appendChild(script);
    }
    next();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  include_HTML(() => {
    load_scripts().then(() => {
      if (window.initializer) {
        window.initializer();
      }
    });
  });
});
