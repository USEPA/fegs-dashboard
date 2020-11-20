<template>
  <BaseChart
    ref="parent"
    :title="title"
    :width="`${width}px`"
  >
    <svg
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      :viewBox="`0 0 ${width} ${height}`" 
    >
      <g :transform="`translate(${width/2}, ${height/2})`">
        <g class="slices">
          <path
            v-for="d in drawableData"
            :key="d.label"
            :style="{ fill: d.color }"
            :d="`M${d.points.start.x},${d.points.start.y} A${radii.slice},${radii.slice},0,${d.percent>50?1:0},1,${d.points.end.x},${d.points.end.y} L0,0 Z`"
          />
        </g>
        <g class="lines">
          <polyline
            v-for="d in drawableData"
            stroke="#111"
            stroke-width="1px"
            fill="none"
            :key="d.label"
            :points="`${d.points.line.x},${d.points.line.y},${d.points.bend.x},${d.points.bend.y},${d.points.mid.x},${d.points.mid.y}`"
          />
        </g>
        <g class="labels" style="font: 14px sans-serif;">
          <text
            v-for="d in drawableData"
            dy=".35em"
            :key="d.label"
            :style="{ textAnchor: (d.sign > 0) ? 'start' : 'end' }"
            :transform="`translate(${d.points.label.x},${d.points.label.y})`"
          >
            {{ d.label }} ({{ d.percent }}%)
          </text>
        </g>
        <!-- <path
          style="fill: white"
          :d="`M${radii.slice-20},0 A${radii.slice-20},${radii.slice-20},0,1,1,${radii.slice-20},0 Z`"
        /> -->
      </g>
    </svg>
  </BaseChart>
</template>

<script>
import BaseChart from './BaseChart.vue'

import Util from '../classes/Util.js'

export default {
  name: 'BasePieChart',
  components: {
    BaseChart,
  },
  props: {
    title: String, // empty for no title nor download button
    width: Number, // should be greater than height so the labels will fit on the sides
    height: Number,
    data: Array, // [{ label: str, value: num }, ...]
    colors: Object, // { label: color, ... } NOTE this is separate for consistency with the bar chart component
  },
  computed: {
    radii() {
      const total = Math.min(this.width/2, this.height/2) // largest possible radius
      const bend = total - 10 // radius where line bends
      const slice = bend - 10 // radius of pie slices
      return { total, bend, slice }
    },
    drawableData() {
      const cleanData = this.data.filter(d => d.value > 0).sort((a, b) => b.value - a.value) // non-zero data ordered from large to small
      const sum = this.data.reduce((acc, item) => acc + item.value, 0) // sum of data values

      const ret = []
      let prevAngle = Math.PI

      cleanData.forEach(({ label, value }) => {
        const nextAngle = (prevAngle + (value / sum) * Math.PI * 2) % (Math.PI * 2)
        const midAngle = (prevAngle + (value / sum) * Math.PI) % (Math.PI * 2)
        const labelSign = (midAngle > Math.PI * 0.5 && midAngle < Math.PI * 1.5) ? -1 : 1

        // console.log(`${midAngle} ... ${labelSign}`)

        ret.push({
          label,
          value,
          color: (label in this.colors) ? this.colors[label] : '#DDD',
          percent: (sum > 0) ? Util.round((value / sum) * 100, 1) : 0,
          sign: labelSign,
          points: {
            start: {
              x: Math.cos(prevAngle) * this.radii.slice,
              y: Math.sin(prevAngle) * this.radii.slice,
            },
            mid: {
              x: Math.cos(midAngle) * this.radii.slice,
              y: Math.sin(midAngle) * this.radii.slice,
            },
            end: {
              x: Math.cos(nextAngle) * this.radii.slice,
              y: Math.sin(nextAngle) * this.radii.slice,
            },
            bend: {
              x: Math.cos(midAngle) * this.radii.bend,
              y: Util.round(Math.sin(midAngle) * this.radii.bend) + .5, // on pixel
            },
            line: {
              x: labelSign * this.radii.total,
              y: Util.round(Math.sin(midAngle) * this.radii.bend) + .5, // on pixel
            },
            label: {
              x: labelSign * this.radii.total + 5 * labelSign,
              y: Math.sin(midAngle) * this.radii.bend,
            },
          },
        })

        prevAngle = nextAngle
      })
      return ret
    },

  },
}
</script>

<style scoped>
  svg g text {
    font: 1rem var(--font-family-text);
  }
</style>