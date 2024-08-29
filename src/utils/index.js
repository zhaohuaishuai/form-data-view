import sanitizeHtml from 'sanitize-html';
import '../css/a11-dark.scss';
import lighthouseSvg from '../assets/灯塔.svg';

/**
 *
 * @param {*} oldVnode
 * @param {*} newVnode
 * @return {
 *    add: [],
 *    remove: [],
 *    update: []
 * }
 *
 */

export function diff(oldVnode, newVnode) {
  const add = [];
  const remove = [];
  const update = [];

  if (oldVnode === null) {
    return { add: [], remove: [], update: [] };
  }

  function vNodeDiff(oldVnode, newVnode, parentPath = []) {
    function subDiff(oldKey, newKey) {
      if (oldKey === newKey) {
        vNodeDiff(oldVnode[oldKey], newVnode[newKey], [...parentPath, newKey]);
      } else {
        add.push({
          path: [...parentPath, newKey],
          payload: newVnode[newKey],
        });
        remove.push({
          path: [...parentPath, oldKey],
          payload: oldVnode[oldKey],
        });
      }
    }

    if (isPrimitive(newVnode)) {
      if (oldVnode !== newVnode) {
        update.push({
          payload: [oldVnode, newVnode],
          path: parentPath,
        });
      }
      return oldVnode === newVnode;
    }

    if (Array.isArray(newVnode) && Array.isArray(oldVnode)) {
      if (newVnode.length === oldVnode.length) {
        for (let i = 0; i < newVnode.length; i++) {
          vNodeDiff(oldVnode[i], newVnode[i], [...parentPath, i]);
        }
      }
      if (newVnode.length > oldVnode.length) {
        for (let i = 0; i < newVnode.length; i++) {
          if (i + 1 > oldVnode.length) {
            add.push({
              path: [...parentPath, i],
              payload: newVnode[i],
            });
            continue;
          }
          vNodeDiff(oldVnode[i], newVnode[i], [...parentPath, i]);
        }
      }

      if (newVnode.length < oldVnode.length) {
        for (let i = 0; i < oldVnode.length; i++) {
          if (i + 1 > newVnode.length) {
            remove.push({
              path: [...parentPath, i],
              payload: oldVnode[i],
            });
            continue;
          }
          vNodeDiff(oldVnode[i], newVnode[i], [...parentPath, i]);
        }
      }
      return;
    }
    const newKeys = Object.keys(newVnode);

    const oldKeys = Object.keys(isPrimitive(oldVnode) ? {} : oldVnode);

    const owendByAll = newKeys.filter((key) => oldKeys.includes(key));
    const addByAll = newKeys.filter((key) => !oldKeys.includes(key));
    const remoteByAll = oldKeys.filter((key) => !newKeys.includes(key));

    owendByAll.forEach((key) => {
      subDiff(key, key);
    });
    addByAll.forEach((key) => {
      add.push({
        path: [...parentPath, key],
        payload: newVnode[key],
      });
    });
    remoteByAll.forEach((key) => {
      remove.push({
        path: [...parentPath, key],
        payload: oldVnode[key],
      });
    });
  }
  vNodeDiff(oldVnode, newVnode);
  return { add, remove, update };
}

export function cloneNodePath(vnode) {
  if (vnode == null) {
    return null;
  }

  const cloneVnode = JSON.parse(JSON.stringify(vnode));

  function clone(cloneVnode, parentPath = [], parentCloneVnode = null) {
    if (isPrimitive(cloneVnode)) {
      if (parentPath.length > 0 && parentCloneVnode) {
        parentCloneVnode[parentPath.at(-1)] = parentPath.join('.');
        return;
      }
    }

    if (Array.isArray(cloneVnode)) {
      if (cloneVnode.length === 0) {
        if (parentPath.length > 0 && parentCloneVnode) {
          parentCloneVnode[parentPath.at(-1)] = parentPath.join('.');
          return;
        }
      }
      for (let i = 0; i < cloneVnode.length; i++) {
        clone(cloneVnode[i], [...parentPath, i], cloneVnode);
      }
      return;
    }
    const keys = Object.keys(cloneVnode);
    if (keys.length === 0) {
      if (parentPath.length > 0 && parentCloneVnode) {
        parentCloneVnode[parentPath.at(-1)] = parentPath.join('.');
        return;
      }
    }

    keys.forEach((key) => {
      clone(cloneVnode[key], [...parentPath, key], cloneVnode);
    });
    return;
  }
  clone(cloneVnode);

  return cloneVnode;
}

