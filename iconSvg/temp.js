
import { nanoid } from "nanoid";
class ArrResponse {
  constructor({ el, data, render }) {
    // 断开引用
    this.arr = JSON.parse(JSON.stringify(data));
    this.data = this.proxy();
    this.render = render;
    this.fragment = document.createDocumentFragment();
    this.el = el;
    this.init();
    this.Tagret = null;
    el.appendChild(this.fragment);
  }
  init() {
    let { data } = this;
    for(let i = 0; i < data.length; i++) {
      this.fragment.appendChild(this.compile(data[i], i));
    }
  }
  compile(item, index) {
    let cur = this.render(item, index);
    // 标记 cur
    const flag = `data-v-${nanoid(8)}`;
    cur.setAttribute(flag, "");
    item._$elFlag = flag;
    return cur
  }
  proxy() {
    return new Proxy(this.arr, {
      get: (target, property, receiver) => {
        console.log("getting", property, target, target[property]);
        return target[property];
      },
      set: (target, property, value, receiver) => {
        // 渲染
        console.log("setting", property, target, value);
        // 通知
        // TODO 删除
        this.notify(property, value);
        target[property] = value;
        return true;
      }
    });
  }
  notify(property, value) {
    if (typeof value !== 'object') {
      // dom 不存在
      return
    }
    let { _$elFlag } = value;
    const _proxyEl = document.querySelector(`[${_$elFlag}]`);
    if (_proxyEl) {
      const newEl = this.render(value, property);
      // dom 存在
      if (_proxyEl.outerHTML !== newEl.outerHTML) {
        // 如果内容改变，将当前位置的 dom 重新渲染
        newEl.setAttribute(_$elFlag, "");
        _proxyEl.parentElement.replaceChild(newEl, _proxyEl)
      }
    } else {
      // dom 不存在
      this.el.appendChild(this.compile(value), this.data.length -1);
    }
  }
}
/**
 * 二级菜单
 */
class renderSubMenu {
  constructor({ fixedMenuEl, allMenuEl, data }) {
    this.data = data;
    // 固定二级子菜单 dom
    this.fixedMenuEl = fixedMenuEl;
    // 所有二级菜单 dom
    this.allMenuEl = allMenuEl;
    // 固定二级子菜单
    this.fixedSub = null;
    // 所有二级菜单
    this.allSub = null;
    this.init();
  }
  init() {
    const { data, fixedMenuEl, allMenuEl } = this;
    // 固定菜单
    this.fixedSub = new ArrResponse({
      el: fixedMenuEl,
      data,
      render: (nav, index) => {
        const { name, ding } = nav;
        const el = document.createElement("li");
        const navNameEl = document.createElement("a");
        navNameEl.innerHTML = name;
        el.appendChild(navNameEl);
        el.style.display = ding ? "block" : "none";
        return el;
      }
    });
    // 所有菜单
    this.allSub = new ArrResponse({
      el: allMenuEl,
      data,
      render: (nav, index) => {
        const { name, ding } = nav;
        const el = document.createElement("li");
        const navNameEl = document.createElement("a");
        navNameEl.innerHTML = name;
        const dingEl = document.createElement("i");
        dingEl.innerHTML = ding ? "钉" : "不钉";
        dingEl.onclick = () => {
          this.dingClick(nav, index);
        }
        el.appendChild(navNameEl);
        el.appendChild(dingEl);
        return el;
      }
    });
  }
  dingClick(nav, index) {
    const { ding } = nav;
    const { fixedSub, allSub } = this;
  
    this.fixedSub.data[index] = {
      ...fixedSub.data[index],
      ding: !ding
    };
    this.allSub.data[index] = {
      ...allSub.data[index],
      ding: !ding
    };
  }
}
let data = [];
let res = new ArrResponse({
  el: document.getElementById("app"),
  data,
  render: item => {
    const { name, children } = item;
    const el = document.createElement("div");
    // 一级菜单
    const menuNameEl = document.createElement("a");
    menuNameEl.href = "#";
    menuNameEl.innerHTML = name;
    // 固定子菜单
    const fixedMenuEl = document.createElement("ul");
    // 所有子菜单
    const allMenuEl = document.createElement("ul");
    allMenuEl.className = "all-menu";
    // 添加一级菜单 dom
    el.appendChild(menuNameEl);
    // 添加二级固定菜单 dom
    el.appendChild(fixedMenuEl);
    // 添加二级所有菜单 dom
    el.appendChild(allMenuEl);
    if (children) {
      new renderSubMenu({
        fixedMenuEl,
        allMenuEl,
        data: children
      });
    }
    return el;
  }
});

// res.data = [
//   {
//     name: "我是1",
//     children: [{
//       name: "我是11",
//       ding: true
//     },{
//       name: "我是12",
//       ding: true
//     },{
//       name: "我是13",
//       ding: false
//     }]
//   },
//   {
//     name: "我是2",
//     children: [{
//       name: "我是21",
//       ding: false
//     },{
//       name: "我是22",
//       ding: false
//     },{
//       name: "我是23",
//       ding: false
//     }]
//   },
//   {
//     name: "我是3"
//   }
// ]

res.data.push({
  name: "我是1",
  children: [{
    name: "我是11",
    ding: true
  },{
    name: "我是12",
    ding: true
  },{
    name: "我是13",
    ding: false
  }]
})