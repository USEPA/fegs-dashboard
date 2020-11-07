<template>
  <div>
    <BaseCheckbox
      style="margin-bottom: .5rem;"
      label="Show definitions"
      @click="onClick"
      :startChecked="true"
    />
    <div class="table-wrap">
      <TableBeneficiary :showDefinitions="showDefinitions"/>
    </div>
  </div>
</template>


<script>
import BaseCheckbox from './BaseCheckbox.vue'
import TableBeneficiary from './TableBeneficiary.vue'

import Util from '../classes/Util.js'
import { project } from '../store.js'

export default {
  name: 'SectionBeneficiary',
  components: {
    BaseCheckbox,
    TableBeneficiary,
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
    overflow: auto;
  }
</style>