export function isPrimitive(value) {
  return (
    typeof value === 'number' ||
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    typeof value === 'undefined' ||
    typeof value === 'function' ||
    typeof value === 'symbol' ||
    value === null
  );
}

export function valueToJsonStrign(value, isNode = false) {
  // 清洗富文本
  value =
    typeof value === 'string'
      ? sanitizeHtml(value, {
          allowedTags: [], // 不允许任何标签
        })
      : value;

  // if (typeof value === 'string' && value.length >= 200) {
  //   value = value.substring(0, 20) + '...';
  // }
  if (value === null) {
    if (isNode) {
      return '<span class="hljs-literal">null</span>';
    }
    return 'null';
  }
  if (typeof value === 'undefined') {
    if (isNode) {
      return '<span class="hljs-literal">undefined</span>';
    }
    return 'undefined';
  }

  if (typeof value === 'string') {
    if (isNode) {
      return '<span class="hljs-string">"' + value + '"</span>';
    }
    return '"' + value + '"';
  }

  if (
    typeof value === 'function' ||
    typeof value === 'symbol' ||
    typeof value === 'boolean'
  ) {
    if (isNode) {
      return '<span class="hljs-literal">' + value.toString() + '</span>';
    }
    return value.toString();
  }

  if (typeof value === 'number') {
    if (isNode) {
      return '<span class="hljs-literal">' + value + '</span>';
    }
    return value;
  }

  if (isNode) {
    return '<span class="hljs-string">"' + value + '"</span>';
  }

  return value;
}

export function valueToClassName(value) {
  if (value === null) {
    return 'hljs-literal';
  }
  if (typeof value === 'undefined') {
    return 'hljs-literal';
  }

  if (typeof value === 'string') {
    return 'hljs-string';
  }

  if (
    typeof value === 'function' ||
    typeof value === 'symbol' ||
    typeof value === 'boolean'
  ) {
    return 'hljs-literal';
  }

  if (typeof value === 'number') {
    return 'hljs-literal';
  }

  return 'hljs-string';
}

export const isUpdata = (customParentPath, diffData) => {
  return diffData.update.some((item) => {
    return customParentPath.join('.') === item.path.join('.');
  });
};

export const isAdd = (customParentPath, diffData) => {
  return diffData.add.some((item) => {
    return customParentPath.join('.') === item.path.join('.');
  });
};

export const statusClassName = (customParentPath, diffData) => {
  if (isUpdata(customParentPath, diffData)) {
    return 'update_status';
  }

  if (isAdd(customParentPath, diffData)) {
    return 'add_status';
  }

  return '';
};

export const throttle = (callback, duration) => {
  let timerId = null;

  return (thisArg, ...arg) => {
    if (timerId != null) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      if (typeof callback == 'function') {
        callback.call(thisArg, ...arg);
      }
      clearTimeout(timerId);
      timerId = null;
    }, duration);
  };
};

export function copyText(str) {
  // 1.创建一个input元素
  let input = document.createElement('textarea');
  // 2.将传入的值赋值给textarea
  input.value = str;
  // 3.设置文本域的相关属性,避免在body中添加该元素对页面造成影响
  input.style.width = '0';
  input.style.height = '0';
  input.style.position = 'fixed';
  input.style.opacity = '0';
  // 4.将当前文本域插入到body
  document.body.appenChild(input);
  // 5.选中文本域中的内容
  input.select();
  // 6.通过调用execCommnd()方法赋值内容
  document.execCommnd('copy');
  // 7.最后移除该元素
  document.body.removeChild(input);
}

const addStatusHtml =
  '<span class="hljs-string flag_status_tag add" >add</span>';
const updateStatusHtml =
  '<span class="hljs-string flag_status_tag update" >update</span>';

