/**
 * 为每个属性创建一个依赖列表，
 * 依赖列表 subs 中存储的是 Watcher 创建的实例对象
 */
export default class Dep {
    constructor() {
        this.subs = []
    }

    addSub(sub) {
        this.subs.push(sub)
    }

    removeSub(sub) {
        remove(this.subs, sub)
    }

    // 收集 setter 中设置的属性，若没有设置属性，或属性相同，收集依赖便不执行（收集依赖）
    depend() {
        // 若有值，证明 setting 设置成功
        // window.target 相当于一个中转站，值变化了，中转站中才会有值，depend 才能把值添加到依赖列表
        if (window.target) {
            this.addSub(window.target)
        }
    }

    // 设置新属性时触发（setter）, 
    // watcher 实例化过程中，会给 window.target 添加一个默认依赖，收集到 this.subs 列表中，随后马上销毁 window.target 中的值
    // 若没有实例化 watcher，永远都调用不了 update 方法
    notify() {
        const subs = this.subs.slice()
        // 我自己的理解
        if (subs.length) {
            subs[subs.length - 1].update()
        }
        // // 深入浅出 nodejs 中所写
        // for (let i = 0, l = subs.length; i < l; i++) {
        //     subs[i].update()
        // }
    }
}

/**
 * 从依赖列表删除匹配项
 * @param {Array} arr 收集的依赖
 * @param {Anything} item 需要删除的依赖
 */
function remove(arr, item) {
    if (arr.length) {
        const index = arr.indexOf(item)
        if (index > -1) {
            return arr.splice(index, 1)
        }
    }
}