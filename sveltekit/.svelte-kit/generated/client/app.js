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
	() => import('./nodes/14')
];

export const server_loads = [0,2];

export const dictionary = {
		"/": [~3],
		"/admin/dashboard": [~4],
		"/dashboard": [~5,[2]],
		"/dashboard/connect-telegram": [~6,[2]],
		"/dashboard/groups": [~7,[2]],
		"/dashboard/join-default-group": [~8,[2]],
		"/dashboard/profile": [~9,[2]],
		"/login-01": [11],
		"/login": [~10],
		"/signout": [~12],
		"/signup-success": [14],
		"/signup": [~13]
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