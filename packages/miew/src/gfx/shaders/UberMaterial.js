/* eslint-disable no-magic-numbers */
/* eslint-disable guard-for-in */

import vertexShader from './Uber.vert'
import fragmentShader from './Uber.frag'
import capabilities from '../capabilities'
import noise from '../noiseTexture'
import {
  UniformsLib,
  UniformsUtils,
  Vector2,
  Color,
  Matrix4,
  RawShaderMaterial,
  DoubleSide,
  Material
} from 'three'

// Length of _samplesKernel is used in Uber.frag
// If you want to change length of _samplesKernel, please, remember change it in Uber.frag too.
// You can easy find places for replace using word:_samplesKernel
const _samplesKernel = [
  new Vector2(-0.541978, 0.840393),
  new Vector2(0.125533, -0.992089),
  new Vector2(0.374329, 0.927296),
  new Vector2(-0.105475, 0.994422)
]

const defaultUniforms = UniformsUtils.merge([
  UniformsLib.fog,
  UniformsLib.lights,

  {
    // are updated automatically by three.js (see ShaderLib.common)
    diffuse: { value: new Color(0xeeeeee) },
    opacity: { value: 1.0 },

    specular: { type: 'c', value: new Color(0x111111) },
    shininess: { type: 'f', value: 30 },
    fixedColor: { type: 'c', value: new Color(0xffffff) },
    zOffset: { type: 'f', value: 0.0 },
    zClipValue: { type: 'f', value: 0.0 },
    clipPlaneValue: { type: 'f', value: 0.0 },
    nearPlaneValue: { type: 'f', value: -0.5 },
    invModelViewMatrix: { type: '4fv', value: new Matrix4() },
    world2colorMatrix: { type: '4fv', value: new Matrix4() },
    dashedLineSize: { type: 'f', value: 0.1 },
    dashedLinePeriod: { type: 'f', value: 0.2 },
    projMatrixInv: { type: '4fv', value: new Matrix4() },
    viewport: { type: 'v2', value: new Vector2() },
    lineWidth: { type: 'f', value: 2.0 },
    // default value must be the same as settings
    fogAlpha: { type: 'f', value: 1.0 },
    samplesKernel: { type: 'v2v', value: null },
    noiseTex: { type: 't', value: null },
    noiseTexelSize: { type: 'v2', value: null },
    srcTexelSize: { type: 'v2', value: null }
  }
])

const uberOptionNames = [
  'shininess',
  'opacity',
  'zOffset',
  'diffuse',
  'specular',
  'fixedColor',
  'zClipCoef',
  'zClipValue',
  'clipPlaneValue',
  'world2colorMatrix',
  'dashedLineSize',
  'dashedLinePeriod',
  'projMatrixInv',
  'viewport',
  'lineWidth',
  'fogAlpha',
  'samplesKernel',
  'noiseTex',
  'noiseTexelSize',
  'srcTexelSize'
]

// properties that convert to uniforms
const uberOptions = {
  diffuse: new Color(0xffffff), // used in phong lighting
  specular: new Color(0x111111), // used in phong lighting
  shininess: 30, // used in phong lighting
  opacity: 1, // set mesh opacity
  fixedColor: new Color(0xffffff), // color to override (see OVERRIDE_COLOR)
  zOffset: 0.0, // used fo zsprites (see SPHERE_SPRITE CYLINDER_SPRITE)
  zClipCoef: 2.0, // use for Surfs clipping (mesh param, isn't used in shader)  FIXME move to representation param
  zClipValue: 0.0, //  value to clip Surfs in shader  (see ZCLIP)
  clipPlaneValue: 0.0, // value to clip scene globally (see CLIPPLANE)
  world2colorMatrix: new Matrix4(),
  dashedLineSize: 0.1,
  dashedLinePeriod: 0.3,
  projMatrixInv: new Matrix4(),
  viewport: new Vector2(800, 600),
  lineWidth: 2.0,
  fogAlpha: 1.0,
  samplesKernel: _samplesKernel,
  noiseTex: noise.noiseTexture,
  noiseTexelSize: new Vector2(1.0 / noise.noiseWidth, 1.0 / noise.noiseHeight),
  srcTexelSize: new Vector2(1.0 / 800.0, 1.0 / 600.0),

  copy(source) {
    this.diffuse.copy(source.diffuse)
    this.specular.copy(source.specular)
    this.shininess = source.shininess
    this.opacity = source.opacity
    this.fixedColor.copy(source.fixedColor)
    this.zOffset = source.zOffset
    this.zClipCoef = source.zClipCoef
    this.zClipValue = source.zClipValue
    this.clipPlaneValue = source.clipPlaneValue
    this.world2colorMatrix.copy(source.world2colorMatrix)
    this.dashedLineSize = source.dashedLineSize
    this.dashedLinePeriod = source.dashedLinePeriod
    this.projMatrixInv = source.projMatrixInv
    this.viewport = source.viewport
    this.lineWidth = source.lineWidth // used for thick lines only
    this.toonShading = source.toonShading
    this.fogAlpha = source.fogAlpha
    this.samplesKernel = source.samplesKernel
    this.noiseTex = source.noiseTex
    this.noiseTexelSize = source.noiseTexelSize
    this.srcTexelSize = source.srcTexelSize
  }
}