function _jsonTostringify({
  value,
  container,
  diffData,
  extendsNodePath = [],
}) {
  const { add, remove, update } = diffData;
  const addClassStatus = 'add_status';
  const updateClassName = 'update_status';
  function stringify(value, tierNum = 0, parentPath = []) {
    const t = Array.from({ length: tierNum })
      .map(() => ' ')
      .join('');

    if (isPrimitive(value)) {
      const isAdd = add
        .map((item) => item.path.join('.'))
        .includes([...parentPath].join('.'));
      const isUpdate = update
        .map((item) => item.path.join('.'))
        .includes([...parentPath].join('.'));
      const diffFlgString = () => {
        return `${isAdd ? addStatusHtml : isUpdate ? updateStatusHtml : ''}`;
      };
      const diffFlgClassNameString = () => {
        return `${isAdd ? addClassStatus : isUpdate ? updateClassName : ''}`;
      };
      if (typeof value === 'string' && value.split('\n').length > 1) {
        return value
          .split('\n')
          .map((item, index) => {
            if (index > 0) {
              return '\n' + t + item;
            }
            return item;
          })
          .join('');
      }

      return valueToJsonStrign(value, true) + diffFlgString();
    }
    const isArray = Array.isArray(value);
    let txt = '';
    const keys = Object.keys(value);

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const data = value[key];
      const itemIsAraay = Array.isArray(data);
      const pathArr = [...parentPath, key];
      const currentPath = pathArr.join('.');
      const isAdd = add
        .map((item) => item.path.join('.'))
        .includes(currentPath);
      const isUpdate = update
        .map((item) => item.path.join('.'))
        .includes(currentPath);
      const diffFlgString = () => {
        return `${isAdd ? addStatusHtml : isUpdate ? updateStatusHtml : ''}`;
      };
      const isClodeNode = extendsNodePath.includes(currentPath);

      if (isClodeNode) {
        txt +=
          `<div style="display:inline;"  data-path="${pathArr.join(
            '.'
          )}" data-node>` +
          `${t}` +
          `${stringify(key)}:` +
          `${itemIsAraay ? `[...]` : `{...}`}` +
          `${i + 1 === keys.length ? '' : ',\n'}</div>`;
        continue;
      }

      if (isPrimitive(data)) {
        txt +=
          `<div style="display:inline;" class="${statusClassName(
            pathArr,
            diffData
          )}" data-path="${pathArr.join('.')}">${t}${
            !isArray ? `${stringify(key)}:` : ''
          }` +
          `${stringify(data, tierNum + 2, pathArr)}` +
          `${i + 1 === keys.length ? '' : ',\n'}</div>`;
        continue;
      }
      const keysLen = Object.keys(data).length;
      if (keysLen === 0) {
        txt +=
          `<div style="display:inline;" class="${statusClassName(
            pathArr,
            diffData
          )}" data-path="${pathArr.join('.')}">${t}${stringify(key) + ':'}${
            itemIsAraay ? '[]' : '{}'
          }` +
          `${diffFlgString()}` +
          `${i + 1 === keys.length ? '' : ',\n'}</div>`;
        continue;
      }
      if (isArray) {
        txt +=
          `${
            diffFlgString()
              ? Array.from({ length: tierNum - 2 })
                  .map(() => ' ')
                  .join('')
              : t
          }${diffFlgString()}<div style="display:inline;" class="${statusClassName(
            pathArr,
            diffData
          )}"  data-path="${pathArr.join('.')}" data-node >${
            itemIsAraay ? '[\n' : '{\n'
          }` +
          `${stringify(data, tierNum + 2, pathArr)}` +
          `${
            itemIsAraay
              ? i + 1 === keys.length
                ? '\n' + t + ']'
                : '\n' + t + '],\n'
              : i + 1 === keys.length
              ? '\n' + t + '}'
              : '\n' + t + '},\n'
          }</div>`;
        continue;
      }

      txt +=
        `${
          diffFlgString()
            ? Array.from({ length: tierNum - 2 })
                .map(() => ' ')
                .join('')
            : t
        }${diffFlgString()}${stringify(key) + ':'}` +
        `<div style="display:inline;" class="${statusClassName(
          pathArr,
          diffData
        )}" data-path="${pathArr.join('.')}" data-node >` +
        `${itemIsAraay ? '[\n' : '{\n'}` +
        `${stringify(data, tierNum + 2, pathArr)}` +
        `${
          itemIsAraay
            ? i + 1 === keys.length
              ? '\n' + t + ']'
              : '\n' + t + '],\n'
            : i + 1 === keys.length
            ? '\n' + t + '}'
            : '\n' + t + '},\n'
        }</div>`;
    }
    return txt;
  }
  const html =
    `${Array.isArray(value) ? '[\n' : '{\n'}` +
    stringify(value, 2) +
    `${Array.isArray(value) ? '\n]' : '\n}'}`;
  if (container) {
    container.innerHTML = html;
  }
  const lineArr = html.split('\n');
  return {
    lineNum: lineArr.length,
    lineArr: lineArr,
    payload: { html },
  };
}

export const jsonTostringify = _jsonTostringify;

