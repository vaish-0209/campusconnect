// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Polyfill Next.js Web APIs for testing
import { Request as NodeFetchRequest, Response as NodeFetchResponse, Headers, fetch } from 'node-fetch'

// Extend Response to add missing json() static method
class ExtendedResponse extends NodeFetchResponse {
  static json(data, init) {
    return new ExtendedResponse(JSON.stringify(data), {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
    })
  }
}

global.Request = NodeFetchRequest
global.Response = ExtendedResponse
global.Headers = Headers
global.fetch = fetch

// Mock FormData for file upload tests
if (typeof global.FormData === 'undefined') {
  global.FormData = class FormData {
    constructor() {
      this.data = new Map()
    }
    append(key, value) {
      // Store the value directly without modification
      this.data.set(key, value)
    }
    get(key) {
      const value = this.data.get(key)
      // Ensure File objects are returned with their methods intact
      return value
    }
    has(key) {
      return this.data.has(key)
    }
    delete(key) {
      this.data.delete(key)
    }
    entries() {
      return this.data.entries()
    }
  }
}

// Mock File for CSV upload tests
if (typeof global.File === 'undefined') {
  global.File = class File {
    constructor(content, filename, options = {}) {
      this.content = content
      this.name = filename
      this.type = options.type || 'text/plain'
      this.size = typeof content === 'string' ? content.length : 0
      this.lastModified = Date.now()

      // Bind methods to ensure they work when called after retrieval from FormData
      this.text = this.text.bind(this)
      this.arrayBuffer = this.arrayBuffer.bind(this)
    }

    text() {
      // Return a Promise that resolves to the text content
      return Promise.resolve(
        Array.isArray(this.content) ? this.content.join('') : String(this.content)
      )
    }

    arrayBuffer() {
      const str = Array.isArray(this.content) ? this.content.join('') : String(this.content)
      const buf = new ArrayBuffer(str.length)
      const view = new Uint8Array(buf)
      for (let i = 0; i < str.length; i++) {
        view[i] = str.charCodeAt(i)
      }
      return Promise.resolve(buf)
    }
  }
}
