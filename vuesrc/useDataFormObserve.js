import { watch, onUnmounted, onActivated, onDeactivated, onMounted } from 'vue';
import {
  DataFormObserve,
  ScrollUpdateObserve,
  DeleteLogObserve,
  DrawerModel,
} from '../src/utils/index.js';
import '../src/css/a11-dark.scss';

export default function useDataFormObserve(data) {
  if (import.meta.env.MODE === 'development') {
    let noteApp = null;
    watch(
      () => data.value,
      () => {
        noteApp && noteApp.update(JSON.parse(JSON.stringify(data.value)));
      },
      {
        deep: true,
      }
    );

    onMounted(() => {
      if (!noteApp) {
        noteApp = new DataFormObserve({
          onUpdate() {},
          plugins: [
            new DrawerModel({
              plugins: [new ScrollUpdateObserve(), new DeleteLogObserve()],
            }),
          ],
        });
        noteApp.update(data.value);
      }
    });

    onActivated(() => {
      noteApp = new DataFormObserve({
        onUpdate() {},
        plugins: [
          new DrawerModel({
            plugins: [new ScrollUpdateObserve(), new DeleteLogObserve()],
          }),
        ],
      });
      noteApp.update(data.value);
    });

    onUnmounted(() => {
      // noteApp && noteApp.destory()
      // window.removeEventListener('dblclick', cr)
    });
    onDeactivated(() => {
      // noteApp && noteApp.destory()
      // window.removeEventListener('dblclick', cr)
    });
  }
  return;
}
