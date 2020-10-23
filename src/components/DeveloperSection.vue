<template>
  <div>
    <h3>Checkboxes</h3>
    <div style="display: flex;">
      <!-- <input id="id-01" type="checkbox"/> -->
      <BaseCheckbox :startChecked="check1" v-on:click="check(1, $event)"/>
      <BaseCheckbox :startChecked="check2" :isDisabled="disable2" label="Sample label" v-on:click="check(2, $event)"/>
    </div>
    <BaseCodeBlock :content="checkMsg"/>
    <h3>Buttons</h3>
    <BaseButton color="success" v-on:click="add" content="Add Stakeholder"/>
    <BaseButton color="danger" v-on:click="del" content="Delete Stakeholder"/>
    <BaseButton color="primary" content="Sample Button"/>
    <h3>Test</h3>
    <BaseCodeBlock :content="test"/>
    <h3>Miscellaneous Data</h3>
    <BaseCodeBlock :content="misc"/>
    <h3>Project Data</h3>
    <BaseCodeBlock :content="project"/>
  </div>
</template>

<script>
import BaseButton from '../components/BaseButton.vue'
import BaseCheckbox from '../components/BaseCheckbox.vue'
import BaseCodeBlock from '../components/BaseCodeBlock.vue'

import Util from '../classes/Util.js'
import { project, misc } from '../store.js'

export default {
  name: 'DeveloperSection',
  components: {
    BaseButton,
    BaseCheckbox,
    BaseCodeBlock,
  },
  data() {
    return {
      check1: false,
      check2: true,
      disable2: false,
    }
  },
  computed: {
    checkMsg() {
      return Util.strObj({
        check1: this.check1,
        check2: this.check2,
        disable2: this.disable2,
      })
    },
    test() {
      return project.data.stakeholderSection.stakeholders
    },
    misc() {
      return Util.strObj(misc)
    },
    project() {
      return Util.strObj(project.data)
    },
  },
  methods: {
    add() {
      project.addStakeholder('TEST', '#4cb159')
    },
    del() {
      project.delStakeholder('TEST')
    },
    check(n, event) {
      if (n === 1) this.disable2 = !this.disable2
      this[`check${n}`] = event
    }
  },
}
</script>

<style>

</style>