class UberMaterial extends RawShaderMaterial {
  constructor(params) {
    super()
    // add fog
    this.fog = true
    // used for instanced geometry
    this.instancedPos = false
    this.instancedMatrix = false
    // atoms and links color
    this.attrColor = false
    // second link color for cylinders
    this.attrColor2 = false
    //
    this.attrAlphaColor = false
    // overrides color for all vertices (used in selection)
    this.overrideColor = false
    // zsrpites
    this.sphereSprite = false
    this.cylinderSprite = false
    // clip Surfs individually
    this.zClip = false
    // clip scene with global clip plane
    this.clipPlane = false
    // enable fake (chess-like) opacity
    this.fakeOpacity = false
    // render only depth, don't take care about the pixel color (used for transparency depth prepass)
    this.prepassTransparancy = false
    // used to render pixel positions
    this.colorFromPos = false
    // used to render shadowmap
    this.shadowmap = false
    // used to describe shadowmap type
    this.shadowmapType = 'random'
    // used to render pixel view deph
    this.colorFromDepth = false
    // mark that rendering is for orthographic camera
    this.orthoCam = false
    // used to render dashed line
    this.dashedLine = false
    // mark as transparent
    this.transparent = true
    // mark as thick lines
    this.thickLine = false
    // makes fog begin transparency (required for transparent background)
    this.fogTransparent = false
    // used to render surface normals to G buffer for ssao effect
    this.normalsToGBuffer = false
    // used for toon material
    this.toonShading = false
    // uber options of "root" materials are inherited from single uber-options object that resides in prototype
    this.uberOptions = Object.create(uberOptions)
    // set default values
    super.setValues({
      uniforms: UniformsUtils.clone(defaultUniforms),
      vertexShader: this.precisionString() + vertexShader,
      fragmentShader: this.precisionString() + fragmentShader,
      lights: true,
      fog: true,
      side: DoubleSide
    })

    this.setValues(params)
  }

  precisionString() {
    const { precision } = capabilities
    const str =
      `precision ${precision} float;\n` + `precision ${precision} int;\n\n`
    return str
  }

  // create copy of this material
  copy(source) {
    super.copy(source)

    this.fragmentShader = source.fragmentShader
    this.vertexShader = source.vertexShader

    this.uniforms = UniformsUtils.clone(source.uniforms)
    this.defines = { ...source.defines }
    this.extensions = source.extensions

    this.fog = source.fog
    this.instancedPos = source.instancedPos
    this.instancedMatrix = source.instancedMatrix
    this.attrColor = source.attrColor
    this.attrColor2 = source.attrColor2
    this.attrAlphaColor = source.attrAlphaColor
    this.overrideColor = source.overrideColor
    this.sphereSprite = source.sphereSprite
    this.cylinderSprite = source.cylinderSprite
    this.zClip = source.zClip
    this.clipPlane = source.clipPlane
    this.fakeOpacity = source.fakeOpacity
    this.colorFromPos = source.colorFromPos
    this.shadowmap = source.shadowmap
    this.shadowmapType = source.shadowmapType
    this.colorFromDepth = source.colorFromDepth
    this.orthoCam = source.orthoCam
    this.prepassTransparancy = source.prepassTransparancy
    this.dashedLine = source.dashedLine
    this.thickLine = source.thickLine
    this.fogTransparent = source.fogTransparent
    this.normalsToGBuffer = source.normalsToGBuffer
    this.toonShading = source.toonShading

    this.uberOptions.copy(source.uberOptions)

    return this
  }

