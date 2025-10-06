/**
 * Min-Heap Priority Queue Implementation
 * 
 * Data Structure: Binary Min-Heap
 * Time Complexity:
 *   - insert: O(log n)
 *   - extractMin: O(log n)
 *   - peek: O(1)
 * Space Complexity: O(n)
 * 
 * Used in: Dijkstra's Algorithm, A* Search
 */

class PriorityQueue {
  constructor() {
    this.heap = [];
  }

  // Get parent index
  parent(i) {
    return Math.floor((i - 1) / 2);
  }

  // Get left child index
  leftChild(i) {
    return 2 * i + 1;
  }

  // Get right child index
  rightChild(i) {
    return 2 * i + 2;
  }

  // Swap two elements
  swap(i, j) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  // Insert element with priority
  insert(element, priority) {
    const node = { element, priority };
    this.heap.push(node);
    this.bubbleUp(this.heap.length - 1);
  }

  // Bubble up to maintain heap property
  bubbleUp(index) {
    while (index > 0) {
      const parentIdx = this.parent(index);
      if (this.heap[parentIdx].priority <= this.heap[index].priority) break;
      this.swap(parentIdx, index);
      index = parentIdx;
    }
  }

  // Extract minimum element
  extractMin() {
    if (this.isEmpty()) return null;
    if (this.heap.length === 1) return this.heap.pop();

    const min = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.bubbleDown(0);
    return min;
  }

  // Bubble down to maintain heap property
  bubbleDown(index) {
    while (true) {
      const left = this.leftChild(index);
      const right = this.rightChild(index);
      let smallest = index;

      if (left < this.heap.length && this.heap[left].priority < this.heap[smallest].priority) {
        smallest = left;
      }
      if (right < this.heap.length && this.heap[right].priority < this.heap[smallest].priority) {
        smallest = right;
      }
      if (smallest === index) break;

      this.swap(index, smallest);
      index = smallest;
    }
  }

  // Peek at minimum without removing
  peek() {
    return this.isEmpty() ? null : this.heap[0];
  }

  // Check if empty
  isEmpty() {
    return this.heap.length === 0;
  }

  // Get size
  size() {
    return this.heap.length;
  }
}

export default PriorityQueue;
