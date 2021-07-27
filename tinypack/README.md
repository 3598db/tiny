- WebpackOptionsApply
- process(options, compiler)
- EntryOptionPlugin
- entryOption: 是一个钩子实例
- entryOption 在 EntryOptionPlugin 内部的 apply 方法中调用 tap （注册了事件监听）
- 上述的事件监听在 new 完了 EntryOptionPlugin 之后就调用了
itemToPlugin，它是一个函数，接收三个参数（context item man）
- SingleEntryPlugin在调用itemToPlugin，的时候返回了一个实例对象
有一个构造函数，负责接收上文中的context entry name
compilation 钩子监听 make钩子监听
