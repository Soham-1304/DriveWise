/**
 * Trie (Prefix Tree) for Location Autocomplete
 * 
 * Data Structure: Trie / Prefix Tree
 * Time Complexity:
 *   - insert: O(m) where m = word length
 *   - search: O(m)
 *   - autocomplete: O(m + n) where n = number of results
 * Space Complexity: O(alphabet_size * m * n)
 * 
 * Use Case: Fast autocomplete for origin/destination search
 */

class TrieNode {
  constructor() {
    this.children = {};
    this.isEndOfWord = false;
    this.data = null; // Store location data (coordinates, etc.)
  }
}

export class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  /**
   * Insert a location into the trie
   * @param {String} word - Location name
   * @param {Object} data - Location data { lat, lng, name, type }
   */
  insert(word, data) {
    let node = this.root;
    const lowerWord = word.toLowerCase();

    for (const char of lowerWord) {
      if (!node.children[char]) {
        node.children[char] = new TrieNode();
      }
      node = node.children[char];
    }

    node.isEndOfWord = true;
    node.data = data;
  }

  /**
   * Search for exact match
   * @param {String} word - Search term
   * @returns {Object|null} Location data if found
   */
  search(word) {
    let node = this.root;
    const lowerWord = word.toLowerCase();

    for (const char of lowerWord) {
      if (!node.children[char]) return null;
      node = node.children[char];
    }

    return node.isEndOfWord ? node.data : null;
  }

  /**
   * Get all words with given prefix
   * @param {String} prefix - Search prefix
   * @param {Number} maxResults - Maximum results to return
   * @returns {Array} Array of location data
   */
  autocomplete(prefix, maxResults = 10) {
    const results = [];
    const lowerPrefix = prefix.toLowerCase();
    let node = this.root;

    // Navigate to prefix node
    for (const char of lowerPrefix) {
      if (!node.children[char]) return results;
      node = node.children[char];
    }

    // DFS to collect all words with this prefix
    this._collectWords(node, lowerPrefix, results, maxResults);
    return results;
  }

  /**
   * Helper: DFS to collect words
   */
  _collectWords(node, currentWord, results, maxResults) {
    if (results.length >= maxResults) return;

    if (node.isEndOfWord) {
      results.push(node.data);
    }

    for (const char in node.children) {
      this._collectWords(
        node.children[char],
        currentWord + char,
        results,
        maxResults
      );
    }
  }

  /**
   * Check if prefix exists
   * @param {String} prefix
   * @returns {Boolean}
   */
  startsWith(prefix) {
    let node = this.root;
    const lowerPrefix = prefix.toLowerCase();

    for (const char of lowerPrefix) {
      if (!node.children[char]) return false;
      node = node.children[char];
    }

    return true;
  }
}

/**
 * Build location trie from array of locations
 * @param {Array} locations - Array of { name, lat, lng, ... }
 * @returns {Trie}
 */
export function buildLocationTrie(locations) {
  const trie = new Trie();

  for (const location of locations) {
    trie.insert(location.name, {
      name: location.name,
      lat: location.lat,
      lng: location.lng,
      type: location.type || 'location'
    });

    // Also insert by aliases if available
    if (location.aliases) {
      for (const alias of location.aliases) {
        trie.insert(alias, {
          name: location.name,
          lat: location.lat,
          lng: location.lng,
          type: location.type || 'location'
        });
      }
    }
  }

  return trie;
}

// Sample Indian cities and landmarks for demo
export const INDIAN_LOCATIONS = [
  { name: 'Mumbai CST', lat: 18.9401, lng: 72.8352, type: 'landmark' },
  { name: 'Gateway of India', lat: 18.9220, lng: 72.8347, type: 'landmark' },
  { name: 'Delhi Red Fort', lat: 28.6562, lng: 77.2410, type: 'landmark' },
  { name: 'India Gate Delhi', lat: 28.6129, lng: 77.2295, type: 'landmark' },
  { name: 'Bangalore MG Road', lat: 12.9716, lng: 77.5946, type: 'location' },
  { name: 'Pune Shivaji Nagar', lat: 18.5204, lng: 73.8567, type: 'location' },
  { name: 'Chennai Marina Beach', lat: 13.0500, lng: 80.2824, type: 'landmark' },
  { name: 'Kolkata Victoria Memorial', lat: 22.5448, lng: 88.3426, type: 'landmark' },
  { name: 'Hyderabad Charminar', lat: 17.3616, lng: 78.4747, type: 'landmark' },
  { name: 'Jaipur Hawa Mahal', lat: 26.9239, lng: 75.8267, type: 'landmark' }
];
