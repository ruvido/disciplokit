export { matchers } from './matchers.js';

export const nodes = [
	() => import('./nodes/0'),
	() => import('./nodes/1'),
	() => import('./nodes/2'),
	() => import('./nodes/3'),
	() => import('./nodes/4'),
	() => import('./nodes/5'),
	() => import('./nodes/6'),
	() => import('./nodes/7'),
	() => import('./nodes/8'),
	() => import('./nodes/9'),
	() => import('./nodes/10'),
	() => import('./nodes/11'),
	() => import('./nodes/12'),
	() => import('./nodes/13'),
	() => import('./nodes/14'),
	() => import('./nodes/15'),
	() => import('./nodes/16'),
	() => import('./nodes/17')
];

export const server_loads = [0,2,3,4,5];

export const dictionary = {
		"/": [~6],
		"/admin/dashboard": [~7,[2]],
		"/connect-telegram": [~8,[3]],
		"/dashboard": [~9,[4]],
		"/dashboard/groups": [~10,[4]],
		"/dashboard/profile": [~11,[4]],
		"/join-default-group": [~12,[5]],
		"/login-01": [14],
		"/login": [~13],
		"/signout": [~15],
		"/signup-success": [17],
		"/signup": [~16]
	};

export const hooks = {
	handleError: (({ error }) => { console.error(error) }),
	
	reroute: (() => {}),
	transport: {}
};

export const decoders = Object.fromEntries(Object.entries(hooks.transport).map(([k, v]) => [k, v.decode]));

export const hash = false;

export const decode = (type, value) => decoders[type](value);

export { default as root } from '../root.js';