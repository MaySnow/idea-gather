import IconSvg from "./iconSvg";
class Observer{
  constructor({ data, el, render, deep = 0, listClass = "" }) {
    this.el = el;
    this._walk(data);
    this.render = render;
    this.deep = deep;
    // list 列表的 class
    this.listClass = listClass;
    // 初始化，收集依赖
    this.render = render;
    this.compileObj = render(data);
    this.compile(this.compileObj, el);
  }
  updateCompileObj(cur, old) {
    // 在 old 中没有的删除
    if (old) {
      if (cur.tag === old.tag) {
        cur.tagEl = old.tagEl;
      } else if (old.tagEl) {
        old.tagEl.remove();
      }
      if (cur.children && old.children) {
        cur.children.forEach((item, index)  => {
          this.updateCompileObj(item, old.children[index])
        });
      }
      // 老的比新的长
      const curLen = (cur.children ? cur.children.length : 0);
      if (old.children && old.children.length > curLen) {
        old.children.splice(curLen).forEach(item => {
          if(item.tagEl) {
            item.tagEl.remove();
          }
        })
      }
    }
  }
  compile(compileObj, el) {
    let tagEl;
    const { tag, children, render } = compileObj;
    if (compileObj.tagEl) {
      tagEl = compileObj.tagEl;
    } else {
      if(tag) {
        tagEl = document.createElement(tag);
      } else {
        tagEl = document.createElement("div");
      }
      compileObj.tagEl = tagEl;
      el.appendChild(tagEl);
    }
    if (render) {
      render(tagEl);
    }
    if (children) {
      children.forEach(item => {
        this.compile(item, tagEl);
      });
    }
  } 
  _render(obj, key, val, isUpdate) {
    const { render, compileObj } = this;
    const compare = render(obj);
    // 新老比较
    this.updateCompileObj(compare, compileObj);
    this.compileObj = compare;
    this.compile(this.compileObj, this.el);
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
        return val;
      },
      set(newVal) {
        const old = val;
        const cur = newVal;
        val = newVal;
        // 有变更，更新
        if (old !== cur) {
          console.log("set 通知响应, 更新 dom key", key, "新", cur, "旧", old);
          _this._render(obj, key, newVal, true);
        }
      }
    });
  }
}
export default function(data) {
  document.onmouseover = function() {
    data.curIndex = null;
  }
  function renderIcon(el, icon) {
    if (!icon) {
      el.innerHTML = "";
      return;
    }
    el.className = "mxy-nav-icon-wrap";
    if (icon) {
      new IconSvg({
        url: icon,
        el,
        className: "nav-icon"
      });
    } else {
      el.innerHTML = "";
    }
  }
  new Observer({
    data,
    el: document.getElementById("app"),
    render(data) {
      let subTitle = "";
      let subIcon = "";
      let subList = data.list.filter((item, index) => {
        const isCur = index === data.curIndex;
        if (isCur) {
          subTitle = item.name;
          subIcon = item.icon;
        }
        return isCur;
      });
      subList = subList.length && subList[0].list ? subList[0].list : [];
      return {
        tag: "div",
        render(el) {
          el.className ="mxy-head-wrap";
        },
        children: [
          {
            render(el) {
              el.className = "mxy-head";
            },
            children: data.list.map((item, index) => {
              return {
                tag: "div",
                children: [
                  {
                    tag: "div",
                    render(el) {
                      el.onmouseover = e => {
                        // 阻止事件冒泡
                        e.stopPropagation();
                        data.curIndex = index;
                        data.curTop = parseInt(el.getBoundingClientRect().top);
                      }
                    },
                    children: [
                      {
                        tag: "p",
                        render(el) {
                          let classArr = ["mxy-head-menu"];
                          if (index === data.curIndex) {
                            classArr.push("menu-cur");
                          }
                          el.className = classArr.join(" ");
                        },
                        children: [
                          {
                            tag: "i",
                            render(el) {
                              if (item && item.icon) {
                                renderIcon(el, item.icon);
                              }
                            }
                          },
                          {
                            tag: "a",
                            render(el) {
                              el.innerHTML = item.name;
                              el.href = "#";
                            }
                          }
                        ]
                      },
                    ]
                  },
                  {
                    tag: "ul",
                    children: (item && item.list ? item.list : []).map(sub => {
                      return {
                        tag: "li",
                        render(el) {
                          const { id, ding } = sub;
                          let classArr = [];
                          if (!ding) {
                            classArr.push("mxy-menu-item-hide");
                          }
                          if (data.curId === id) {
                            classArr.push("mxy-menu-item-cur");
                          }
                          el.className = classArr.join(" ");
                          el.onclick = () => {
                            data.curId = id;
                          }
                        },
                        children: [
                          {
                            tag: "a",
                            render(el) {
                              el.innerHTML = sub.name;
                            }
                          }
                        ]
                      }
                    })
                  }
                ]
              }
            })
          },
          {
            tag: "div",
            render(el) {
              el.className = "mxy-sub-nav";
              el.style.top = `${data.curTop}px`;
              el.style.display = data.curIndex !== null && subList.length ? "block" : "none";
              el.onmouseover = e => {
                // 阻止事件冒泡
                e.stopPropagation();
              }
            },
            children: [
              {
                tag: "div",
                render(el) {
                  el.className = "mxy-sub-nav-inner"
                },
                children: [
                  {
                    tag: "span",
                    render(el) {
                      el.className = "mxy-sub-title"
                    },
                    children: [
                      {
                        tag: "i",
                        render(el) {
                          renderIcon(el, subIcon);
                        },
                      },
                      {
                        tag: "a",
                        render(el) {
                          el.innerHTML = subTitle;
                        }
                      }
                    ]
                  },
                  {
                    tag: "ul",
                    children: subList.map((item, index) => {
                      return {
                        tag: "li",
                        children: [
                          {
                            tag: "a",
                            render(el) {
                              const { id, name } = item;
                              el.innerHTML = name;
                              let classArr = [];
                              if (data.curId === id) {
                                classArr.push("mxy-nav-item-cur");
                              }
                              el.className = classArr.join(" ");
                            }
                          },
                          {
                            tag: "i",
                            render(el) {
                              el.innerHTML = item.ding ? 
                              `<svg class="svg-ding" width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <g clip-path="url(#clip0_16424:126727)">
                              <path d="M13.0406 6.88847L12.9461 6.93565L12.8715 7.01029L11.0591 8.82264L10.8989 8.98287L10.873 9.20799L10.5566 11.9587C10.4945 12.499 9.83585 12.7286 9.45128 12.3441L4.28215 7.17493C3.89212 6.7849 4.13458 6.11692 4.68399 6.06789L7.5151 5.81521L7.75011 5.79423L7.91694 5.6274L9.70277 3.84157L9.79267 3.75168L9.84207 3.63454L10.312 2.52025C10.4913 2.09506 11.0442 1.98692 11.3705 2.31322L14.3399 5.28259C14.6537 5.59635 14.5678 6.1253 14.1708 6.32365L13.0406 6.88847Z" stroke-width="1.3"/>
                              <rect x="5.84473" y="10.1876" width="0.75" height="4.28952" transform="rotate(45 5.84473 10.1876)" stroke-width="0.75"/>
                              </g>
                              <defs>
                              <clipPath id="clip0_16424:126727">
                              <rect width="16" height="16" fill="white" transform="translate(0.75)"/>
                              </clipPath>
                              </defs>
                              </svg>                              
                              `
                              :
                              `<svg class="svg-ding-none" width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <g clip-path="url(#clip0_16424:126726)">
                              <path d="M13.0406 6.88847L12.9461 6.93565L12.8715 7.01029L11.0591 8.82264L10.8989 8.98287L10.873 9.20799L10.5566 11.9587C10.4945 12.499 9.83585 12.7286 9.45128 12.3441L4.28215 7.17493C3.89212 6.7849 4.13458 6.11692 4.68399 6.06789L7.5151 5.81521L7.75011 5.79423L7.91694 5.6274L9.70277 3.84157L9.79267 3.75168L9.84207 3.63454L10.312 2.52025C10.4913 2.09506 11.0442 1.98692 11.3705 2.31322L14.3399 5.28259C14.6537 5.59635 14.5678 6.1253 14.1708 6.32365L13.0406 6.88847Z" stroke-width="1.3"/>
                              <rect x="5.84473" y="10.1876" width="0.75" height="4.28952" transform="rotate(45 5.84473 10.1876)" stroke-width="0.75"/>
                              </g>
                              <defs>
                              <clipPath id="clip0_16424:126726">
                              <rect width="16" height="16" fill="white" transform="translate(0.75)"/>
                              </clipPath>
                              </defs>
                              </svg>
                              `;
                              el.onclick = e => {
                                const { ding } = item;
                                data.list[data.curIndex].list[index].ding = ding ? 0 : 1;
                                data.list = [...data.list];
                              }
                            }
                          }
                        ]
                      }
                    })
                  }
                ]
              }
            ]
          }
        ]
      }
    }
  });
}