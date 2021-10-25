import "./style.less";
import IconSvg from "./iconSvg";
// icon svg 的例子
new IconSvg({
  url: `//img.mayxiaoyu.com/static/home.svg`,
  el: document.getElementById("svgTest"),
  className: "nav-icon"
});

let data = {
  list: [
    {
      name: "我是一级菜单1",
      id: 1,
      list: [
        {
          name: "我是二级菜单1-1",
          id: 3,
          ding: 0,
        },
        {
          name: "我是二级菜单1-2",
          id: 32,
          ding: 1
        }
      ]
    },
    {
      name: "我是一级菜单2",
      id: 2,
      list: [
        {
          name: "我是二级菜单2-1",
          id: 4,
          ding: 1
        }
      ]
    }
  ]
}
class Observer{
  constructor({ data, el, getListEl, render, deep = 0, listClass = "" }) {
    this.doms = new Map();
    this.el = el;
    this.getListEl = getListEl;
    this._walk(data);
    this.render = render;
    this.deep = deep;
    // list 列表的 class
    this.listClass = listClass;
    // 初始化，收集依赖
    Object.keys(data).forEach(key => data[key]);
  }
  _render(obj, key, val, isUpdate) {
    const { render, el, deep, listClass, getListEl } = this;
    if (Array.isArray(val)) {
      // 如果是数组
      let listWrap = this.doms.get(key);
      if (!listWrap) {
        listWrap = getListEl ? getListEl(this) : document.createElement("div");
        this.el.appendChild(listWrap);
        const listDeep = deep + 1;
        val.forEach((item, index) => {
          new Observer({
            data: item,
            listClass,
            deep: listDeep,
            getListEl,
            el: listWrap,
            render
          });
        });
      }
      return listWrap;
    }
    return render(obj, key, val, this, isUpdate);
  }
  _walk(obj) {
    Object.keys(obj).forEach(key => {
      this[key] = obj[key];
      this.proxyData(obj, key);
      this.defineReactive(obj, key, obj[key]);
    });
  }
  /**
   * 绑定到 this 上
   */
  proxyData(obj, key) {
    const _this = this;
    Object.defineProperty(obj, key, {
      get() {
        return _this[key];
      },
      set(newVal) {
        _this[key] = newVal;
      }
    });
  }
  /**
   * 监听响应
   * @param {*} obj 
   * @param {*} key 
   * @param {*} val 
   */
  defineReactive(obj, key, val) {
    let _this = this;
    Object.defineProperty(obj, key, {
      get() {
        // console.log("get 依赖收集, 渲染 dom", key, val, Array.isArray(val));
        // todo 数组如何处理
        const renderDom = _this._render(obj, key, val);
        if (renderDom) {
          _this.doms.set(key, renderDom);
        }
        // dom 片段
        return val;
      },
      set(newVal) {
        console.log("set 通知响应, 更新 dom key", key, "新", newVal, "旧", val);
        if (JSON.stringify(newVal) !== JSON.stringify(val)) {
          // 有变更
          _this._render(obj, key, newVal, true);
        }
        val = newVal;
      }
    });
  }
}
const menuEl = document.getElementById("app");
const subEl = document.getElementById("subApp");
document.onmouseover = function() {
  subEl.innerHTML = "";
}
subEl.onmouseover = e => {
  // 阻止事件冒泡
  e.stopPropagation();
}
function rendSub(obj, nameEl) {
  subEl.innerHTML = "";
  const { top } = nameEl.getBoundingClientRect();
  subEl.style.top = `${top}px`;
  const ulWrap = document.createElement("ul");
  obj.list.forEach(item => {
    const li = document.createElement("li");
    li.innerHTML = item.name + (item.ding ? "钉" : "不钉");
    li.onclick = e => {
      item.ding = item.ding ? 0 : 1;
      li.innerHTML = item.name + (item.ding ? "钉" : "不钉");
    }
    ulWrap.appendChild(li);
  });
  subEl.appendChild(ulWrap);
}
const obs = new Observer({
  data,
  el: menuEl,
  getListEl(obs) {
    const { deep, name } = obs;
    if (deep === 1) {
      return document.createElement("ul");
    }
    return document.createElement("div");
  },
  listClass: "axx-arch-head",
  render(obj, key, val, obs, isUpdate) {
    // 节点渲染
    let nameEl = obs.doms.get("name");
    if (!nameEl) {
      // 一级菜单
      if (obs.deep === 1) {
        nameEl = document.createElement("div");
        nameEl.onmouseover = e => {
          // 阻止事件冒泡
          e.stopPropagation();
          // 鼠标移入事件
          // subMenu(obj, nameEl);
          rendSub(obj, nameEl);
        }
      }
      // 二级菜单
      if (obs.deep === 2) {
        nameEl = document.createElement("li");
        nameEl.onclick = e => {
          obj.name = "点击"
        }
      }
      obs.el.appendChild(nameEl);
    }
    if (key === "name") {
      nameEl.innerHTML = val;
    }
    if (key === "ding") {
      // ding 字段改变时，name 的 class 做相应的修改
      nameEl.style.display = val ? "block" : "none";
    }
    if (key === "name") {
      return nameEl;
    }
  }
});