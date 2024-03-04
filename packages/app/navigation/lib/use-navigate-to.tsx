import { useRouter } from '@diversifiedfinance/design-system/router';
import { Project, ProjectsFilterOption } from '@diversifiedfinance/types';
import { Platform } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import getPath, { AllRoutesParams } from './get-path';
import { useStableCallback } from '@diversifiedfinance/app/hooks/use-stable-callback';
import { useNavigation } from '@diversifiedfinance/app/lib/react-navigation/native';

// TODO: refactor to rely on navigator ref instead?
//  Maybe https://underscopeio.github.io/react-native-navigation-hooks
//  This hook is here to fix the error:
//  "The 'navigation' object hasn't been initialized yet"
//  The sole fact that we added a promise, even when it
//  resolves immediately seems enough to fix it.
const useNavigatorReady = () => {
	const router = useRouter();
	return useStableCallback(() => new Promise((resolve) => resolve(router)));
};

export const useNavigateToScreen = (replace: boolean = false) => {
	const router = useRouter();
	const navigatorReady = useNavigatorReady();

	const navigateToScreen = useCallback(
		async (
			screen: keyof AllRoutesParams,
			params?: any,
			queryParams?: any
		) => {
			await navigatorReady();

			const path = getPath(screen, params);

			if (__DEV__) {
				console.log('navigating to ' + path, {
					screen,
					params,
					replace,
					queryParams,
					router: {
						pathname: router.pathname,
						query: router.query,
						asPath: router.asPath,
					},
				});
			}

			if (replace) {
				router.replace(
					{
						pathname: path,
						query: queryParams,
					},
					undefined,
					{
						experimental: {
							nativeBehavior: 'stack-replace',
							isNestedNavigator:
								path !== '/' && !path.startsWith('/onboarding'),
						},
					}
				);
				return;
			}

			const isModal = Boolean(
				Object.keys(queryParams ?? {}).find((paramName: string) =>
					paramName.endsWith('Modal')
				)
			);

			router.push(
				Platform.select({
					native: {
						pathname: path,
						query: queryParams,
					},
					web: {
						pathname: isModal ? router.pathname : path,
						query: {
							...(isModal ? router.query : {}),
							...queryParams,
						},
					} as any,
				}),
				Platform.select({
					native: undefined,
					web: isModal ? router.asPath : undefined,
				})
			);
		},
		[navigatorReady, router, replace]
	);

	return navigateToScreen;
};

export const useNavigateToModalScreen = () => {
	const navigation = useNavigation();
	const navigateTo = useNavigateToScreen();

	const navigateToModal = useCallback(
		(screen: keyof AllRoutesParams, queryParams?: any) =>
			new Promise<void>((resolve) => {
				const unsubscribe = navigation.addListener('focus', () => {
					unsubscribe();
					resolve();
				});
				return navigateTo(
					screen,
					{},
					{ [`${screen}Modal`]: true, ...queryParams }
				);
			}),
		[]
	);

	return navigateToModal;
};

export const useNavigateToOnboarding = (replace: boolean = false) => {
	const redirectTo = useNavigateToScreen(replace);
	const navigateToModal = useNavigateToModalScreen();

	return Platform.OS === 'web' ? navigateToModal : redirectTo;
};

export const useNavigateToLogin = () => {
	const router = useRouter();
	const navigatorReady = useNavigatorReady();

	const navigateToLogin = async () => {
		await navigatorReady();

		router.push(
			Platform.select({
				native: '/login',
				// @ts-ignore
				web: {
					pathname: router.pathname,
					query: { ...router.query, loginModal: true },
				},
			}),
			Platform.select({
				native: '/login',
				web: router.asPath === '/' ? '/login' : router.asPath,
			}),
			{ shallow: true }
		);
	};

	return navigateToLogin;
};

export const useNavigateToProject = (replace: boolean = false) => {
	const navigateToScreen = useNavigateToScreen(replace);

	const navigateToProject = useCallback(
		async (project: Project) => {
			await navigateToScreen('project', { slug: project.slug });
		},
		[navigateToScreen]
	);

	return navigateToProject;
};

export const useNavigateToProjects = (replace: boolean = false) => {
	const navigateToScreen = useNavigateToScreen(replace);

	const navigateToProjects = useCallback(
		async (filter: ProjectsFilterOption) => {
			await navigateToScreen('project', { slug: filter });
		},
		[navigateToScreen]
	);

	return navigateToProjects;
};

export const useNavigateToHome = (replace: boolean = false) => {
	const navigateToScreen = useNavigateToScreen(replace);

	const navigateToHome = useCallback(async () => {
		await navigateToScreen('home');
	}, [navigateToScreen]);

	return navigateToHome;
};
