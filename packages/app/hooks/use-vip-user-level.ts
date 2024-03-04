import { useUser } from '@diversifiedfinance/app/hooks/use-user';
import {
	getCurrentLevel,
	getNextLevel,
	isCustomer,
	isVIP,
} from '@diversifiedfinance/app/lib/vip';

const benefitsFallback = {
	difiedPerReferral: 1,
};

export const useVIPUserLevel = () => {
	const { user } = useUser();
	const userXP = user?.data?.profile.xp ?? 0;
	const vipLevelBenefits = user?.data?.constants?.vipLevelBenefits ?? {};
	const {
		label: currentLevelLabel,
		minXP: currentLevelMinXP,
		color: currentLevelColor,
	} = getCurrentLevel(user);
	const {
		label: nextLevelLabel,
		minXP: nextLevelMinXP,
		color: nextLevelColor,
	} = getNextLevel(user);
	const nextLevelProgress =
		nextLevelMinXP > 0 && userXP > 0 ? userXP / nextLevelMinXP : 0;
	const remainingXP = nextLevelMinXP - userXP;
	const benefits = vipLevelBenefits[currentLevelLabel] ?? benefitsFallback;

	return {
		isCustomer: isCustomer(user),
		isVIP: isVIP(user),
		userXP,
		currentLevelLabel,
		currentLevelMinXP,
		currentLevelColor,
		nextLevelProgress,
		nextLevelMinXP,
		nextLevelLabel,
		nextLevelColor,
		remainingXP,
		benefits,
	};
};
