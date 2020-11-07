<template>
  <div>
    <BaseButton
      style="margin-bottom: .5rem;"
      @click="newStakeholder"
    >
      New Stakeholder
    </BaseButton>
    <div class="table-wrap">
      <TableStakeholder
        v-if="hasStakeholders"
        :stakeholderNameValidator="stakeholderNameValidator"
      />
    </div>
  </div>
</template>


<script>
import BaseButton from './BaseButton.vue'
import FieldText from './FieldText.vue'
import TableStakeholder from './TableStakeholder.vue'

import Util from '../classes/Util.js'
import { project, uid } from '../store.js'

export default {
  name: 'SectionStakeholder',
  components: {
    BaseButton,
    FieldText,
    TableStakeholder,
  },
  data() {
    return {

    }
  },
  computed: {
    hasStakeholders() {
      return Object.keys(project.data.stakeholderSection.stakeholders).length > 0
    }
  },
  methods: {
    newStakeholder() {
      // TODO open stakeholder creation modal
      this.addStakeholder()
    },
    addStakeholder() {
      const color = project.data.stakeholderSection.computed.colorsRemain[0] || '#000'
      const name = `stakeholder ${uid.next().substring(3)}`
      project.addStakeholder(name, color)
    },
    stakeholderNameValidator(name) {
      if (name === '') {
        return 'Name cannot be empty'
      } else if (name in project.data.stakeholderSection.stakeholders) {
        return 'Stakeholder already exists'
      } else {
        return ''
      }
    },
  },
}
</script>

<style scoped>
  .table-wrap {
    margin: 0 calc(-1 * var(--length-primary));
    overflow: auto;
  }
</style>