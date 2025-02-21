import BaseLinesGeometry from './ThickLinesGeometry'
import { Box3, Sphere, Vector3 } from 'three'

/**
 * This class represents geometry which consists lines. This can build bounding volumes
 * @constructor
 *
 * @param {number}  segmentsCount   Number of segments per chunk.
 */
class LinesGeometry extends BaseLinesGeometry {
  startUpdate() {
    return true
  }

  computeBoundingSphere() {
    const { boundingBox } = this
    // Build bounding sphere
    let radiusSquared = 0.0
    const center = new Vector3()
    if (boundingBox) {
      boundingBox.getCenter(center)
    }
    const positions = this._positions
    const sphere = this.boundingSphere || new Sphere()
    const size = this._positions.length
    const pos = new Vector3()
    const posSize = this.getPositionSize()
    for (let i = 0; i < size; i += posSize) {
      pos.set(positions[i], positions[i + 1], positions[i + 2])
      const lengthSquared = center.distanceToSquared(pos)
      if (radiusSquared < lengthSquared) {
        radiusSquared = lengthSquared
      }
    }
    sphere.set(center, Math.sqrt(radiusSquared))
    this.boundingSphere = sphere
  }

  computeBoundingBox() {
    const positions = this._positions
    const box = new Box3()
    const size = this._positions.length
    const tmpVec = new Vector3()
    const posSize = this.getPositionSize()
    for (let i = 0; i < size; i += posSize) {
      tmpVec.set(positions[i], positions[i + 1], positions[i + 2])
      box.expandByPoint(tmpVec)
    }
    this.boundingBox = box
  }

  finalize() {
    this.finishUpdate()
    this.computeBoundingSphere()
  }
}

export default LinesGeometry
