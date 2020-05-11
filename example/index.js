import Observer from '../core/observer/index.js';
import Watcher from '../core/observer/watcher.js';

var obj = {
    a: 1
}

new Observer(obj)
new Watcher(obj, 'a', (newValue, oldValue) => {
    console.log(newValue, oldValue);
})

obj.a = 123

window.obj = obj