export async function copyObjectToClipboard(obj) {
  var str;
  if (typeof obj === 'string') {
    str = obj;
  } else {
    str = JSON.stringify(obj, null, 4);
  }

  try {
    await navigator.clipboard.writeText(str);
    console.log('复制到剪贴板成功');
    return Promise.resolve();
  } catch (err) {
    console.error('不能复制到剪贴板', err);
    return Promise.reject();
  }
}

export function getObject(obj, path) {
  if (obj === null || path === null) {
    return null;
  }
  if (typeof path === 'string') {
    path = path.split('.');
  }
  if (path.length === 0) {
    return obj;
  }
  if (path.length === 1) {
    if (path[0] === '') {
      return obj;
    }
    return obj[path];
  }
  for (let i = 0; i < path.length; i++) {
    const p = path[i];
    const dpPath = path.slice(i + 1, path.length);
    return getObject(obj[p], dpPath);
  }
}

function isInBody(node) {
  while (node) {
    if (node === document.body) {
      return true; // Found `body`, therefore `node` is in the body.
    }
    node = node.parentNode;
  }
  return false; // Didn't find `body`, therefore `node` is not in the body.
}

export class DataFormObserve {
  _jsonTostringify = _jsonTostringify;
  _container = null;
  nodeStrinSplice = [];
  diffData = [];
  oldData = null;
  lineNum = 0;
  extendsNodePath = [];
  throttleUpdate = null;
  constructor({ container, onUpdate, plugins } = {}) {
    this._container = container || null;
    this.onUpdate = onUpdate || null;
    this.plugins = plugins || [];
    this.eventInit();
    this.throttleUpdate = throttle(this.aupdate, 500);
  }
  set container(container) {
    this._container = container;
    this.eventInit();
  }
  get container() {
    return this._container;
  }

  update = (newData, isUploadOldData = true, { eventType } = {}) => {
    this.throttleUpdate(this, newData, isUploadOldData, { eventType });
    // this.aupdate(newData, isUploadOldData, { eventType });
  };

  aupdate = (newData, isUploadOldData = true, { eventType } = {}) => {
    eventType = eventType || 'updateType';
    if (isUploadOldData) {
      this.diffData = diff(this.oldData, newData);
    }

    for (let i = 0; i < this.plugins.length; i++) {
      const plugin = this.plugins[i];
      if (plugin.beforeUpdate) {
        plugin.beforeUpdate(this.container, {
          lineNum: this.lineNum,
          diffData: this.diffData,
          nodeStrinSplice: this.nodeStrinSplice,
          event: {
            eventType: eventType,
          },
        });
      }
    }

    const { lineNum, lineArr, payload } = this._jsonTostringify({
      value: newData,
      container: this.container,
      diffData: this.diffData,
      extendsNodePath: this.extendsNodePath,
    });
    if (isUploadOldData) {
      this.oldData = newData;
    }
    const reg = /(?<=data-path=").*?(?=")/g;
    this.nodeStrinSplice = lineArr.map((item, index) => {
      const match = item.match(reg);
      return {
        line: index + 1,
        isNode: item.includes('data-node'),
        path: match ? match[0] : '',
        isExpansion: !this.extendsNodePath.includes(match ? match[0] : ''),
      };
    });
    this.lineNum = lineNum;

    const pushData = {
      lineNum,
      nodeStrinSplice: this.nodeStrinSplice,
      diffData: this.diffData,
      handleExtendsNode: this.handleExtendsNode.bind(this),
      copyText: this.copyText.bind(this),
      event: {
        eventType: eventType,
        payload,
      },
    };

    this.plugins.forEach((plugin) => {
      if (plugin.update) {
        plugin.update(this.container, pushData);
      }
    });

    this.onUpdate && this.onUpdate(pushData);
  };
  handleExtendsNode(item) {
    if (this.extendsNodePath.includes(item.path)) {
      this.extendsNodePath = this.extendsNodePath.filter(
        (path) => path != item.path
      );
    } else {
      this.extendsNodePath.push(item.path);
    }
    this.aupdate(this.oldData, false, {
      eventType: 'extendEvent',
    });
  }

  eventInit() {}

  copyText(item) {
    return copyObjectToClipboard(getObject(this.oldData, item.path));
  }

  destory() {
    this.plugins.forEach((plugin) => {
      if (plugin.destory) {
        plugin.destory();
        plugin = null;
      }
    });
    this.diffData = [];
    this.oldData = null;
    this.plugins = [];
  }
}

