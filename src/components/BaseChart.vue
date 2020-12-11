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
        @click="download"
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
  data() {
    return {
      rasterizing: false,
    }
  },
  methods: {
    async download() {
      if (this.rasterizing) return // don't download again while still rasterizing
      if (process.env.IS_ELECTRON) {
        this.rasterizing = true
        try {
          const svgNode = this.$refs.chart.firstChild
          const svgString = this.serializeSVG(svgNode) // 1ms
          const jpgBuffer = await this.rasterizeSVG(svgNode, { mime: 'jpeg' }) // 100ms
          const pngBuffer = await this.rasterizeSVG(svgNode, { mime: 'png' }) // 100ms

          // send all 3 filetypes, much simpler than sending a bunch of ipc messages to choose filetype
          // TODO do this properly with a call and response to get filetype
          window.ipc.send('chart', {
            cmd: 'save',
            data: {
              title: this.title,
              svg: svgString,
              jpg: jpgBuffer,
              png: pngBuffer,
            }
          })
        } catch (error) {
          console.error(error.message) // TODO ui indication of failure
        } finally {
          this.rasterizing = false
        }
      }
    },
    serializeSVG(svgNode) {
      const svg = svgNode.cloneNode(true)
      // ... attach class styles inline here as needed
      const serializer = new XMLSerializer()
      return serializer.serializeToString(svg)
    },
    async rasterizeSVG(svgNode, { mime='png', scale=2, pad=5 }={}) { // returns png/jpeg buffer promise
      return new Promise((resolve, reject) => {
        const svgString = this.serializeSVG(svgNode)
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
        
        const canvas = document.createElement('canvas')
        canvas.width = svgNode.clientWidth * scale + pad * 2
        canvas.height = svgNode.clientHeight * scale + pad * 2
        const ctx = canvas.getContext('2d')
        
        const img = new Image()
        img.onerror = reject
        img.onload = () => {
          if (mime === 'jpeg') { // transparency unsupported
            ctx.fillStyle = '#FFF' // background color
            ctx.fillRect(0, 0, canvas.width, canvas.height)
          }
          ctx.drawImage(img, pad, pad, canvas.width - pad * 2, canvas.height - pad * 2)
          canvas.toBlob(imgBlob => {
            imgBlob.arrayBuffer().then(result => {
              const buffer = Buffer.from(result)
              resolve(buffer)
            })
          }, `image/${mime}`)
        }
        img.src = window.URL.createObjectURL(svgBlob)
      })
    },
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