import { colors } from '@diversifiedfinance/design-system/tailwind';
import { MyInfo, VIPLevelLabel } from '@diversifiedfinance/types/diversified';

export const levelMinXPs = {
	user: 0,
	regular: 1,
	vip1: 15_000,
	vip2: 50_000,
	vip3: 300_000,
	vip4: 10_000_000,
};

export const vipLevelColors: { [key: VIPLevelLabel]: string } = {
	user: colors.gray[500],
	regular: colors.gray[500],
	vip1: colors.diversifiedBlue,
	vip2: colors.themeOrange,
	vip3: colors.black,
	vip4: colors.black,
	vip_affiliate: colors.black,
	vip_influencer: colors.black,
	vip_ama: colors.black,
	vip_affiliate_custom: colors.black,
} as const;

export const vipLevels = [
	'vip1',
	'vip2',
	'vip3',
	'vip4',
	'vip_affiliate',
	'vip_influencer',
	'vip_ama',
	'vip_affiliate_custom',
] as const;

export const getCurrentLevel = (user: MyInfo | undefined) => {
	if (!user?.data) {
		return {
			label: 'user',
			minXP: 0,
			color: vipLevelColors.user,
		};
	}
	const userLabels = user.data.profile.labels ?? [];
	const vipHighestLabel = userLabels
		.filter((label) => ['vip1', 'vip2', 'vip3', 'vip4'].includes(label))
		.sort()
		.pop();
	const isVip = isVIP(user);
	const label =
		vipHighestLabel ??
		(isVip ? 'vip3' : isCustomer(user) ? 'regular' : 'user');
	const minXP = levelMinXPs[label] ?? 0;
	const color = vipLevelColors[label];
	return {
		label,
		minXP,
		color,
	};
};

export const getNextLevel = (user: MyInfo | undefined) => {
	const { label: currentLevelLabel } = getCurrentLevel(user);
	const levelsSorted = Object.entries(levelMinXPs)
		.sort(([labelA, minXPA], [labelB, minXPB]) => {
			return minXPA - minXPB;
		})
		.map(([label, minXP]) => label);
	const currentLevelIndex = levelsSorted.findIndex(
		(levelLabel) => levelLabel === currentLevelLabel
	);
	let label;
	if (currentLevelIndex !== -1) {
		if (!levelsSorted[currentLevelIndex + 1]) {
			label = levelsSorted[levelsSorted.length - 1];
		} else {
			label = levelsSorted[currentLevelIndex + 1];
		}
	} else {
		label = 'vip3';
	}

	const minXP = levelMinXPs[label] ?? 0;
	const color = vipLevelColors[label];
	return {
		label,
		minXP,
		color,
	};
};

export const isVIP = (user: MyInfo | undefined): boolean => {
	if (!user?.data) {
		return false;
	}
	const userLabels = user.data.profile.labels ?? [];
	return userLabels.some((label) => vipLevels.includes(label));
};

export const isCustomer = (user: MyInfo | undefined): boolean => {
	if (!user?.data) {
		return false;
	}
	const userLabels = user.data.profile.labels ?? [];
	return Boolean(userLabels.find((label) => label === 'customer'));
};
