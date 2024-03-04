import { useCallback, useEffect, useState } from 'react';
import { axios } from '@diversifiedfinance/app/lib/axios';
import {
	View,
	Text,
	Button,
	Select,
	Spinner,
} from '@diversifiedfinance/design-system';
import { Input } from '@diversifiedfinance/design-system/input';
import { Modal } from '@diversifiedfinance/design-system/modal';
import { Table } from '../../components/table';
import { ObjectDetails } from '../../components/object-details';

const labelOptions = [
	{
		value: 'customer',
		label: 'customer',
	},
	{
		value: 'vip1',
		label: 'vip1',
	},
	{
		value: 'vip2',
		label: 'vip2',
	},
	{
		value: 'vip3',
		label: 'vip3',
	},
	{
		value: 'vip4',
		label: 'vip4',
	},
	{
		value: 'vip_ama',
		label: 'vip_ama',
	},
	{
		value: 'vip_special',
		label: 'vip_special',
	},
	{
		value: 'partner',
		label: 'partner',
	},
	// ...specialCaseSponsorLabels.map((label) => ({
	// 	value: label,
	// 	label,
	// })),
	// ...(
	// 	allBenefits.filter(
	// 		(benefit) => benefit instanceof FreeCreditsBenefit
	// 	) as FreeCreditsBenefit[]
	// ).map(({ userLabel }) => ({
	// 	value: userLabel,
	// 	label: userLabel,
	// })),
	{
		value: 'vip_influencer',
		label: 'vip_influencer',
	},
	{
		value: 'vip_affiliate',
		label: 'vip_affiliate',
	},
	{
		value: 'vip_affiliate_custom',
		label: 'vip_affiliate_custom',
	},
	{
		value: 'vip1_10eur_credited',
		label: 'vip1_10eur_credited',
	},
	{
		value: 'referral_10eur_credited',
		label: 'referral_10eur_credited',
	},
	{
		value: 'referral_10eur_credited_to_sponsor',
		label: 'referral_10eur_credited_to_sponsor',
	},
	{
		value: 'referral_influencer_20eur_credited',
		label: 'referral_influencer_20eur_credited',
	},
	{
		value: 'referral_vip_20eur_credited_to_sponsor',
		label: 'referral_vip_20eur_credited_to_sponsor',
	},
	{
		value: 'referral_1dified_claim_credited',
		label: 'referral_1dified_claim_credited',
	},
	{
		value: 'referral_influencer_20eur_credited',
		label: 'referral_influencer_20eur_credited',
	},
	{
		value: 'referral_influencer_2dified_claim_credited',
		label: 'referral_influencer_2dified_claim_credited',
	},
	{
		value: 'referral_1dified_claim_credited_to_sponsor',
		label: 'referral_1dified_claim_credited_to_sponsor',
	},
	{
		value: 'referral_2dified_claim_credited_to_sponsor',
		label: 'referral_2dified_claim_credited_to_sponsor',
	},
	{
		value: 'referral_vip_2dified_claim_credited_to_sponsor',
		label: 'referral_vip_2dified_claim_credited_to_sponsor',
	},
];

const getAxiosErrorMessage = (err) =>
	err.isAxiosError
		? `${err.message}. Response body: ${JSON.stringify(err.response?.data)}`
		: err.message;

