<template>
  <button class="right" @click="update">修改数据</button>
</template>
<script setup>
import { oldVnode, newVnode } from '../src/test/data.js';
import useDataFormObserve from './useDataFormObserve.js';
import { ref } from 'vue';
const jsonData = ref(oldVnode);
let isUpdate = true;
useDataFormObserve(jsonData);
const update = () => {
  isUpdate = !isUpdate;
  jsonData.value = isUpdate ? oldVnode : newVnode;
};
</script>
<style>
.right {
  position: absolute;
  right: 0px;
  top: 0px;
}
</style>
