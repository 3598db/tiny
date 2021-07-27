class Chunk {
  constructor(entryModule) {
    this.entryModule = entryModule;
    this.name = entryModule.name;
    this.files = []; // 记录每个chunk中文件信息
    this.module = []; // 记录每个chunk中所包含的module
  }
}

module.exports = Chunk;
