class Stats {
  constructor(compilation, err) {
    this.entries = compilation.entries;
    this.modules = compilation.modules;
    this.chunks = compilation.chunks;
    this.files = compilation.files;
  }

  toJson() {
    return this;
  }
}

module.exports = Stats;
