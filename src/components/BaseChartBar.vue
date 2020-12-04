<template>
  <BaseChart
    ref="parent"
    :title="title"
    :width="`${width}px`"
    :downloadable="hasData"
  >
    <svg
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      :viewBox="`0 0 ${width} ${height}`" 
    >
      <g
        v-if="hasData"
        :transform="`translate(${lengths.width.side}, 0)`"
      >
        <g class="layers">
          <g
            v-for="layer in drawableData.layers"
            :key="layer.label"
            :style="{ fill: layer.color }"
          >
            <rect
              v-for="rect in layer.rects"
              :key="rect.key"
              :x="rect.x"
              :y="rect.y"
              :width="rect.width"
              :height="rect.height"
            />
          </g>
        </g>
        <g
          class="axis-x"
          style="font: 14px sans-serif; text-anchor: middle; fill: none;"
          :transform="`translate(0, ${lengths.height.plot+5})`"
        >
          <path
            class="domain-x"
            stroke="#111"
            :d="`M0.5,${lengths.tick} V0.5 H${lengths.width.plot+0.5} V${lengths.tick}`"
          />
          <g
            v-for="tick in drawableData.axisX"
            class="tick"
            :key="tick.label"
            :transform="`translate(${tick.x+0.5}, 0)`"
          >
            <line
              stroke="#111"
              :y2="lengths.tick"
            />
            <text
              dy="0.8em"
              style="fill: #111;"
              :y="lengths.tick+3"
            >
              {{ tick.label }}
            </text>
          </g>
        </g>
        <g
          class="axis-y"
          style="font: 14px sans-serif; text-anchor: end; fill: none;"
        >
          <path
            class="domain-y"
            stroke="#111"
            :d="`M${-lengths.tick},${lengths.height.plot+0.5} H0.5 V0.5 H${-lengths.tick}`"
          />
          <g
            v-for="tick in drawableData.axisY"
            class="tick"
            :key="tick.label"
            :transform="`translate(0, ${tick.y+0.5})`"
          >
            <line
              stroke="#111"
              :x2="-lengths.tick"
            />
            <text
              dy="0.32em"
              style="fill: #111;"
              :x="-(lengths.tick+3)"
            >
              {{ tick.label }}
            </text>
          </g>
        </g>
        <g
          style="font: 14px sans-serif; text-anchor: start;"
          :transform="`translate(${lengths.width.plot+30} ,0)`"
        >
          <g
            v-for="(label, i) in labels"
            :key="label"
            :transform="`translate(0, ${i * 20})`"
          >
            <rect
              width="18"
              height="18"
              :fill="colors[label]"
            />
            <text
              x="23"
              y="9"
              dy="0.35em"
            >
              {{ label }}
            </text>
          </g>
        </g>
      </g>
      <g
        v-else
        :transform="`translate(${lengths.width.side}, 10)`"
      >
        <rect
          x="0"
          y="0"
          :style="{ fill: 'var(--color-chart-placeholder)' }"
          :width="lengths.width.plot"
          :height="lengths.height.plot-10"
        />
        <text
          dy=".35em"
          :style="{ textAnchor: 'middle', fill: 'var(--color-text-disabled)' }"
          :x="lengths.width.plot/2"
          :y="lengths.height.plot/2-5"
        >
          No data
        </text>
      </g>
    </svg>
  </BaseChart>
</template>

<script>
import BaseChart from './BaseChart.vue'

import Util from '../classes/Util.js'

export default {
  name: 'BaseBarChart',
  components: {
    BaseChart,
  },
  props: {
    title: String, // empty for no title nor download button
    width: Number, // should be greater than height so the labels will fit on the sides
    height: Number,
    data: Array, // [{ 'key': str, 'values': [{ 'label': str, 'value': num }, ...] }, ...] (each element of the array defines a bar)
    colors: Object, // { label: color, ... }
  },
  computed: {
    lengths() {
      const plotWidth = this.height * 0.8 // area where bars can be drawn
      const sideWidth = (this.width - plotWidth) / 2 // space on left and right for y axis labels and legend
      const sideHeight = 50 // space on bottom for x axis labels
      const plotHeight = this.height - sideHeight
      return {
        tick: 6,
        width: {
          plot: plotWidth,
          side: sideWidth,
        },
        height: {
          plot: plotHeight,
          side: sideHeight,  
        },
      }
    },
    hasData() {
      if (!(this.data && this.data.length > 0)) return false
      for (let d of this.data) {
        for (let v of d.values) {
          if (v.value > 0) return true
        }
      }
      return false
    },
    labels() {
      const ret = []
      for (let d of this.data) {
        for (let v of d.values) {
          if (!ret.includes(v.label)) ret.push(v.label)
        }
      }
      return ret
    },
    drawableData() {
      const cleanData = [] // non-zero data keys
      let largest = 0
      this.data.forEach(({ key, values }) => {
        const sum = values.reduce((acc, v) => {
          return Util.isNum(v.value) ? acc + v.value : acc
        }, 0)
        if (sum > 0) cleanData.push({ key, values, sum })
        largest = Math.max(sum, largest)
      })

      const gapTotal = this.lengths.height.plot * 0.2 // total vertical plot space allotted to gaps between bars
      const gapHeight = gapTotal / (cleanData.length + 1) // height of a gap between bars and at ends
      const barHeight = (this.lengths.height.plot - gapTotal) / cleanData.length // height of a bar

      const barWidthMult = this.lengths.width.plot / largest // bar width multiplier

      let x, y

      const layerMap = {} // { label: [{ 'key': str, 'x': num, 'y': num, 'width': num, 'height': num }, ...], ... }
      this.labels.forEach(label => layerMap[label] = []) // populate initially
      y = gapHeight
      cleanData.forEach(({ key, values, sum }) => {
        x = 0
        values.forEach(({ label, value }) => {
          let width = value * barWidthMult
          let height = barHeight
          layerMap[label].push({ key, x, y, width, height })
          x += width
        })
        y += barHeight + gapHeight
      })

      const layers = []
      this.labels.forEach(label => {
        layers.push({
          label,
          color: (label in this.colors) ? this.colors[label] : '#DDD',
          rects: layerMap[label],
        })
      })

      const axisX = []
      let interval
      for (interval of [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50]) {
        if (interval * 12 >= largest) break
      }
      let i = 0
      while (i < largest) {
        axisX.push({
          label: Util.round(i, 2),
          x: i * barWidthMult
        })
        i += interval
      }

      const axisY = []
      y = gapHeight + barHeight / 2
      cleanData.forEach(({ key, values }) => {
        axisY.push({ label: key, y })
        y += barHeight + gapHeight
      })

      return { layers, axisX, axisY }
    },
  },
}
</script>

<style scoped>
  svg g text {
    font: 1rem var(--font-family-text);
  }
</style>