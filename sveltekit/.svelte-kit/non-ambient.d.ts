
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
		RouteId(): "/" | "/admin" | "/admin/dashboard" | "/api" | "/api/invite-link" | "/api/invite-link/[groupId]" | "/api/telegram-callback" | "/api/telegram-link" | "/dashboard" | "/dashboard/connect-telegram" | "/dashboard/groups" | "/dashboard/join-default-group" | "/dashboard/profile" | "/login-01" | "/login" | "/signout" | "/signup-success" | "/signup";
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
			"/dashboard": Record<string, never>;
			"/dashboard/connect-telegram": Record<string, never>;
			"/dashboard/groups": Record<string, never>;
			"/dashboard/join-default-group": Record<string, never>;
			"/dashboard/profile": Record<string, never>;
			"/login-01": Record<string, never>;
			"/login": Record<string, never>;
			"/signout": Record<string, never>;
			"/signup-success": Record<string, never>;
			"/signup": Record<string, never>
		};
		Pathname(): "/" | "/admin" | "/admin/" | "/admin/dashboard" | "/admin/dashboard/" | "/api" | "/api/" | "/api/invite-link" | "/api/invite-link/" | `/api/invite-link/${string}` & {} | `/api/invite-link/${string}/` & {} | "/api/telegram-callback" | "/api/telegram-callback/" | "/api/telegram-link" | "/api/telegram-link/" | "/dashboard" | "/dashboard/" | "/dashboard/connect-telegram" | "/dashboard/connect-telegram/" | "/dashboard/groups" | "/dashboard/groups/" | "/dashboard/join-default-group" | "/dashboard/join-default-group/" | "/dashboard/profile" | "/dashboard/profile/" | "/login-01" | "/login-01/" | "/login" | "/login/" | "/signout" | "/signout/" | "/signup-success" | "/signup-success/" | "/signup" | "/signup/";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/robots.txt" | string & {};
	}
}