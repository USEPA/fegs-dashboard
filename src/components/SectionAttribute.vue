<template>
  <div>
    <div style="display: flex;">
      <BaseCheckbox
        style="margin-bottom: .5rem;"
        label="Show definitions"
        @click="onClick"
        :startChecked="true"
      />
    </div>
    <div class="table-wrap">
      <TableAttribute :showDefinitions="showDefinitions"/>
    </div>
  </div>
</template>


<script>
import BaseCheckbox from './BaseCheckbox.vue'
import TableAttribute from './TableAttribute.vue'

import Util from '../classes/Util.js'
import { project } from '../store.js'

export default {
  name: 'SectionAttribute',
  components: {
    BaseCheckbox,
    TableAttribute,
  },
  data() {
    return {
      showDefinitions: true,
    }
  },
  computed: {
    
  },
  methods: {
    onClick(event) {
      this.showDefinitions = event
    }
  },
}
</script>

<style scoped>
  .table-wrap {
    margin: 0 calc(-1 * var(--length-primary));
    overflow-x: auto;
  }
</style>