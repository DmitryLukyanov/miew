/* eslint-disable no-magic-numbers */
/* eslint-disable guard-for-in */

import vertexShader from './ScreenQuad.vert'
import fragmentShader from './AOVertBlurWithBlend.frag'
import { Matrix4, RawShaderMaterial, Vector2, Vector4 } from 'three'

const _kernelOffsets = [-2.0, -1.0, 0.0, 1.0, 2.0]

class AOVertBlurWithBlendMaterial extends RawShaderMaterial {
  constructor(params) {
    super(params)

    // set default values
    this.setValues({
      uniforms: {
        diffuseTexture: { type: 't', value: null },
        depthTexture: { type: 't', value: null },
        srcTexelSize: {
          type: 'v2',
          value: new Vector2(1.0 / 512.0, 1.0 / 512.0)
        },
        aoMap: { type: 't', value: null },
        samplesOffsets: { type: 'fv1', value: _kernelOffsets },
        projMatrix: { type: 'mat4', value: new Matrix4() },
        aspectRatio: { type: 'f', value: 0.0 },
        tanHalfFOV: { type: 'f', value: 0.0 },
        fogNearFar: { type: 'v2', value: new Vector2(100.0, 100.0) },
        fogColor: { type: 'v4', value: new Vector4(0.0, 0.5, 0.0, 1.0) }
      },
      vertexShader,
      fragmentShader,
      transparent: false,
      depthTest: false,
      depthWrite: false
    })

    this.setValues(params)
  }

  setValues(values) {
    if (typeof values === 'undefined') {
      return
    }

    // set direct values
    super.setValues(values)

    const defines = {}

    if (this.useFog) {
      defines.USE_FOG = 1
    }
    if (this.fogTransparent) {
      defines.FOG_TRANSPARENT = 1
    }
    // set dependent values
    this.defines = defines
  }
}

AOVertBlurWithBlendMaterial.prototype.useFog = true
AOVertBlurWithBlendMaterial.prototype.fogTransparent = false

export default AOVertBlurWithBlendMaterial
