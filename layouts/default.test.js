/* eslint-env jest */

import '~/plugins/vuetify.js';
import Default from './default.vue';
import Vue from 'vue';
import {createRenderer} from 'vue-server-renderer'
import {shallowMount} from '@vue/test-utils';

Vue.component('nuxt-link', {
	functional: true,
	render (h, {data, children}) {
		return h('nuxt-link-stub', data, children);
	},
});

Vue.component('nuxt', {
	functional: true,
	render (h, {children}) {
		return h('nuxt-stub', children);
	},
});

const renderer = createRenderer();

describe('default', () => {
	test('mode is cfop', async () => {
		const wrapper = shallowMount(Default);
		expect(wrapper.vm.isFullscreen).toEqual(false);
		const html = await new Promise((resolve) => {
			renderer.renderToString(wrapper.vm, (error, string) => {
				resolve(string);
			});
		});
		console.log(html);
	});
});