export class PluginsObserve {
  isDestory = false;
  getDoms(list) {
    const queryStrig = [];
    if (list.length > 0) {
      list.forEach((item) => {
        queryStrig.push({
          path: item.path.join('.'),
          dom: document.querySelector(
            '[data-path="' + item.path.join('.') + '"]'
          ),
        });
      });
    }
    const offsetTops = [];
    if (queryStrig.length > 0) {
      for (let i = 0; i < queryStrig.length; i++) {
        offsetTops.push({
          dom: queryStrig[i].dom,
          top: queryStrig[i].dom.offsetTop,
        });
      }
      offsetTops.sort((a, b) => {
        return a.top - b.top;
      });
    }
    return offsetTops;
  }
  async domAnimToast(text, { event } = { event: null }) {
    if (event) {
      const { clientX, clientY } = event;
      const toastDom = document.createElement('div');
      toastDom.classList.add('toast');
      toastDom.innerText = text;
      document.body.appendChild(toastDom);
      console.log(toastDom.offsetWidth);

      const width = toastDom.offsetWidth;
      const height = toastDom.offsetHeight;

      toastDom.style = `
       position:fixed;
       left:${clientX - width / 2}px;
       top:${clientY - height - 10}px;
       z-index:999999;
       background-color:#f5ab35;
       color:#fff;
       border-radius: 3px;
      `;

      toastDom.addEventListener('animationend', () => {
        toastDom.remove();
      });
    }
  }
}

export class ScrollUpdateObserve extends PluginsObserve {
  async update(container, pushData) {
    const { diffData, event } = pushData;
    if (event.eventType === 'updateType') {
      const { update, add } = diffData;
      const offsetTops = this.getDoms([...update, ...add]);
      if (offsetTops.length > 100) {
        await this.scrollToTargetDom(offsetTops.at(-1));
      } else {
        for (let i = 0; i < offsetTops.length; i++) {
          await this.scrollToTargetDom(offsetTops[i]);
        }
      }
    }
  }

  async scrollToTargetDom({ dom, top }) {
    return new Promise((resolve, reject) => {
      dom.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'start',
      });
      dom.classList.toggle('flash_anim');
      setTimeout(() => {
        dom.classList.toggle('flash_anim');
        resolve();
      }, 500);
    });
  }
}

export class DeleteLogObserve {
  constructor(logContainer, { id, emptyIsHidden } = {}) {
    this.logContainer = logContainer || null;
    this.logContainer = id ? document.getElementById(id) : null;
    this.id = id || null;
    this.emptyIsHidden = emptyIsHidden || true;
    if (this.id == null && this.logContainer == null) {
      this.id = 'form-data-del-log';
      this.logContainer = document.createElement('div');
      this.logContainer.id = this.id;
    }
  }
  async beforeUpdate(container, pushData) {}

  async update(container, pushData) {
    const { remove } = pushData.diffData;
    let logContainer = null;
    if (this.logContainer || document.getElementById(this.id)) {
      logContainer = this.logContainer || document.getElementById(this.id);
    }
    if (remove.length === 0) {
      logContainer.innerHTML = '';
      if (this.emptyIsHidden) {
        logContainer.hidden = true;
      }
      return;
    }

    let html = `<ul><li class="del-log-title hljs-addition">删除数据${remove.length}条</li>`;
    for (let i = 0; i < remove.length; i++) {
      const { path, payload } = remove[i];
      html += `<li class="del-log-item hljs-link">${path.join('.')}</li>`;
    }
    html += '</ul>';
    if (logContainer) {
      if (!isInBody(logContainer)) {
        container.append(logContainer);
      }
      logContainer.hidden = false;
      logContainer.innerHTML = html;
    }
  }

  destory() {}
}

