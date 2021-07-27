const { Tapable, SyncHook } = require("tapable");
const Chunk = require("./Chunk");
const NormalModuleFactory = require("./NormalModuleFactory");
const Parser = require("./Parser");
const path = require("path");
const async = require("neo-async");
const ejs = require("ejs");

const normalModuleFactory = new NormalModuleFactory();
const parser = new Parser();

class Compilation extends Tapable {
  constructor(compiler) {
    super();

    this.compiler = compiler;
    this.context = compiler.context;
    this.options = compiler.options;
    // 让compilation具备文件的读写能力
    this.inputFileSystem = compiler.inputFileSystem;
    this.outputFileSystem = compiler.outputFileSystem;
    this.entries = []; // 存放所有入口模块的数组
    this.modules = []; // 存放所有的模块数据
    this.chunks = []; // 存放当前次打包过程中所产生的chunk
    this.files = [];
    this.assets = [];
    this.hooks = {
      succeedModule: new SyncHook(["module"]),
      seal: new SyncHook(),
      beforeChunks: new SyncHook(),
      afterChunks: new SyncHook(),
    };
  }

  /**
   * 完成模块编译操作
   *
   * @param {*} context 当前项目的根
   * @param {*} entry 当前的入口的相对路径
   * @param {*} name chunkName main
   * @param {*} callback 回调
   */
  addEntry(context, entry, name, callback) {
    this._addModuleChain(context, entry, name, (err, module) => {
      callback(err, module);
    });
  }

  _addModuleChain(context, entry, name, callback) {
    this.createModule(
      {
        parser,
        name: name,
        context: context,
        rawRequest: entry,
        resource: path.posix.join(context, entry),
        moduleId: "./" + path.posix.relative(context, entry),
      },
      (entryModule) => {
        this.entries.push(entryModule);
      },
      callback
    );
  }

  // 定义一个创建模块的方法，达到复用的目的
  // @params data 创建模块时需要的一些属性值
  // @params doAddEntry 可选参数 在加载入口模块的时候，将入口模块的id写入 this.entries
  // @params callback
  createModule(data, doAddEntry, callback) {
    let module = normalModuleFactory.create(data);

    const afterBuild = (err, module) => {
      // 在afterBuild当中我们需要判断一下 当前module加载完成之后是否需要处理依赖加载
      if (module.dependencies.length > 0) {
        this.processDependencies(module, (err) => {
          callback(err, module);
        });
      } else {
        callback(err, module);
      }
    };

    this.buildModule(module, afterBuild);

    // 当我们完成了本地的build之后 将module进行保留
    doAddEntry && doAddEntry(module);
    this.modules.push(module);
  }

  buildModule(module, callback) {
    module.build(this, (err) => {
      // 如果代码走到这里就意味着module的编译完成了
      this.hooks.succeedModule.call(module);
      callback(err, module);
    });
  }

  processDependencies(module, callback) {
    // 01 当前的函数核心功能是实现一个被依赖模块的递归加载
    // 02 加载模块的思想都是创建一个模块，然后想办法将被加载模块的内容拿进来
    // 03 当前我们不知道module需要依赖几个模块 此时我们需要想办法让所有的被依赖模块都加在完成之后再执行callback

    let dependencies = module.dependencies;

    async.forEach(
      dependencies,
      (dependency, done) => {
        this.createModule(
          {
            parser,
            name: dependency.name,
            context: dependency.context,
            rawRequest: dependency.rawRequest,
            moduleId: dependency.moduleId,
            resource: dependency.resource,
          },
          null,
          done
        );
      },
      callback
    );
  }

  seal(callback) {
    this.hooks.seal.call();
    this.hooks.beforeChunks.call();

    // 01 当前所有的入口模块都被放在了compilation对象的entries数组里
    // 02 所谓封装chunk指的就是依据某个入口，然后找到他所有的依赖将他们的源代码放在一起，之后再做合并

    for (const entryModule of this.entries) {
      // 核心：创建模块加载已有模块的内容，同时记录模块信息
      const chunk = new Chunk(entryModule);

      this.chunks.push(chunk);

      // 给chunk属性赋值
      chunk.modules = this.modules.filter((module) => {
        return module.name === chunk.name;
      });
    }

    // chunk流程梳理之后就进入chunk代码处理环节（模板文件 + 模块中源代码 -> chunk.js）
    this.hooks.afterChunks.call(this.chunks);

    // 生成代码内容
    this.createChunkAssets();

    callback();
  }

  createChunkAssets() {
    for (let i = 0; i < this.chunks.length; i++) {
      const chunk = this.chunks[i];
      const fileName = chunk.name + ".js";
      chunk.files.push(fileName);

      // 01 获取模板文件的路径
      let tempPath = path.posix.join(__dirname, "temp/main.ejs");
      // 02 读取模块文件中内容
      let tempCode = this.inputFileSystem.readFileSync(tempPath, "utf8");
      // 03 获取渲染函数
      let tempRender = ejs.compile(tempCode);
      // 04 按ejs的语法渲染数据
      let source = tempRender({
        entryModuleId: chunk.entryModule.moduleId,
        modules: chunk.modules,
      });
      // 输出文件
      this.emitAssets(fileName, source);
    }
  }

  emitAssets(fileName, source) {
    this.assets[fileName] = source;
    this.files.push(fileName);
  }
}

module.exports = Compilation;
