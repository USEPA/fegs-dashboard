import Util from '../../classes/Util.js'

// Input validation and manipulation
export default {
  methods: {
    validateNumRange(val, { min=0, max=100, decimals=2, numErr='Must be a number', minErr='Must be at least 0', maxErr='Must be at most 100' }={}) { // val may be null
      if (val === '' || val === null) return { val: null, err: '' }
      const num = parseFloat(val)
      if (Number.isNaN(num)) return { val: null, err: numErr }
      if (num < min) return { val: min, err: minErr }
      if (num > max) return { val: max, err: maxErr }
      return { val: Util.round(num, decimals), err: '' }
    },
    scaleUp(val, { mult=100, decimals=2 }={}) { // val may be null
      return Util.isNum(val) ? Util.round(val*mult, decimals) : null
    },
    scaleDown(val, { mult=100, decimals=5 }={}) { // val may be null
      return Util.isNum(val) ? Util.round(val/mult, decimals) : null
    },
  }
}