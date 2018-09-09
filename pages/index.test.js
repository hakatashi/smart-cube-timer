/* eslint-env jest */

import '~/plugins/vuetify.js';
import Index from './index.vue';
import {shallowMount} from '@vue/test-utils';

describe('index', () => {
	test('mode is null', () => {
		const wrapper = shallowMount(Index);
		expect(wrapper.vm.analyzerState.mode).toEqual(null);
	});
});
