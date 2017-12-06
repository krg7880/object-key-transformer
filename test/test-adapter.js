const expect = require('chai').expect
const Adapter = require('./../src/adapter.js')
let adapter = null
let data = null

describe('Adapter', () => {
  beforeEach(() => {
    adapter = new Adapter(false)
    data = {
      full_address: "19 Union Square West, 12th Floor, New York, NY 10003",
      nested: {
       nested_property: "some nested property",
      },
      street: "19 Union Square West",
      state: "New York",
      city: "New York",
      postal_code: "10003",
      unit: "19FL",
      "test_array": ["this is a tes", {
        "this is a test": "1.2.3"
      }]
    }
  })

  it('should convert to snake_case', () => {
    const results = adapter.toSnakeCase().adapt({data})
    const keys = Object.keys(results)
    expect(keys.includes('full_address')).to.equal(true)
    expect(keys.includes('postal_code')).to.equal(true)
    expect(keys.includes('test_array')).to.equal(true)
    expect(hasOwnProperty.call(results.nested, 'nested_property')).to.equal(true)
  })

  it('should return `false` when invalid format is specified', () => {
    const results = adapter.adapt({data, format: 'weird'})
    expect(results).to.equal(false)
  })

  it('should return `original data` when invalid format is specified', () => {
    const results = adapter.returnOriginalData().adapt({data, format: 'weird'})
    const keys = Object.keys(results)
    expect(keys.includes('full_address')).to.equal(true)
    expect(keys.includes('postal_code')).to.equal(true)
    expect(keys.includes('test_array')).to.equal(true)
    expect(hasOwnProperty.call(results.nested, 'nested_property')).to.equal(true)
  })

  it('should convert to camelCase', () => {
    const results = adapter.toCamelCase().adapt({data})
    const keys = Object.keys(results)
    expect(keys.includes('fullAddress')).to.equal(true)
    expect(keys.includes('postalCode')).to.equal(true)
    expect(keys.includes('testArray')).to.equal(true)
    expect(hasOwnProperty.call(results.nested, 'nestedProperty')).to.equal(true)
  })

  it('should convert to camelCase but filter some properties from transformation', () => {
    const results = adapter.filter(['postal_code']).toCamelCase().adapt({data})
    const keys = Object.keys(results)
    expect(keys.includes('fullAddress')).to.equal(true)
    expect(keys.includes('postal_code')).to.equal(true)
    expect(keys.includes('testArray')).to.equal(true)
    expect(hasOwnProperty.call(results.nested, 'nestedProperty')).to.equal(true)
  })
})