export class DrawerModel extends PluginsObserve {
  plugins = [];
  dataFormObserve = null;
  CONTAINER_ID = 'data-form-drawer';
  BUTTON_ID = 'data-form-drawer-btn';
  dom = {
    drawerContainer: null,
    btn: null,
  };
  scrrenWidth = document.documentElement.clientWidth;
  scrrenHeight = document.documentElement.clientHeight;
  containerWidth = 300;
  containerHeight = 420;
  titleHeight = 30;
  footerHeight = 30;
  x = document.documentElement.clientWidth - this.containerWidth - 30;
  y = 30;
  constructor({ plugins, dataFormObserve }) {
    super();
    this.plugins = plugins || [];
    this.dataFormObserve = dataFormObserve || null;
    this.init();
  }
  initStyle() {
    const sizestring = localStorage.getItem(this.LOCAL_POSITION_BOX_SIZE);
    const size = sizestring
      ? JSON.parse(sizestring)
      : { w: this.containerWidth, h: this.containerHeight };

    const positionstr = localStorage.getItem(this.LOCAL_POSITION_POSITION);
    const position = positionstr ? JSON.parse(positionstr) : { x: 0, y: 0 };

    this.dom.drawerContainer.style = `
      width:${size.w}px;
      height:${size.h}px;
    `;
    this.dom.drawerContainer.style.setProperty('--x', `${position.x}px`);
    this.dom.drawerContainer.style.setProperty('--y', `${position.y}px`);
    this.resetOpenStatusWindowStyle();
  }
  init() {
    this.dom.drawerContainer = document.querySelector('#' + this.CONTAINER_ID);
    if (!this.dom.drawerContainer) {
      this.dom.drawerContainer = document.createElement('div');
      this.dom.drawerContainer.id = this.CONTAINER_ID;
      document.body.appendChild(this.dom.drawerContainer);

      this.dom.drawerContainer.innerHTML = `
        <div class="form-data-drawer-wrap">
          <div class="form-data-drawer-header">
            <div class="form-data-drawer-title">观察器</div>
            <div class="form-data-drawer-header-btns">
              <div class="form-data-drawer-open-btn">
              <svg t="1717636660342" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5405" width="16" height="16"><path d="M768 170.666667H256c-46.933333 0-85.333333 38.4-85.333333 85.333333v512c0 46.933333 38.4 85.333333 85.333333 85.333333h512c46.933333 0 85.333333-38.4 85.333333-85.333333V256c0-46.933333-38.4-85.333333-85.333333-85.333333zM256 768V256h512v512H256z" fill="#e6e6e6" p-id="5406"></path></svg>
              </div>
              <div class="form-data-drawer-close-btn">
              <svg t="1717636504689" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4254" width="16" height="16"><path d="M801.895 542.105h-579.79C205.479 542.105 192 528.627 192 512c0-16.627 13.479-30.105 30.105-30.105h579.789C818.521 481.895 832 495.373 832 512c0 16.627-13.479 30.105-30.105 30.105z" p-id="4255" fill="#e6e6e6"></path></svg>
              </div>
            </div>
          </div>
          <div class="form-data-drawer-body">
            <div class="form-data-drawer-tools">
            </div>
            <div class="form-data-drawer-json-view">
              <pre>
                <code class="hljs"></code>
              </pre>
            </div>
          </div>
        </div>
        <div class="resize-controller"></div>
      `;
      this.initStyle();
      this.initEvent();
      // 初始化当前显示的状态
      if (!this.open) {
        this.dom.drawerContainer.style.display = 'none';
        this.showLighthouse();
      }
    }
  }
  LOCAL_OPEN_STATUS = 'LOCAL_OPEN_STATUS';
  get open() {
    const status = localStorage.getItem(this.LOCAL_OPEN_STATUS);
    return status === '1';
  }
  set open(bool) {
    localStorage.setItem(this.LOCAL_OPEN_STATUS, bool ? 1 : 0);
    var width =
      window.innerWidth ||
      document.documentElement.clientWidth ||
      document.body.clientWidth;
    var height =
      window.innerHeight ||
      document.documentElement.clientHeight ||
      document.body.clientHeight;
    if (bool) {
      const containerWidth = 300;
      const containerHeight = 280;
      this.x = width / 2 - containerWidth / 2;
      this.y = height / 2 - containerHeight / 2;
      this.dom.drawerContainer.style.display = 'block';
      this.containerMove();
      this.containerResize(containerWidth, containerHeight);
    } else {
      this.dom.drawerContainer.classList.add('animate__bounceOutDown');
      const a = () => {
        this.containerResize(48, 30);
        this.x = 0;
        this.y = height;
        this.containerMove();
        this.dom.drawerContainer.classList.remove('animate__bounceOutDown');
        this.dom.drawerContainer.removeEventListener('animationend', a);
        this.dom.drawerContainer.style.display = 'none';
        this.showLighthouse();
      };
      this.dom.drawerContainer.addEventListener('animationend', a);
    }
    this.resetOpenStatusWindowStyle();
  }

  /**
   * 灯塔dom
   */
  ligthhouseDom = null;

