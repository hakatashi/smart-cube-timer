/* eslint-env jest */

import '~/plugins/vuetify.js';
import Index from './index.vue';
import {createRenderer} from 'vue-server-renderer'
import {shallowMount} from '@vue/test-utils';

const renderer = createRenderer();

describe('index', () => {
	test('mode is cfop', async () => {
		const wrapper = shallowMount(Index);
		expect(wrapper.vm.mode).toEqual('cfop');
		const html = await new Promise((resolve) => {
			renderer.renderToString(wrapper.vm, (error, string) => {
				resolve(string);
			});
		});
		console.log(html);
	});
});
