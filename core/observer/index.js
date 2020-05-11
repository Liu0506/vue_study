import Dep from './dep.js'
/**
 * Observer 类给 Object 的每个属性设置侦测属性。
 * 一旦被附加上，Observer 会将 object 的所有属性转换为 getter/setter 的形式
 * 来收集属性的依赖，并且当属性发生变化时，会通知这些依赖
 * 调用方法 new Observer(obj) ,确定插入参数类型为对象
 * 
 * 步骤：遍历对象每个属性，如果是对象，用 defineProperty 添加侦测代码，如果值有子属性，递归子属性。
 */

export default class Observer {
    constructor(value) {
        this.value = value

        if (!Array.isArray(value)) {
            this.walk(value)
        }
    }

    /**
     * 遍历对象，为每一个属性设置 getter/setter 
     * @param {Object} obj 添加侦测代码的对象
     */
    walk(obj) {
        const keys = Object.keys(obj)
        for (let i = 0; i < keys.length; i++) {
            defineReactive(obj, keys[i], obj[keys[i]])
        }
    }
}

/**
 * 添加监测代码
 * @param {Object} data 对象
 * @param {String}} key 对象的键
 * @param {Anything} val 对象值
 */
function defineReactive(data, key, val) {

    // 递归子对象
    if (typeof data === 'object') {
        new Observer(val)
    }
    
    let dep = new Dep()
    Object.defineProperty(data, key, {
        enumerable: true,
        configurable: true,
        get: function () {
            dep.depend()
            return val
        },
        set: function (newVal) {
            if (val === newVal) return
            val = newVal
            // 赋值成功后才触发，若提前触发，watcher 中取不到新值
            dep.notify()
        }
    })

}