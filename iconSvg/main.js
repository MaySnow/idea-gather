import "./style.less";
import IconSvg from "./iconSvg";
import reactiveMenu from "./reactiveMenu";
// icon svg 的例子
// new IconSvg({
//   url: `//img.mayxiaoyu.com/static/home.svg`,
//   el: document.getElementById("svgTest"),
//   className: "nav-icon"
// });
let data = {
  curIndex: null,
  curTop: 0,
  // 当前选中的目录
  curId: null,
  list: [
    {
      name: "Navigation One",
      id: 1,
      icon: "//q-independent.aixuexi.com/B:1029:K/1618329600/ec085b01e6c349d6bef2b4f1a588e28b.svg",
      list: [
        {
          name: "Option 1",
          id: 2,
          ding: 0,
        },
        {
          name: "Option 2",
          id: 3,
          ding: 1
        },
        {
          name: "Option 4",
          id: 4,
          ding: 1
        },
        {
          name: "Option 5",
          id: 5,
          ding: 1
        }
      ]
    },
    {
      name: "Navigation Two",
      id: 6,
      icon: "//q-independent.aixuexi.com/B:1029:K/1618156800/0a696e21cd214248aeeaaacd2fb69393.svg",
      list: [
        {
          name: "Option 1",
          id: 7,
          ding: 0
        },
        {
          name: "Option 2",
          id: 8,
          ding: 0
        },
        {
          name: "Option 3",
          id: 9,
          ding: 0
        }
      ]
    },
    {
      name: "Navigation Three",
      id: 10,
      icon: "//q-independent.aixuexi.com/B:1029:K/1618156800/0a696e21cd214248aeeaaacd2fb69393.svg",
      list: [
        {
          name: "Option 1",
          id: 11,
          ding: 1
        },
        {
          name: "Option 2",
          id: 12,
          ding: 0
        },
        {
          name: "Option 3",
          id: 13,
          ding: 0
        },
        {
          name: "Option 2",
          id: 21,
          ding: 1
        },
        {
          name: "Option 3",
          id: 22,
          ding: 1
        }
      ]
    },
    {
      name: "Navigation Four",
      id: 14,
      icon: "//q-independent.aixuexi.com/B:1029:K/1618156800/0a696e21cd214248aeeaaacd2fb69393.svg",
      list: null
    },
    {
      name: "Navigation Five",
      id: 15,
      icon: "//q-independent.aixuexi.com/B:1029:K/1618156800/0a696e21cd214248aeeaaacd2fb69393.svg",
      list: [
        {
          name: "Option 1",
          id: 16,
          ding: 1
        },
        {
          name: "Option 2",
          id: 17,
          ding: 1
        },
        {
          name: "Option 4",
          id: 18,
          ding: 1
        },
        {
          name: "Option 5",
          id: 19,
          ding: 1
        },
        {
          name: "Option 6",
          id: 20,
          ding: 1
        },
        {
          name: "Option 7",
          id: 21,
          ding: 1
        }
      ]
    }
  ]
}
reactiveMenu(data);