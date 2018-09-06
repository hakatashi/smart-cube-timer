/* eslint-env jest */

import '~/plugins/vuetify.js';
import Index from './index.vue';
import {shallowMount} from '@vue/test-utils';

describe('index', () => {
	test('mode is cfop', () => {
		const wrapper = shallowMount(Index);
		expect(wrapper.vm.mode).toEqual('cfop');
	});
});