  /**
   * 显示灯塔
   */
  showLighthouse() {
    let ld = this.ligthhouseDom;
    if (!ld) {
      ld = document.createElement('img');
      this.ligthhouseDom = ld;
    }
    ld.src = lighthouseSvg;
    ld.style.position = 'fixed';
    ld.style.bottom = '10px';
    ld.style.left = '10px';
    ld.style.width = '64px';
    ld.style.height = 'auto';
    ld.style.cursor = 'pointer';
    ld.style.zIndex = '99999';
    ld.classList.add('animate__bounceInUp');
    ld.onanimationend = () => {
      ld.classList.remove('animate__bounceInUp');
      ld.onanimationend = null;
    };
    document.body.appendChild(ld);
    return new Promise((resolve, reject) => {
      ld.onclick = async () => {
        await this.closeLigthhouse();
        resolve();
      };
    });
  }

  /**
   * 关闭灯塔,打开弹窗
   */
  closeLigthhouse() {
    let ld = this.ligthhouseDom;
    if (!ld) return;
    ld.classList.add('animate__bounceIn');
    return new Promise((resolve, reject) => {
      ld.onanimationend = () => {
        ld.classList.remove('animate__bounceIn');
        ld.remove();
        this.open = true;
        resolve();
      };
    });
  }

  resetOpenStatusWindowStyle() {
    const delLogContainer = document.querySelector('#form-data-del-log');

    if (this.open) {
      document.querySelector('.form-data-drawer-title').style.display = 'block';
      document.querySelector('.form-data-drawer-open-btn').style.display =
        'none';
      document.querySelector('.form-data-drawer-close-btn').style.display =
        'block';
      delLogContainer ? (delLogContainer.style.display = 'block') : '';
    } else {
      document.querySelector('.form-data-drawer-title').style.display = 'none';
      document.querySelector('.form-data-drawer-open-btn').style.display =
        'block';
      document.querySelector('.form-data-drawer-close-btn').style.display =
        'none';
      delLogContainer ? (delLogContainer.style.display = 'none') : '';
    }
  }
  handleButClick(e) {
    this.open = !this.open;
  }
  update(container, pushData) {
    if (this.isdestory) return;
    const {
      event,
      lineNum,
      nodeStrinSplice,
      diffData,
      handleExtendsNode,
      copyText,
    } = pushData;
    const { payload, eventType } = event;
    const { html } = payload;

    this.dom.drawerContainer.querySelector('code').innerHTML = html;

    this.plugins.forEach((plugin) => {
      if (plugin.update) {
        plugin.update(this.dom.drawerContainer, pushData);
      }
    });

    let toolsHtml = ``;

    for (let i = 0; i < nodeStrinSplice.length; i++) {
      const item = nodeStrinSplice[i];
      toolsHtml += `
      <div
          style="padding-inline: 10px;
            display: flex;
            justify-content: space-between;
            column-gap:10px;
            align-items:center;
         "
        >
        <div
            style="color:#666666;width:20px;text-align:right;"
          >
            ${i + 1}
          </div>
          <div
                style="cursor: pointer;"
                data-index="${i}"
                data-rule="copy"
              >
                <svg
                  t="1716861287918"
                  viewBox="0 0 1024 1024"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  p-id="2597"
                  width="16"
                  height="16"
                >
                  <path
                    d="M682.666667 42.666667H85.333333v682.666666h85.333334V128h512V42.666667zM256 213.333333l4.522667 768H896V213.333333H256z m554.666667 682.666667H341.333333V298.666667h469.333334v597.333333z"
                    fill="#666666"
                    p-id="2598"
                  ></path>
                </svg>
              </div>
              <div
                data-index="${i}"
                ${item.isNode ? 'data-rule="expan"' : ''}
                style="
                  width: 12px;
                  height: 12px;
                  line-height: ${item.isExpansion ? '9px' : '12px'};
                  text-align: center;
                  cursor: pointer;
                  border: ${item.isNode ? '1px solid #333333' : ''};
                "
              >
                ${item.isNode ? (item.isExpansion ? '-' : '+') : ''}
              </div>
      </div>
      `;
    }

    this.dom.drawerContainer.querySelector(
      '.form-data-drawer-tools'
    ).innerHTML = toolsHtml;

    this.dom.drawerContainer
      .querySelectorAll('.form-data-drawer-tools div[data-rule="expan"]')
      .forEach((node) => {
        node.onclick = (e) => {
          handleExtendsNode(nodeStrinSplice[node.dataset.index]);
        };
      });
    this.dom.drawerContainer
      .querySelectorAll('.form-data-drawer-tools div[data-rule="copy"]')
      .forEach((node) => {
        node.onclick = (e) => {
          try {
            copyText(nodeStrinSplice[node.dataset.index]);
            this.domAnimToast('复制成功', { event: e });
          } catch (err) {}
        };
      });
  }

