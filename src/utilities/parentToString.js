export default function parentToString(parent) {
  let parentStr = ''
  parent.forEach((parentKey, index) => {
    parentStr += parentKey
    if (index > 0) {
      parentStr += '.'
    }
  })
  return parentStr
}