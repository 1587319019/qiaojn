// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import router from './router';
// import {Button, Form, FormItem, Input, Card} from 'element-ui'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import VueSocketIO from 'vue-socket.io';
//socket.io插件
Vue.config.productionTip = false;

import './assets/styles/reset.css';
import './assets/styles/animate.css';
import './assets/styles/iconfont.css';
// import store from './store/store.js'
import store from './store/index.js';
import $ from 'jquery';

// Vue.use(Button)
// Vue.use(Form)
// Vue.use(FormItem)
// Vue.use(Input)
// Vue.use(Card)
Vue.use(ElementUI);
// Vue.use(
// 	new VueSocketIO({
// 		debug: true,
// 		// 服务器端地址
// 		connection: 'wss://101.132.66.50:6789/',
// 		vuex: {}
// 	})
// );
Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
	el: '#app',
	router,
	store,
	components: { App },
	template: '<App/>'
});