  containerMove() {
    const { drawerContainer } = this.dom;
    if (this.x < 0) {
      this.x = 0;
    }
    if (this.x > this.scrrenWidth - drawerContainer.clientWidth) {
      this.x = this.scrrenWidth - drawerContainer.clientWidth;
    }
    if (this.y < 0) {
      this.y = 0;
    }
    if (this.y > this.scrrenHeight - drawerContainer.clientHeight) {
      this.y = this.scrrenHeight - drawerContainer.clientHeight;
    }

    drawerContainer.style.setProperty('--x', `${this.x}px`);
    drawerContainer.style.setProperty('--y', `${this.y}px`);

    this.setLocalPosition();
  }

  initEvent() {
    this.dom.drawerContainer.querySelector(
      '.form-data-drawer-close-btn'
    ).onclick = () => {
      this.open = false;
    };
    this.dom.drawerContainer.querySelector(
      '.form-data-drawer-open-btn'
    ).onclick = () => {
      this.open = true;
    };
    const header = this.dom.drawerContainer.querySelector(
      '.form-data-drawer-header'
    );

    header.onmousedown = (e) => {
      let sx = e.clientX;
      let sy = e.clientY;
      const rect = this.dom.drawerContainer.getBoundingClientRect();
      window.onmousemove = (e) => {
        let x = e.clientX;
        let y = e.clientY;
        let dx = x - sx;
        let dy = y - sy;
        this.x = rect.left + dx;
        this.y = rect.top + dy;
        this.containerMove();
      };

      window.onmouseup = () => {
        window.onmousemove = null;
        window.onmouseup = null;
      };
    };

    window.onresize = () => {
      this.scrrenWidth = document.documentElement.clientWidth;
      this.scrrenHeight = document.documentElement.clientHeight;
      this.containerMove();
    };

    const resizeHandlerBtn =
      this.dom.drawerContainer.querySelector('.resize-controller');
    resizeHandlerBtn.onmousedown = (e) => {
      const sx = e.clientX;
      const sy = e.clientY;
      const crect = this.dom.drawerContainer.getBoundingClientRect();
      window.onmousemove = (e) => {
        const ex = e.clientX;
        const ey = e.clientY;
        const disx = ex - sx;
        const disy = ey - sy;
        const w = crect.width + disx;
        const h = crect.height + disy;
        this.containerResize(w, h);
      };

      window.onmouseup = () => {
        window.onmousemove = null;
        window.onmouseup = null;
      };
    };

    const hljs = document.querySelector('.hljs');
    hljs.onclick = (event) => {
      if (this.isCopyNode(event.target)) {
        try {
          copyObjectToClipboard(event.target.innerText.replaceAll('"', ''));
          this.domAnimToast('复制成功', {
            event: event,
          });
        } catch (err) {
          this.domAnimToast('复制失败', {
            event: event,
          });
        }
      }
    };
  }
  isCopyNode(node) {
    return (
      node.className.includes('hljs-string') ||
      node.className.includes('hljs-literal')
    );
  }

  /**
   * 盒子大小尺寸
   */
  LOCAL_POSITION_BOX_SIZE = 'LOCAL_POSITION_BOX_SIZE';
  /**
   * 变化盒子大小
   */
  containerResize(w, h) {
    const container = this.dom.drawerContainer;

    if (w < 48) {
      w = 48;
    }

    if (h < 48) {
      h = 48;
    }

    container.style.width = w + 'px';
    container.style.height = h + 'px';
    localStorage.setItem(
      this.LOCAL_POSITION_BOX_SIZE,
      JSON.stringify({ w, h })
    );
  }

  LOCAL_POSITION_POSITION = 'star_note_positon';
  /**
   * 存储位置
   */
  setLocalPosition() {
    localStorage.setItem(
      this.LOCAL_POSITION_POSITION,
      JSON.stringify({ x: this.x, y: this.y })
    );
  }

  destory() {
    this.plugins.forEach((plugins) => {
      if (plugins.destory) {
        plugins.destory();
      }
      plugins = null;
    });
    this.dom.drawerContainer.remove();
    this.plugins = [];
    this.isDestory = true;
  }
}
