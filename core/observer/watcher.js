
export default class Watcher {
    /**
     * 设置一个监听器，同时给 dep 的依赖列表添加一个默认值。
     * @param {Object} vm 监听对象
     * @param {String} expOrFn 具体对象属性的字符串， 如 vm.a.b.c --> 'a.b.c'
     * @param {Function} cb 监听的回调函数，传入两个参数 newVal、oldVal，this 指向 vm
     */
    constructor(vm, expOrFn, cb) {
        this.vm = vm
        // 获取最新的监听属性， this.getter 只是函数，调用后才能得到最新数据
        this.getter = parsePath(expOrFn)
        this.cb = cb
        // 这一步可以初始化 dep 中的默认依赖项
        this.value = this.get()
    }

    get() {
        // 将 this 赋值给 target
        window.target = this
        // 读取监听属性的最新数据，读取数据的同时，会触发一系列操作 getter --> dep.depend() --> depend 将 target 数据收集到依赖列表 
        let value = this.getter.call(this.vm, this.vm)
        // 读取、收集完数据，马上清空 target ，防止 dep.depend() 在没更新数据时收集依赖
        return value
    }

    update() {
        // 获取旧值
        const oldValue = this.value
        // 获取新值、并且收集最新依赖
        this.value = this.get()
        // 调用回调函数，将新、旧值传入函数，并将 this 绑定在 vm 上
        this.cb.call(this.vm, this.value, oldValue)
    }
}

/**
 * Parse simple path.
 */
const bailRE = /[^\w.$]/;
function parsePath(path) {
    if (bailRE.test(path)) return
    const segments = path.split('.');
    return function (obj) {
        for (let i = 0; i < segments.length; i++) {
            if (!obj) return
            obj = obj[segments[i]];
        }
        return obj
    }
}