function User({ data, refresh }: { data: any; refresh?: () => void }) {
	const [modalVisible, setModalVisible] = useState<boolean>(false);
	const [currentLabel, setCurrentLabel] = useState<string>();
	const [tokens, setTokens] = useState<any[]>();
	const [wallet, setWallet] = useState<any>();
	const [error, setError] = useState<any>();
	const addUserLabel = async (userId?: string, label?: string) => {
		setError(null);
		if (!userId || !label) {
			return;
		}
		try {
			await axios({
				url: `/api/admin/users/${userId}/add-label`,
				method: 'post',
				data: {
					label,
				},
			});
			setModalVisible(false);
			refresh?.();
		} catch (err) {
			setError(getAxiosErrorMessage(err));
		}
	};
	const fetchTokens = async (userId: string) => {
		setError(null);
		if (!userId) {
			return;
		}
		try {
			const tokensRes = await axios({
				url: `/api/admin/users/${userId}/tokens`,
				method: 'get',
			});
			setTokens(tokensRes ?? []);
		} catch (err) {
			setError(getAxiosErrorMessage(err));
		}
	};
	const fetchWallet = async (userId: string) => {
		setError(null);
		if (!userId) {
			return;
		}
		try {
			const walletRes = await axios({
				url: `/api/admin/users/${userId}/wallets/eur`,
				method: 'get',
			});
			setWallet(walletRes);
		} catch (err) {
			setError(getAxiosErrorMessage(err));
		}
	};
	const userLabels = data.label_string?.split(',') ?? [];

	return (
		<>
			<Modal
				key={`user-label-modal-${data.id}`}
				title={`Add label to user ${data.firstName} ${data.lastName}`}
				visible={modalVisible}
				close={() => {
					setModalVisible(false);
				}}
				onClose={() => {
					setModalVisible(false);
				}}
			>
				<View tw="m-4">
					<View tw="my-2">
						<Text tw="text-base text-black dark:text-white">
							User id: {data.id}
						</Text>
					</View>
					<View tw="mb-4 mt-2">
						<Text tw="text-base text-black dark:text-white">
							Current labels: {data.label_string ?? 'N/A'}
						</Text>
					</View>
					<View tw="my-2">
						<Select
							value={currentLabel}
							options={labelOptions.filter(
								({ value }) => !userLabels.includes(value)
							)}
							onChange={setCurrentLabel}
						/>
					</View>
					<View tw="my-2">
						<Button
							tw={!currentLabel ? 'opacity-50' : ''}
							disabled={!currentLabel}
							size="regular"
							onPress={() => addUserLabel(data.id, currentLabel)}
						>
							Add
						</Button>
					</View>
				</View>
			</Modal>
			<View tw="m-4 flex-col rounded bg-gray-200 dark:bg-gray-800 text-black dark:text-white p-4">
				<ObjectDetails data={data} />
				<View tw="mt-2 flex-row">
					{(data.role === 'USER' || __DEV__) && (
						<Button
							variant="secondary"
							onPress={() => setModalVisible(true)}
						>
							Add label
						</Button>
					)}
					<Button
						variant="secondary"
						onPress={() => fetchTokens(data.id)}
					>
						Load Tokens
					</Button>
					<Button
						variant="secondary"
						onPress={() => fetchWallet(data.id)}
					>
						Load Wallet
					</Button>
				</View>
				<View tw="py-4">
					{tokens && (
						<View tw="text-xs">
							<Table data={tokens} />
						</View>
					)}
					{tokens && tokens.length === 0 && (
						<Text tw="text-black dark:text-white">No tokens</Text>
					)}
					{wallet && <ObjectDetails data={wallet} />}
					{error && (
						<Text tw="text-red-500 font-bold">Error: {error}</Text>
					)}
				</View>
			</View>
		</>
	);
}

const getTableText = (data: any, divider = ',') => {
	const columns = Object.keys(data[0]);
	const th = `${columns.join(divider)}`;
	const td = data
		.map((item) => Object.values(item).join(`"${divider}"`))
		.join('"\n"');
	return `${th}\n"${td}"`;
};

