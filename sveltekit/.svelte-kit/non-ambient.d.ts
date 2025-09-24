
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/admin" | "/admin/dashboard" | "/api" | "/api/invite-link" | "/api/invite-link/[groupId]" | "/api/telegram-callback" | "/api/telegram-link" | "/connect-telegram" | "/dashboard" | "/dashboard/groups" | "/dashboard/profile" | "/join-default-group" | "/login-01" | "/login" | "/signout" | "/signup-success" | "/signup";
		RouteParams(): {
			"/api/invite-link/[groupId]": { groupId: string }
		};
		LayoutParams(): {
			"/": { groupId?: string };
			"/admin": Record<string, never>;
			"/admin/dashboard": Record<string, never>;
			"/api": { groupId?: string };
			"/api/invite-link": { groupId?: string };
			"/api/invite-link/[groupId]": { groupId: string };
			"/api/telegram-callback": Record<string, never>;
			"/api/telegram-link": Record<string, never>;
			"/connect-telegram": Record<string, never>;
			"/dashboard": Record<string, never>;
			"/dashboard/groups": Record<string, never>;
			"/dashboard/profile": Record<string, never>;
			"/join-default-group": Record<string, never>;
			"/login-01": Record<string, never>;
			"/login": Record<string, never>;
			"/signout": Record<string, never>;
			"/signup-success": Record<string, never>;
			"/signup": Record<string, never>
		};
		Pathname(): "/" | "/admin" | "/admin/" | "/admin/dashboard" | "/admin/dashboard/" | "/api" | "/api/" | "/api/invite-link" | "/api/invite-link/" | `/api/invite-link/${string}` & {} | `/api/invite-link/${string}/` & {} | "/api/telegram-callback" | "/api/telegram-callback/" | "/api/telegram-link" | "/api/telegram-link/" | "/connect-telegram" | "/connect-telegram/" | "/dashboard" | "/dashboard/" | "/dashboard/groups" | "/dashboard/groups/" | "/dashboard/profile" | "/dashboard/profile/" | "/join-default-group" | "/join-default-group/" | "/login-01" | "/login-01/" | "/login" | "/login/" | "/signout" | "/signout/" | "/signup-success" | "/signup-success/" | "/signup" | "/signup/";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/robots.txt" | string & {};
	}
}