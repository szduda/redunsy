export const sumRelativeParentOffset = (element: HTMLElement) => {
  let top = 0
  let left = 0
  let node: HTMLElement | null = element

  while (node) {
    top += node.offsetTop
    left += node.offsetLeft
    node = node.offsetParent as HTMLElement | null
  }

  return { top, left }
}
