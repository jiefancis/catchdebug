# 前端异常监控的核心原理

## 监控异常的分类
   1. js运行时异常
   2. 静态资源加载异常（img script link等）
   3. promise未处理的异常（未使用catch捕获）
   4. 接口异常

## 如何捕获异常
   1. js运行时异常
      window.onerror和window.addEventListener('error',e=>{})均可用来获取js异常，其中addEventListener('error',callback)优先级高于onerror。但在Vue项目中这两个是无法捕获到js的异常。另一个兼容方案是：重写Vue本身的异常捕获的api：Vue.config.errorHandler。具体代码实现看report-core.js文件。

   2. 静态资源加载异常
      window.addEventListener('error',callback)可以捕获除了js运行时异常外的其它静态资源加载异常。例如在页面中插入一个img标签，使其指向一个错误的地址，在页面渲染后，这个事件会触发。

   3. promise未捕获的异常
      window.addEventListener('unhandledrejection', e => {})可以捕获一切promise实例未catch的异常。这个捕获比较简单。

   4. 接口异常的监控
      现在市面上使用的大多数前后端数据交流的库axios fetch都是基于XMLHttpRequest对象进行封装（不考虑兼容IE）。考虑到sdk的侵入式接入，可以通过重写XMLHttpRequest这个函数所有api，在对应的api执行前插入捕获逻辑。
      report-core.js文件中的实现：ajaxEventTrigger函数接受函数名参数：eventName，创建一个自定义函数并由window来触发这个函数。newXHR函数的作用是重写window.XMLHttpRequest；newXHR()函数中，通过对XMLHttpRequest实例进行api层面的重写，oldXMLHttpRequest创建的实例通过addEventListener的方式绑定original原生XMLHttpRequest的所有api，回调触发自定义事件。