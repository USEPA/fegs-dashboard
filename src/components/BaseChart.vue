<template>
  <div 
    class="chart-wrap"
  >
    <h3 v-if="title">
      {{ title }}
      <BaseButtonIcon
        v-if="downloadable"
        style="display: inline;"
        icon="download"
        hint="Download Chart"
        doBlurOnClick
        @click="beginDownload"
      />
    </h3>
    <div
      ref="chart"
      class="chart"
      :style="{ maxWidth: width }"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script>
import BaseButtonIcon from './BaseButtonIcon.vue'

// TODO downloadable

export default {
  name: 'BaseChart',
  components: {
    BaseButtonIcon,
  },
  props: {
    title: String,
    width: String,
    downloadable: Boolean,
  },
  methods: {
    beginDownload() {
      // window.ipc.send() 
    }
  },
}
</script>

<style scoped>
  .chart-wrap {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .chart {
    width: 100%;
  }
  h3 {
    margin: 2em 0 .5em 1em;
  }
</style>