  // create copy of this material
  // its options are prototyped after this material's options
  createInstance() {
    const inst = new UberMaterial()
    inst.copy(this)
    inst.uberOptions = Object.create(this.uberOptions)
    return inst
  }

  setValues(values) {
    if (typeof values === 'undefined') {
      return
    }

    // set direct values
    super.setValues(values)

    const defines = {}
    const extensions = {}

    if (this.fog) {
      defines.USE_FOG = 1
    }
    if (this.instancedPos) {
      defines.INSTANCED_POS = 1
    }
    if (this.instancedMatrix) {
      defines.INSTANCED_MATRIX = 1
    }
    if (this.attrColor) {
      defines.ATTR_COLOR = 1
    }
    if (this.attrColor2) {
      defines.ATTR_COLOR2 = 1
    }
    if (this.attrAlphaColor) {
      defines.ATTR_ALPHA_COLOR = 1
    }
    if (this.overrideColor) {
      defines.OVERRIDE_COLOR = 1
    }
    if (this.sphereSprite) {
      defines.SPHERE_SPRITE = 1
      extensions.fragDepth = 1
    }
    if (this.cylinderSprite) {
      defines.CYLINDER_SPRITE = 1
      extensions.fragDepth = 1
    }
    if (this.zClip) {
      defines.ZCLIP = 1
    }
    if (this.clipPlane) {
      defines.CLIP_PLANE = 1
    }
    if (this.fakeOpacity) {
      defines.FAKE_OPACITY = 1
    }
    if (this.lights) {
      defines.USE_LIGHTS = 1
    }
    if (this.colorFromPos) {
      defines.COLOR_FROM_POS = 1
    }
    if (this.shadowmap) {
      defines.SHADOWMAP = 1
      if (this.shadowmapType === 'pcf') {
        defines.SHADOWMAP_PCF_SHARP = 1
      } else if (this.shadowmapType === 'random') {
        defines.SHADOWMAP_PCF_RAND = 1
      } else {
        defines.SHADOWMAP_BASIC = 1
      }
    }
    if (this.colorFromDepth) {
      defines.COLOR_FROM_DEPTH = 1
    }
    if (this.orthoCam) {
      defines.ORTHOGRAPHIC_CAMERA = 1
    }
    if (this.prepassTransparancy) {
      defines.PREPASS_TRANSP = 1
    }
    if (this.dashedLine) {
      defines.DASHED_LINE = 1
    }
    if (this.thickLine) {
      defines.THICK_LINE = 1
    }
    if (this.fogTransparent) {
      defines.FOG_TRANSPARENT = 1
    }
    if (this.normalsToGBuffer) {
      extensions.drawBuffers = 1
      defines.NORMALS_TO_G_BUFFER = 1
    }
    if (this.toonShading) {
      defines.TOON_SHADING = 1
    }
    // set dependent values
    this.defines = defines
    this.extensions = extensions
  }

  setUberOptions(values) {
    if (typeof values === 'undefined') {
      return
    }

    for (const key in values) {
      if (!Object.hasOwn(values, key)) {
        continue
      }

      if (this.uberOptions[key] instanceof Color) {
        this.uberOptions[key] = values[key].clone()
      } else {
        this.uberOptions[key] = values[key]
      }
    }
  }

  clone(shallow) {
    if (!shallow) {
      return Material.prototype.clone.call(this)
    }
    return this.createInstance()
  }

  updateUniforms() {
    const self = this

    uberOptionNames.forEach((p) => {
      if (Object.hasOwn(self.uniforms, p)) {
        if (
          self.uberOptions[p] instanceof Color ||
          self.uberOptions[p] instanceof Matrix4
        ) {
          self.uniforms[p].value = self.uberOptions[p].clone()
        } else {
          self.uniforms[p].value = self.uberOptions[p]
        }
      }
    })
  }
}

UberMaterial.prototype.uberOptions = uberOptions

export default UberMaterial
