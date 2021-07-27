const {
  Tapable,
  SyncHook,
  SyncBailHook,
  AsyncSeriesHook,
  AsyncParallelHook,
} = require("tapable");
const path = require("path");
const mkdirp = require("mkdirp");
const NormalModuleFactory = require("./NormalModuleFactory");
const Compilation = require("./Compilation");
const Stats = require("./Stats");

class Compiler extends Tapable {
  constructor(context) {
    super();
    this.context = context;
    this.hooks = {
      done: new AsyncSeriesHook(["stats"]),
      entryOption: new SyncBailHook(["context", "entry"]),

      beforeRun: new AsyncSeriesHook(["compiler"]),
      run: new AsyncSeriesHook(["compiler"]),

      thisCompilation: new SyncHook(["compilation", "params"]),
      compilation: new SyncHook(["compilation", "params"]),

      beforeCompile: new AsyncSeriesHook(["params"]),
      compile: new SyncHook(["params"]),
      make: new AsyncParallelHook(["compilation"]),
      afterCompile: new AsyncSeriesHook(["compilation"]),
      emit: new AsyncSeriesHook(["compilation"]),
    };
  }

  emitAssets(compilation, callback) {
    // 当前需要做的核心，01 创建dist 02 在目录创建完成之后执行文件的写操作

    // 01 定义一个工具方法用于执行文件的生成工作
    const emitFiles = (err) => {
      const assets = compilation.assets;
      let outputPath = this.options.output.path;
      for (let file in assets) {
        let source = assets[file];
        let targetPath = path.posix.join(outputPath, file);
        this.outputFileSystem.writeFileSync(targetPath, source, "utf8");
      }
      callback(err);
    };

    // 创建目录之后启动文件写入
    this.hooks.emit.callAsync(compilation, (err) => {
      mkdirp.sync(this.options.output.path);
      emitFiles();
    });
  }

  run(callback) {
    const finalCallback = function (err, stats) {
      callback(err, stats);
    };

    const onCompiled = (err, compilation) => {
      // 最终在这里将处理好的chunks写入到指定的文件然后输出值dist
      this.emitAssets(compilation, () => {
        let stats = new Stats(compilation);
        finalCallback(err, stats);
      });
    };

    this.hooks.beforeRun.callAsync(this, (err) => {
      this.hooks.run.callAsync(this, (err) => {
        this.compile(onCompiled);
      });
    });
  }

  compile(callback) {
    const params = this.newCompilationParams();
    this.hooks.beforeRun.callAsync(params, (error) => {
      this.hooks.compile.call(params);
      const compilation = this.newCompilation(params);
      this.hooks.make.callAsync(compilation, (err) => {
        // 在这里我们开始处理chunk
        compilation.seal((err) => {
          this.hooks.afterCompile.callAsync(compilation, (err) => {
            callback(err, compilation);
          });
        });
      });
    });
  }

  newCompilationParams() {
    const parmas = {
      normalModuleFactory: new NormalModuleFactory(),
    };

    return parmas;
  }

  newCompilation(parmas) {
    const compilation = this.createCompilation();
    this.hooks.thisCompilation.call(compilation, parmas);
    this.hooks.compilation.call(compilation, parmas);
    return compilation;
  }

  createCompilation() {
    return new Compilation(this);
  }
}

module.exports = Compiler;
