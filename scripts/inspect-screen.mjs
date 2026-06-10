import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'

const SCREEN_MAT = '4130c6244c49c5d5712e'

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS)
const doc = await io.read('src/assets/models/iphone_16.glb')
const root = doc.getRoot()

// Find the node that carries each mesh so we can read its world transform.
function findNodeForMesh(mesh) {
  for (const node of root.listNodes()) {
    if (node.getMesh() === mesh) return node
  }
  return null
}

function bounds(accessor, dims) {
  const min = new Array(dims).fill(Infinity)
  const max = new Array(dims).fill(-Infinity)
  const el = new Array(dims).fill(0)
  for (let i = 0; i < accessor.getCount(); i++) {
    accessor.getElement(i, el)
    for (let k = 0; k < dims; k++) {
      min[k] = Math.min(min[k], el[k])
      max[k] = Math.max(max[k], el[k])
    }
  }
  return { min, max }
}

const f = (n) => n.toFixed(3)

for (const mesh of root.listMeshes()) {
  for (const prim of mesh.listPrimitives()) {
    const mat = prim.getMaterial()
    if (mat?.getName() !== SCREEN_MAT) continue

    const pos = prim.getAttribute('POSITION')
    const uv = prim.getAttribute('TEXCOORD_0')
    const node = findNodeForMesh(mesh)
    const pb = bounds(pos, 3)

    console.log('=== SCREEN MESH FOUND ===')
    console.log('material :', mat.getName())
    console.log('node     :', node?.getName())
    console.log('node T/R/S:', node?.getTranslation(), node?.getRotation(), node?.getScale())
    console.log('verts    :', pos.getCount(), 'indices:', prim.getIndices()?.getCount())
    console.log(
      'LOCAL pos x[%s,%s] y[%s,%s] z[%s,%s]',
      f(pb.min[0]), f(pb.max[0]),
      f(pb.min[1]), f(pb.max[1]),
      f(pb.min[2]), f(pb.max[2]),
    )
    console.log(
      'LOCAL ranges  x=%s y=%s z=%s  (smallest = thickness/normal axis)',
      f(pb.max[0] - pb.min[0]),
      f(pb.max[1] - pb.min[1]),
      f(pb.max[2] - pb.min[2]),
    )
    if (uv) {
      const ub = bounds(uv, 2)
      console.log('UV u[%s,%s] v[%s,%s]', f(ub.min[0]), f(ub.max[0]), f(ub.min[1]), f(ub.max[1]))
    } else {
      console.log('UV       : none')
    }
  }
}
