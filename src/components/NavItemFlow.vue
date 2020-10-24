<template>
  <li>
    <div class="row">
      <div style="width: 30px; height: 30px; color: #BBB; border: 1px solid red; border-radius: 100px;">icon</div>
      <a :href="to">{{ title }}</a>
    </div>
    <div v-if="showArrow" style="width: 10px; margin-left: 10px; color: #BBB;  border: 1px solid green;">arrow</div>
  </li>
</template>

<script>

import Util from '../classes/Util.js'
import { project } from '../store.js'

// TODO link/button component
// TODO icon
// TODO arrow
// TODO various states
export default {
  name: 'NavItemFlow',
  components: {

  },
  props: {
    to: String,
    title: String,
    showArrow: {
      type: Boolean,
      default: true,
    }
  },
  data() {
    return {

    }
  },
  computed: {

  },
  methods: {

  },
}
</script>

<style>
  li {
    margin-bottom: .5rem;
  }
  a {
    margin-left: .5rem;
    padding: .3rem .7rem;
    font-weight: bold;
    text-decoration: none;
    color: var(--color-text-white);
    border: 1px solid #555;
    border-radius: 4px;
  }
  .row {
    display: flex;
    align-items: center;
  }
</style>
