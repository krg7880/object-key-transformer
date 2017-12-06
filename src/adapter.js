const hasOwnProperty = Object.prototype.hasOwnProperty

/**
 * Object containing a variety of formatting 
 * methods we can leverage to transform the 
 * object keys to the desired format.
 * 
 * @type {Object}
 */
const formatters = require('change-case')


/**
 * Check if we're tom return the original payload
 * in the event of an error or false otherwise.
 * @param {*} data 
 */
const shouldReturnOriginalData = (data) => {
  if (_private(this)._returnOriginal) {
    return data
  } else {
    return false
  }
}

/**
 * Logs messages for debugging purposes but only 
 * if a logger was specified or logging wasn't 
 * explicitly disabled.
 * 
 * @param {Mixed} msg - Message to log 
 */
const _debug = (msg) => {
  if (typeof this.logger !== 'undefined') this.logger(msg)
}

const Private = () => {
  const map = new WeakMap();

  return function(object) {
      if (!map.has(object)) {
          map.set(object, {});
      }
      return map;
  };
}

const _private = Private()


/**
 * The Adapter class allows you to easily
 *  transform the properties of an object 
 *  or the index of an associative array
 *  using built-in methods or via a custom
 *  method you provide. 
 */
class Adapter {
  /**
   * Creates an Adapter instance and accepts
   * an instance of a custom logger function to send
   * messages to. If no logger is provided,
   * console.log will be used. You may also
   * send false to disable logging.
   * 
   * <pre><code>
   * // disable logging
   * const adapter = new Adapter(false)
   * adapter
   *  .returnOriginalData()
   *  .toCamelCase()
   *  .adapt({...})
   * </code></pre>
   * 
   * @param {Function} log - Instance of a custom logger
   */
  constructor(log) {
    if (log !== false) {
      this.logger = log || console.log
    }

    /** 
     * Fugly but it keeps clients from stepping on their own toes 
     * by keep things private as needed
     */
    _private(this)._data = null
    _private(this)._returnOriginal = false
    _private(this)._recursive = true
    _private(this)._filter = null
    _private(this)._shouldReturnOriginalData = shouldReturnOriginalData.bind(this)
    _private(this)._debug = _debug.bind(this)

    /**
     * The formatter used to reformat the
     * properties or keys of an object or array
     * 
     * @type {Object}
     */
    _private(this)._formatter = null

    /**
     * Inherits the formatters so we can 
     * chain calls and specify the format
     * we want prior to invoking the 
     * formatting. 
     * 
     * Note: we skip over functions that
     * return boolean values (ie: isLower(), isUpper())
     * 
     * @example
     * const adapter = new Adapter()
     * adapter.toCamelCase().format({})
     */
    for (let fn in formatters) {
      if (hasOwnProperty.call(formatters, fn) && fn.toLowerCase().substr(0, 2) !== 'is') {
        this[`to${formatters.ucFirst(fn)}`] = () => {
          _private(this)._formatter = formatters[fn]
          return this
        }
      }
    }
  }

  /**
   * Tells the adapter to return the
   * original payload if an invalid
   * formatter was specified. This
   * maybe useful in environments where
   * the formatter may be specified by
   * some external clients but you 
   * want to proceed without blowing up.
   * 
   * @return {Object} this Reference to this adapter instance
   */
  returnOriginalData() {
    _private(this)._returnOriginal = true
    return this
  }

  /**
   * Disables recursively iterating the collection
   * and only apply the transformation to root level
   * properties
   * 
   * @return {Object} this Reference to this adapter instance
   */
  disableRecursion() {
    _private(this)._recursive = false
    return this
  }

  /**
   * A collection of keys to filter
   * from the transformation process. 
   * Any keys that contains an entry 
   * in this collection will not get
   * transformed.
   * 
   * @param {Array} filter 
   * @return {Object} this Reference to this adapter instance
   */
  filter(filter) {
    _private(this)._filter = filter
    return this
  }

  /**
   * Recursively iterates the object and 
   * adapt each property using the formatter
   * function specified.
   * 
   * @param {Object|Array) data Original payload to adapt
   * @param {Object|Array} adaptedData The adapted payload 
   * @param {Function} formatter The function used to adapt the properties
   * 
   * @return {Object} The transformed object
   */
  iterator(data={}, adaptedData) {
    for (let key in data) {
      if (hasOwnProperty.call(data, key)) {
        if (typeof(data[key]) === 'object' && _private(this)._recursive) {
          if (_private(this)._filter && _private(this)._filter.includes(key)) {
            adaptedData[key] = Array.isArray(data[key]) ? [] : {}
            adaptedData[key] = this.iterator(data[key], adaptedData[key])
          } else {
            adaptedData[_private(this)._formatter(key)] = Array.isArray(data[key]) ? [] : {}
            adaptedData[_private(this)._formatter(key)] = this.iterator(data[key], adaptedData[_private(this)._formatter(key)])
          }
        } else {
          if (_private(this)._filter && _private(this)._filter.includes(key)) {
            adaptedData[key] = data[key]
          } else {
            adaptedData[_private(this)._formatter(key)] = data[key]
          }
        }
      }
    }

    return adaptedData
  }

  /**
   * @description
   * Attempts to adapt the provided datas' properties
   * to the specified format *(ie: camelCase)*. If the 
   * specified formatter is not recognized, the original
   * payload is returned by calling `returnOriginalData()`
   * 
   * *Supported Formatting:*
   * 
   * - camel
   * - constant
   * - dot
   * - header
   * - lower
   * - lcFirst
   * - no
   * - param
   * - pascal
   * - path
   * - sentence
   * - snake
   * - swap
   * - title
   * - upper
   * - ucFirst
   * @param {Object} options
   * @prop {Object|Array} Object.data The payload to whos keys to transform 
   * @prop {string|Function} Object.format The formatting to apply
   * @prop {Boolean} Object.returnOriginal If the specified formatter is invalid,
   * @prop {Boolean} Should we transform the entire object or just
   * root level properties.
   *  should we return the orginal payload?
   */
  adapt(options={data: null, format: null, returnOriginal: false, recursive: true}) {

    const {data, format, returnOriginal} = options 
    // check if we have valid data
    if (data) {
      _private(this)._data = data
    } else if (!_private(this)._data) {
      return _private(this)._shouldReturnOriginalData(data)
    }

    // verify the format is specified
    if ((typeof format === 'string' && typeof formatters[format] === 'function')) {
      _private(this)._formatter = formatters[format]
    } else if (typeof formatter === 'function') {
      _private(this)._formatter = format
    } else if (!_private(this)._formatter) { 
      // No valid formatter was specified. Return false or original payload
      _private(this)._debug(`${format} is not a recognized format! Returning original payload`)
      return _private(this)._shouldReturnOriginalData(_private(this)._data)
    }

    return this.iterator(_private(this)._data, Array.isArray(_private(this)._data) ? [] : {})
  }
}

module.exports = Adapter
