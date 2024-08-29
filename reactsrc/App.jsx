import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

import { oldVnode, newVnode } from '../src/test/data.js';
import useDataFormObserve from './useDataFormObserve.js';
function App() {
  // jsonData
  const [jsonData, setJsonData] = useState(oldVnode);
  const [isUpdate, setIsUpdate] = useState(false);
  const update = useCallback(() => {
    setJsonData(!isUpdate ? newVnode : oldVnode);
    setIsUpdate(!isUpdate);
  }, [isUpdate, jsonData]);
  const test = useCallback(async () => {
    const dealy = (duration) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve();
        }, duration);
      });
    };
    setJsonData(newVnode);
    await dealy(250);
    setJsonData(newVnode);
    // await dealy(500);
    // setJsonData(oldVnode);
  }, [jsonData]);
  const { dataFormObserve } = useDataFormObserve(jsonData);

  return (
    <>
      <button onClick={() => update()}>更新数据</button>
      <button
        onClick={() => dataFormObserve.destory && dataFormObserve.destory()}
      >
        销毁实例
      </button>

      <button onClick={() => test()}>test</button>
    </>
  );
}

export default App;
