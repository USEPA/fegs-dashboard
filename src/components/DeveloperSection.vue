<template>
  <div>
    <h3>Checkboxes</h3>
    <div style="margin-bottom: .5rem; display: flex;">
      <!-- <input id="id-01" type="checkbox"/> -->
      <BaseCheckbox :startChecked="check1" v-on:click="check(1, $event)"/>
      <BaseCheckbox :startChecked="check2" :isDisabled="disable2" label="Sample label" v-on:click="check(2, $event)"/>
    </div>
    <BaseCodeBlock :content="checkMsg"/>
    <h3>Buttons</h3>
    <BaseButton color="primary" content="Sample Button"/>
    <BaseButton color="success" v-on:click="add" content="Add Stakeholder"/>
    <BaseButton color="danger" v-on:click="del" content="Delete Stakeholder"/>
    <h3>Icon Buttons</h3>
    <div style="margin-bottom: .5rem; display: flex; font-size: 1.5rem;">
      <BaseButtonIcon color="primary" icon="edit"/>
      <BaseButtonIcon color="primary" icon="download"/>
      <BaseButtonIcon color="success" icon="check"/>
      <BaseButtonIcon color="danger" icon="trash"/>
    </div>
    <h3>Fields</h3>
    <BaseField style="margin: 0 .5rem .5rem 0;" type="text" v-on:change="onFieldChange" :validator="val => val.toLowerCase().includes('e')?'nope':''" startContent="Sample text" placeholder="Text"/>
    <BaseField style="margin: 0 .5rem .5rem 0;" type="text" :isDisabled="true" :validator="val => val.toLowerCase().includes('e')?'nope':''" startContent="Sample text" placeholder="Disabled"/>
    <BaseField style="margin: 0 .5rem .5rem 0;" type="number" :validator="val => val.toLowerCase().includes('3')?'nope':''" startContent="Sample text" placeholder="Number"/>
    <BaseCodeBlock :content="textMsg"/>
    <h3>Tables</h3>
    <BaseTable/>
    <h3>Test</h3>
    <BaseCodeBlock :content="test"/>
    <h3>Miscellaneous Data</h3>
    <BaseCodeBlock :content="misc"/>
    <h3>Project Data</h3>
    <BaseCodeBlock :content="project"/>
  </div>
</template>

<script>
import BaseButton from './BaseButton.vue'
import BaseButtonIcon from './BaseButtonIcon.vue'
import BaseCheckbox from './BaseCheckbox.vue'
import BaseCodeBlock from './BaseCodeBlock.vue'
import BaseField from './BaseField.vue'
import BaseTable from './BaseTable.vue'

import Util from '../classes/Util.js'
import { project, misc } from '../store.js'

export default {
  name: 'DeveloperSection',
  components: {
    BaseButton,
    BaseButtonIcon,
    BaseCheckbox,
    BaseCodeBlock,
    BaseField,
    BaseTable,
  },
  data() {
    return {
      check1: false,
      check2: true,
      disable2: false,
      text: '',
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
    textMsg() {
      return Util.strObj({
        content: this.text,
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
    },
    onFieldChange(event) {
      this.text = event
    }
  },
}
</script>

<style>

</style>
