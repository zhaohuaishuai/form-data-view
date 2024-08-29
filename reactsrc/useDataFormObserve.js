import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

import {
  DataFormObserve,
  ScrollUpdateObserve,
  DeleteLogObserve,
  DrawerModel,
} from '../src/utils/index.js';
import '../src/css/a11-dark.scss';
export default function useDataFormObserve(jsonData) {
  const [dataFormObserve, setDataFormObserve] = useState(null);
  useEffect(() => {
    setDataFormObserve(
      new DataFormObserve({
        plugins: [
          new DrawerModel({
            plugins: [new ScrollUpdateObserve(), new DeleteLogObserve()],
          }),
        ],
      })
    );
    return () => {
      dataFormObserve && dataFormObserve.destory();
    };
  }, []);
  useEffect(() => {
    dataFormObserve && dataFormObserve.update(jsonData);
  }, [jsonData, dataFormObserve]);

  return { dataFormObserve };
}
