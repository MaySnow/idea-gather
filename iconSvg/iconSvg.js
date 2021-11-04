let iconSvgCache = new Map();
class IconSvg {
  constructor(conf) {
    const { el, url, className } = conf;
    // 挂载的 dom
    this.el = el;
    // 图片地址
    this.url = url;
    // inline svg 的 class 名称
    this.className = className || "svg-class";
    this.init();
  }
  async init() {
    const { el, className } = this;
    if(!el) {
      return;
    }
    const svg = await this.getData();
    el.innerHTML = svg;
    const svgElement = el.firstElementChild;
    // use `viewBox` attribute to get the svg's inherent width and height
    const viewBox = svgElement.getAttribute('viewBox').split(' ').map(n => Number(n));
    const widthToHeight = (viewBox[2] / viewBox[3]).toFixed(2);
    // recursively remove all fill attribute of element and its nested children
    this.recursivelyRemoveFill(svgElement);
    // set width and height relative to font size
    // if growByHeight is true, height set to 1em else width set to 1em and remaining is calculated based on widthToHeight ratio
    svgElement.setAttribute('height', '1em');
    svgElement.setAttribute('width', `${widthToHeight}em`);
    svgElement.classList.add(className);
  }
  getData() {
    const { url } = this;
    return new Promise((resolve, reject) => {
      const cacheSvg = iconSvgCache.get(url);
      if (cacheSvg) {
        return resolve(cacheSvg);
      }
      this.loadSvg(url, svg => {
        if (typeof svg === "string" && svg.indexOf("<svg") !== -1) {
          iconSvgCache.set(url, svg);
          return resolve(svg);
        }
        reject();
      })
    });
  }
  /**
   * 清除 svg 标签内的 fill 样式
   * @param {*} el 
   * @returns 
   */
  recursivelyRemoveFill(el) {
    if (!el) {
        return;
    }
    el.removeAttribute('fill');
    [].forEach.call(el.children, child => {
        this.recursivelyRemoveFill(child);
    });
  }

  /**
   * 加载 svg
   * @param {*} url 
   * @param {*} callback 
   */
  loadSvg(url, callback) {
    const httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = function () {
      // readyState 4 = complete
      if (httpRequest.readyState === 4) {
        // TODO 根据 URL 缓存
        callback(httpRequest.responseText);
      }
    };
    httpRequest.open('GET', url);
    httpRequest.send();
  }
}
export default IconSvg;