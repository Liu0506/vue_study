(function () {
    'use strict';

    /**
     * 为每个属性创建一个依赖列表，
     * 依赖列表 subs 中存储的是 Watcher 创建的实例对象
     */
    class Dep {
        constructor() {
            this.subs = [];
        }

        addSub(sub) {
            this.subs.push(sub);
        }

        removeSub(sub) {
            remove(this.subs, sub);
        }

        // 收集 setter 中设置的属性，若没有设置属性，或属性相同，收集依赖便不执行（收集依赖）
        depend() {
            // 若有值，证明 setting 设置成功
            // window.target 相当于一个中转站，值变化了，中转站中才会有值，depend 才能把值添加到依赖列表
            if (window.target) {
                this.addSub(window.target);
            }
        }

        // 设置新属性时触发（setter）, 
        // watcher 实例化过程中，会给 window.target 添加一个默认依赖，收集到 this.subs 列表中，随后马上销毁 window.target 中的值
        // 若没有实例化 watcher，永远都调用不了 update 方法
        notify() {
            const subs = this.subs.slice();
            // 我自己的理解
            if (subs.length) {
                subs[subs.length - 1].update();
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
            const index = arr.indexOf(item);
            if (index > -1) {
                return arr.splice(index, 1)
            }
        }
    }

    /**
     * Observer 类给 Object 的每个属性设置侦测属性。
     * 一旦被附加上，Observer 会将 object 的所有属性转换为 getter/setter 的形式
     * 来收集属性的依赖，并且当属性发生变化时，会通知这些依赖
     * 调用方法 new Observer(obj) ,确定插入参数类型为对象
     * 
     * 步骤：遍历对象每个属性，如果是对象，用 defineProperty 添加侦测代码，如果值有子属性，递归子属性。
     */

    class Observer {
        constructor(value) {
            this.value = value;

            if (!Array.isArray(value)) {
                this.walk(value);
            }
        }

        /**
         * 遍历对象，为每一个属性设置 getter/setter 
         * @param {Object} obj 添加侦测代码的对象
         */
        walk(obj) {
            const keys = Object.keys(obj);
            for (let i = 0; i < keys.length; i++) {
                defineReactive(obj, keys[i], obj[keys[i]]);
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
            new Observer(val);
        }
        
        let dep = new Dep();
        Object.defineProperty(data, key, {
            enumerable: true,
            configurable: true,
            get: function () {
                dep.depend();
                return val
            },
            set: function (newVal) {
                if (val === newVal) return
                val = newVal;
                // 赋值成功后才触发，若提前触发，watcher 中取不到新值
                dep.notify();
            }
        });

    }

    class Watcher {
        /**
         * 设置一个监听器，同时给 dep 的依赖列表添加一个默认值。
         * @param {Object} vm 监听对象
         * @param {String} expOrFn 具体对象属性的字符串， 如 vm.a.b.c --> 'a.b.c'
         * @param {Function} cb 监听的回调函数，传入两个参数 newVal、oldVal，this 指向 vm
         */
        constructor(vm, expOrFn, cb) {
            this.vm = vm;
            // 获取最新的监听属性， this.getter 只是函数，调用后才能得到最新数据
            this.getter = parsePath(expOrFn);
            this.cb = cb;
            // 这一步可以初始化 dep 中的默认依赖项
            this.value = this.get();
        }

        get() {
            // 将 this 赋值给 target
            window.target = this;
            // 读取监听属性的最新数据，读取数据的同时，会触发一系列操作 getter --> dep.depend() --> depend 将 target 数据收集到依赖列表 
            let value = this.getter.call(this.vm, this.vm);
            // 读取、收集完数据，马上清空 target ，防止 dep.depend() 在没更新数据时收集依赖
            return value
        }

        update() {
            // 获取旧值
            const oldValue = this.value;
            // 获取新值、并且收集最新依赖
            this.value = this.get();
            // 调用回调函数，将新、旧值传入函数，并将 this 绑定在 vm 上
            this.cb.call(this.vm, this.value, oldValue);
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

    var obj = {
        a: 1
    };

    new Observer(obj);
    new Watcher(obj, 'a', (newValue, oldValue) => {
        console.log(newValue, oldValue);
    });

    obj.a = 123;

    window.obj = obj;

}());
