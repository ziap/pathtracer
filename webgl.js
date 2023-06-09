const canvas = document.querySelector('canvas')
const gl = canvas.getContext('webgl2')

let memory_buffer
const decoder = new TextDecoder()

function cstr(ptr) {
  const mem_arr = new Uint8Array(memory_buffer, ptr)

  let len = 0;
  while (mem_arr[len]) ++len

  const bytes = mem_arr.slice(0, len)
  return decoder.decode(bytes);
}

let gl_objs = []

const env = {
  fcos(x) { return Math.cos(x) },
  fsin(x) { return Math.sin(x) },
  puts(str) { console.log(cstr(str)) },
  glCreateBuffer() {
    const buffer = gl.createBuffer()
    gl_objs.push(buffer)
    return gl_objs.length - 1
  },
  glCreateVertexArray() {
    const vao = gl.createVertexArray()
    gl_objs.push(vao)
    return gl_objs.length - 1
  },
  glCreateShader(type) {
    const shader = gl.createShader(type)
    gl_objs.push(shader)
    return gl_objs.length - 1
  },
  glCreateProgram() {
    const program = gl.createProgram()
    gl_objs.push(program)
    return gl_objs.length - 1
  },
  glGetUniformLocation(program, name) {
    const location = gl.getUniformLocation(gl_objs[program], cstr(name))
    gl_objs.push(location)
    return gl_objs.length - 1
  },
  glViewport(x, y, w, h) {
    gl.viewport(x, y, w, h)
  },
  glSetShaderSource(shader, src) {
    gl.shaderSource(gl_objs[shader], cstr(src))
  },
  glCompileShader(shader) {
    gl.compileShader(gl_objs[shader])
  },
  glGetShaderParameter(shader, pname) {
    return gl.getShaderParameter(gl_objs[shader], pname)
  },
  glDeleteShader(shader) {
    gl.deleteShader(gl_objs[shader])
  },
  glAttachShader(program, shader) {
    gl.attachShader(gl_objs[program], gl_objs[shader])
  },
  glLinkProgram(program) {
    gl.linkProgram(gl_objs[program])
  },
  glValidateProgram(program) {
    gl.validateProgram(gl_objs[program])
  },
  glEnable(cap) {
    gl.enable(cap)
  },
  glUseProgram(program) {
    gl.useProgram(gl_objs[program])
  },
  glBindBuffer(target, buffer) {
    gl.bindBuffer(target, gl_objs[buffer])
  },
  glBindVertexArray(vao) {
    gl.bindVertexArray(gl_objs[vao])
  },
  glEnableVertexAttribArray(index) {
    gl.enableVertexAttribArray(index)
  },
  glBufferData(target, size, data, usage) {
    if (data != 0) {
      const slice = new Uint8Array(memory_buffer, data, size)
      gl.bufferData(target, slice, usage)
    } else {
      gl.bufferData(target, size, usage)
    }
  },
  glVertexAttribPointer(index, size, type, normalized, stride, offset) {
    gl.vertexAttribPointer(index, size, type, normalized, stride, offset)
  },
  glClear(mask) {
    gl.clear(mask)
  },
  glBufferSubData(target, offset, size, data) {
    const slice = new Uint8Array(memory_buffer, data, size)
    gl.bufferSubData(target, offset, slice)
  },
  glUniform3f(location, x, y, z) {
    gl.uniform3f(gl_objs[location], x, y, z)
  },
  glUniform2f(location, x, y) {
    gl.uniform2f(gl_objs[location], x, y)
  },
  glUniform1f(location, x) {
    gl.uniform1f(gl_objs[location], x)
  },
  glUniform1i(location, x) {
    gl.uniform1i(gl_objs[location], x)
  },
  glDrawArrays(mode, first, count) {
    gl.drawArrays(mode, first, count)
  }
}

const wasm = await WebAssembly.instantiateStreaming(fetch('./app.wasm'), { env })
const { exports } = wasm.instance

memory_buffer = exports.memory.buffer

function resize() {
  canvas.width = innerWidth
  canvas.height = innerHeight
  exports.resize(innerWidth, innerHeight)
}

addEventListener('resize', resize)

let mouse_x = 0, mouse_y = 0
let is_dragging = false
document.addEventListener("mousedown", () => is_dragging = true)
document.addEventListener("mouseup", () => is_dragging = false)

document.addEventListener("mousemove", (e) => {
  if (!is_dragging) return;
  mouse_x += e.movementX
  mouse_y += e.movementY

  exports.update_mouse(mouse_x, mouse_y)
});

document.addEventListener("keydown", (e) => {
  const ch = e.key.toUpperCase()
  if (ch.length == 1) {
    exports.key_pressed(ch.charCodeAt(0))
  }
})

document.addEventListener("keyup", (e) => {
  const ch = e.key.toUpperCase()
  if (ch.length == 1) {
    exports.key_released(ch.charCodeAt(0))
  }
})

exports.update_mouse(mouse_x, mouse_y)

resize()

let last = null

function step(t) {
  exports.game_update((t - last) / 1000)
  last = t
  requestAnimationFrame(step)
}

function init(t) {
  exports.game_init()
  last = t
  requestAnimationFrame(step)
}

requestAnimationFrame(init)
