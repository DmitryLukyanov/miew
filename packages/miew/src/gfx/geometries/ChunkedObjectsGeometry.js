import utils from '../../utils'
import { BufferAttribute, BufferGeometry, Color, Mesh } from 'three'
import { fill } from 'lodash'

const MAX_IDC_16BIT = 65535
const VEC_SIZE = 3
const tmpColor = new Color()

/**
 * This class represents geometry which consists of separate chunks.
 * Each chunk has same index and similar geometry with equal points and faces count.
 * Each chunk has by default only one color.
 * @constructor
 */

class ChunkedObjectsGeometry extends BufferGeometry {
  constructor(chunkGeo, chunksCount) {
    super()

    if (this.constructor === ChunkedObjectsGeometry) {
      throw new Error('Can not instantiate abstract class!')
    }

    this._chunkGeo = chunkGeo

    this._init(chunkGeo, chunksCount)
  }

  startUpdate() {
    return true
  }

  finishUpdate() {
    this.getAttribute('position').needsUpdate = true
    this.getAttribute('normal').needsUpdate = true
    this.getAttribute('color').needsUpdate = true
  }

  setColor(chunkIdx, colorVal) {
    tmpColor.set(colorVal)
    const colors = this._colors
    const chunkSize = this._chunkSize
    for (let i = chunkIdx * chunkSize, end = i + chunkSize; i < end; ++i) {
      const idx = i * VEC_SIZE
      colors[idx] = tmpColor.r
      colors[idx + 1] = tmpColor.g
      colors[idx + 2] = tmpColor.b
    }
  }

  finalize() {
    this.finishUpdate()
    this.computeBoundingSphere()
  }

  setOpacity(chunkIndices, value) {
    const alphaArr = this._alpha
    const chunkSize = this._chunkSize
    for (let i = 0, n = chunkIndices.length; i < n; ++i) {
      const left = chunkIndices[i] * chunkSize
      fill(alphaArr, value, left, left + chunkSize)
    }
    this.getAttribute('alphaColor').needsUpdate = true
  }

  raycast(raycaster, intersects) {
    const inters = []
    const mesh = new Mesh()
    mesh.geometry = this
    mesh.raycast(raycaster, inters)
    const facesPerChunk = this._chunkGeo.index.count / 3
    for (let i = 0, n = inters.length; i < n; ++i) {
      if (!Object.hasOwn(inters[i], 'faceIndex')) {
        continue
      }
      inters[i].chunkIdx = Math.floor(inters[i].faceIndex / facesPerChunk)
      intersects.push(inters[i])
    }
  }

  getSubset(chunkIndices) {
    const instanceCount = chunkIndices.length
    const geom = new BufferGeometry()
    this._init.call(geom, this._chunkGeo, instanceCount)

    const srcPos = this._positions
    const srcNorm = this._normals
    const srcColor = this._colors

    const dstPos = geom._positions
    const dstNorm = geom._normals
    const dstColor = geom._colors

    const chunkSize = this._chunkSize * VEC_SIZE

    for (let i = 0, n = chunkIndices.length; i < n; ++i) {
      const dstPtOffset = i * chunkSize
      const ptIdxBegin = chunkIndices[i] * chunkSize
      const ptIdxEnd = ptIdxBegin + chunkSize
      dstPos.set(srcPos.subarray(ptIdxBegin, ptIdxEnd), dstPtOffset)
      dstNorm.set(srcNorm.subarray(ptIdxBegin, ptIdxEnd), dstPtOffset)
      dstColor.set(srcColor.subarray(ptIdxBegin, ptIdxEnd), dstPtOffset)
    }

    geom.boundingSphere = this.boundingSphere
    geom.boundingBox = this.boundingBox
    return [geom]
  }

  _init(chunkGeo, chunksCount) {
    const chunkSize = (this._chunkSize = chunkGeo.attributes.position.count)
    const chunkIndex = chunkGeo.index.array
    const chunkIndexSize = chunkIndex.length
    const pointsCount = this._chunkSize * chunksCount
    const use32bitIndex = pointsCount > MAX_IDC_16BIT
    const indexSize = chunkIndexSize * chunksCount
    const index = (this._index = utils.allocateTyped(
      use32bitIndex ? Uint32Array : Uint16Array,
      indexSize
    ))
    this._positions = utils.allocateTyped(Float32Array, pointsCount * VEC_SIZE)
    this._normals = utils.allocateTyped(Float32Array, pointsCount * VEC_SIZE)
    this._colors = utils.allocateTyped(Float32Array, pointsCount * VEC_SIZE)
    const alpha = (this._alpha = utils.allocateTyped(Float32Array, pointsCount))
    fill(alpha, 1.0)

    for (let i = 0; i < chunksCount; ++i) {
      const offset = i * chunkIndexSize
      const posOffset = i * chunkSize
      index.set(chunkIndex, offset)
      for (let j = 0; j < chunkIndexSize; ++j) {
        index[offset + j] += posOffset
      }
    }

    this.setIndex(new BufferAttribute(this._index, 1))
    this.setAttribute(
      'position',
      new BufferAttribute(this._positions, VEC_SIZE)
    )
    this.setAttribute('normal', new BufferAttribute(this._normals, VEC_SIZE))
    this.setAttribute('color', new BufferAttribute(this._colors, VEC_SIZE))
    this.setAttribute('alphaColor', new BufferAttribute(alpha, 1))
  }
}
export default ChunkedObjectsGeometry
