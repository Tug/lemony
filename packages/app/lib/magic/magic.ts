import { Magic } from '@magic-sdk/react-native-expo';
import { OAuthExtension } from '@diversifiedfinance/app/lib/magic-oauth-ext';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const isMumbai = process.env.NEXT_PUBLIC_CHAIN_ID === 'mumbai';

// Default to polygon chain
const customNodeOptions = {
	rpcUrl: 'https://rpc-mainnet.maticvigil.com/',
	chainId: 137,
};

if (isMumbai) {
	console.log('Magic network is connecting to Mumbai testnet');
	customNodeOptions.rpcUrl =
		'https://polygon-mumbai.g.alchemy.com/v2/kh3WGQQaRugQsUXXLN8LkOBdIQzh86yL';
	customNodeOptions.chainId = 80001;
}

function useMagic() {
	const { i18n } = useTranslation();
	const magic = useMemo(
		() =>
			new Magic(process.env.NEXT_PUBLIC_MAGIC_PUB_KEY, {
				// network: customNodeOptions,
				extensions: [new OAuthExtension()],
				//testMode: Boolean(__DEV__),
				locale: i18n.language,
			}),
		[i18n.language]
	);
	return { magic, Magic, Relayer: magic.Relayer };
}

export { useMagic };