export default function Admin({}) {
	const [isFetching, setFetching] = useState<boolean>(false);
	const [searchTerm, updateSearchTerm] = useState<string>();
	const [searchResult, setSearchResult] = useState<any[]>();
	const [viewMode, setViewMode] = useState<'table' | 'list'>('list');
	const [lastOperation, setLastOperation] = useState<
		'search-users' | 'list-users' | 'list-orders'
	>();
	const doSearch = useCallback(async () => {
		setFetching(true);
		try {
			const users = await axios({
				url: '/api/admin/users/search',
				method: 'get',
				params: {
					q: searchTerm,
				},
			});
			setSearchResult(users);
		} catch (err) {
			console.error(err);
		}
		setLastOperation('search-users');
		setFetching(false);
	}, [searchTerm, setSearchResult]);

	const listAllOrders = useCallback(async () => {
		setFetching(true);
		try {
			const orders = await axios({
				url: '/api/admin/orders/list',
				method: 'get',
			});
			console.log('ORDERS');
			setSearchResult(orders);
			setViewMode('table');
		} catch (err) {
			console.error(err);
		}
		setLastOperation('list-orders');
		setFetching(false);
	}, [setFetching, setSearchResult]);

	const listAllUsers = useCallback(async () => {
		setFetching(true);
		try {
			const users = await axios({
				url: '/api/admin/users/list',
				method: 'get',
			});
			console.log('USERS');
			console.table(users);
			setLastOperation('list-users');
			setSearchResult(users);
			setViewMode('list');
		} catch (err) {
			console.error(err);
		}
		setFetching(false);
	}, [setFetching, setSearchResult]);

	const getStats = async () => {
		setFetching(true);
		const stats = await axios({
			url: '/api/admin/stats',
			method: 'get',
		});
		setSearchResult([stats]);
		setViewMode('list');
		setFetching(false);
	};

	const getMangopayStats = async () => {
		setFetching(true);
		const stats = await axios({
			url: '/api/admin/stats/mangopay',
			method: 'get',
		});
		setSearchResult([stats]);
		setViewMode('list');
		setFetching(false);
	};

	const getProjectsStats = async () => {
		setFetching(true);
		const stats = await axios({
			url: '/api/admin/stats/mangopay/projects',
			method: 'get',
		});
		setSearchResult(stats);
		setViewMode('table');
		setFetching(false);
	};

	const getDisputes = async () => {
		setFetching(true);
		const stats = await axios({
			url: '/api/admin/stats/mangopay/disputes',
			method: 'get',
		});
		setSearchResult(stats);
		setViewMode('table');
		setFetching(false);
	};

	const getFreeTokenPools = async () => {
		setFetching(true);
		const { data: tokenPools } = await axios({
			url: '/api/admin/free-token-pools',
			method: 'get',
		});
		console.log('tokenPools', tokenPools);
		setSearchResult(tokenPools);
		setViewMode('table');
		setFetching(false);
	};

	const exportUsers = useCallback(async () => {
		const hiddenElement = document.createElement('a');
		const date = new Date();
		const text = getTableText(searchResult);
		hiddenElement.href =
			'data:text/plain;charset=utf-8,' + encodeURIComponent(text);
		hiddenElement.download = `${lastOperation}-${date.toISOString()}.csv`;
		hiddenElement.click();
	}, [searchResult, lastOperation]);

	const refresh = () => {
		if (lastOperation === 'list-orders') {
			listAllOrders();
		} else if (lastOperation === 'list-users') {
			listAllUsers();
		} else {
			doSearch();
		}
	};

	const clear = () => setSearchResult(undefined);

	useEffect(() => {
		(async () => {
			const meResponse = await axios({
				url: '/api/me',
				method: 'get',
			});
			if (!meResponse || meResponse.profile.role !== 'ADMIN') {
				window.location.replace('/');
			}
		})();
	}, []);

	return (
		<View tw="mt-24 w-[80%] flex-col">
			<View tw="flex-row flex-wrap">
				<View tw="md:basis-1/2">
					<View tw="my-4 flex-col">
						<View tw="mb-4">
							<Text tw="text-3xl text-black dark:text-white">
								Search for a user
							</Text>
						</View>
						<View tw="flex-row flex-wrap items-center justify-center gap-2">
							<Input
								value={searchTerm}
								onChangeText={updateSearchTerm}
								placeholder="Enter search terms"
								returnKeyType="search"
								onSubmitEditing={doSearch}
							/>
							<Button
								type="submit"
								variant="primary"
								onPress={doSearch}
							>
								Search
							</Button>
							<Button
								variant="danger"
								tw={[isFetching ? 'opacity-50' : '']}
								onPress={listAllUsers}
								disabled={isFetching}
							>
								List all users
							</Button>
						</View>
					</View>
				</View>
				<View tw="md:basis-1/2">
					<View tw="my-4 flex-col">
						<View tw="mb-4">
							<Text tw="text-3xl text-black dark:text-white">
								See register
							</Text>
						</View>
						<View tw="flex-row items-center justify-center">
							<Button
								variant="danger"
								tw={[isFetching ? 'opacity-50' : '']}
								onPress={listAllOrders}
								disabled={isFetching}
							>
								List all orders
							</Button>
						</View>
					</View>
				</View>
				<View tw="md:basis-1/2 mb-4">
					<View tw="my-4 flex-col">
						<View tw="mb-4">
							<Text tw="text-3xl text-black dark:text-white">
								More
							</Text>
						</View>
						<View tw="flex-row items-start flex-wrap gap-2">
							<Button variant="secondary" onPress={clear}>
								Clear
							</Button>
							<Button variant="secondary" onPress={exportUsers}>
								Export
							</Button>
							<Button
								variant="secondary"
								tw={[isFetching ? 'opacity-50' : '']}
								onPress={getStats}
								disabled={isFetching}
							>
								Get Diversified Stats
							</Button>
							<Button
								variant="secondary"
								tw={[isFetching ? 'opacity-50' : '']}
								onPress={getMangopayStats}
								disabled={isFetching}
							>
								Get Mango Stats
							</Button>
							<Button
								variant="secondary"
								tw={[isFetching ? 'opacity-50' : '']}
								onPress={getProjectsStats}
								disabled={isFetching}
							>
								Get Mango Projects Stats
							</Button>
							<Button
								variant="secondary"
								tw={[isFetching ? 'opacity-50' : '']}
								onPress={getDisputes}
								disabled={isFetching}
							>
								Get Mango Disputes
							</Button>
							<Button
								variant="secondary"
								tw={[isFetching ? 'opacity-50' : '']}
								onPress={getFreeTokenPools}
								disabled={isFetching}
							>
								List Free token pools
							</Button>
						</View>
					</View>
				</View>
			</View>
			<View tw="mb-4">
				<Text tw="text-3xl text-black dark:text-white">Result</Text>
			</View>
			<View tw="rounded border border-gray-500 p-4">
				{isFetching && (
					<View tw="items-center">
						<Spinner />
					</View>
				)}
				{searchResult &&
					(viewMode === 'list' ? (
						<View>
							{searchResult.map((userdata) => (
								<User
									key={userdata.id}
									data={userdata}
									refresh={refresh}
								/>
							))}
						</View>
					) : (
						<Table data={searchResult} />
					))}
			</View>
		</View>
	);
}
