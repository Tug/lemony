import prisma, {
	OrderForProject,
	Prisma,
	SchemaTypes,
	UserWithReferrer,
	userWithReferrerIncludes,
	UserWithWallets,
	userWithWalletsIncludes,
} from '../prismadb';
import { getDifiedValue, getNetAmountAndFeesV101 } from '../payment/utils';
import axios from 'axios';
import querystring from 'querystring';
import { v5 as uuidv5 } from 'uuid';
import packageJSON from '../../../package.json';

// A random namespace UUID, do not change this or there will be duplicate events
const MY_NAMESPACE = 'f22a395e-3ccc-460b-bd69-c9eb00538368';

function toPurchaseEvent(order: OrderForProject) {
	const difiedAmount = getDifiedValue(
		order.quantityInDecimal,
		order.project.tokenDecimals
	);
	const amountTokenPaid = order.amount.toNumber() === 0 ? 0 : difiedAmount;
	const amountTokenOffered = order.amount.toNumber() === 0 ? difiedAmount : 0;
	const { net, fees } = getNetAmountAndFeesV101(order.amount, order.project);
	const orderTimestamp = order.createdAt.getTime();
	// const orderTime = order.createdAt
	// 	.toISOString()
	// 	.replace('T', ' ')
	// 	.replace('Z', '000');

	// insertId prevents duplication of events but is limited to 7 days
	// meaning we must sync more often than that
	const insertId = uuidv5(order.id, MY_NAMESPACE);
	return {
		event_type: '[Server] PURCHASE',
		user_id: order.userId,
		insert_id: insertId,
		time: orderTimestamp,
		event_properties: {
			orderId: order.id,
			amountTokenPaid,
			amountTokenOffered,
			'basket.products': [
				{
					fees,
					amountToken: difiedAmount,
					totalEur: order.amount.toNumber(),
					projectSlug: order.project.slug,
				},
			],
			fees,
			difiedValue: order.project.tokenPrice,
			amountTokenTotal: difiedAmount,
			eurValueWithFees: order.amount.toNumber(),
			eurValue: net,
			projectSlug: order.project.slug,
		},
		app_version: packageJSON.version,
		platform: 'Server',
		ip: '127.0.0.1',
		price: order.amount.toNumber(),
		// quantity: difiedAmount,
		revenue: fees,
		productId: order.project.slug,
		revenueType: 'Purchase',
	};
}

export async function syncAmplitudePurchase(order: OrderForProject) {
	try {
		const purchaseEvent = toPurchaseEvent(order);
		await axios({
			method: 'post',
			url: 'https://api.eu.amplitude.com/2/httpapi',
			data: {
				api_key: process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY,
				events: [purchaseEvent],
			},
		});
	} catch (err) {
		console.error('missing fields', err?.response?.data ?? err);
	}
}

export async function syncAllOrders() {
	let page = 0;
	const pageSize = 1000;
	while (true) {
		const orders = await prisma.order.findMany({
			where: {
				type: 'BUY',
				status: 'processed',
				createdAt: {
					// insert_id should prevent duplication of events
					// but is limited to 7 days
					gte: new Date(Date.now() - 1000 * 3600 * 24 * 5),
				},
			},
			include: {
				project: true,
			},
			skip: page * pageSize,
			take: pageSize,
		});
		if (orders.length === 0) {
			break;
		}
		page++;
		const purchaseEvents = orders.map(toPurchaseEvent);
		console.log(
			`Uploading ${purchaseEvents.length} events to Amplitude...`
		);
		try {
			await axios({
				method: 'post',
				url: 'https://api.eu.amplitude.com/2/httpapi',
				data: {
					api_key: process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY,
					events: purchaseEvents,
				},
			});
		} catch (err) {
			if (err?.response?.data) {
				console.error('missing fields', err?.response?.data);
			} else {
				throw err;
			}
		}
	}
}

export async function syncUsers(
	users: Array<UserWithWallets & UserWithReferrer>
) {
	try {
		const identification = users.map((user) => ({
			user_id: user.id,
			user_properties: {
				sponsorId: user.referrerId ?? undefined,
				sponsorLabels: (user.referrer?.labels ?? []).map(
					({ label }) => label
				),
				sponsorReferralCode: user.referrer?.referralCode ?? undefined,
				leadSource: user.leadSource ?? undefined,
			},
		}));

		await axios.post(
			'https://api.eu.amplitude.com/identify',
			querystring.stringify({
				api_key: process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY,
				identification: JSON.stringify(identification),
			}),
			{
				headers: {
					'content-type': 'application/x-www-form-urlencoded',
				},
			}
		);
	} catch (err) {
		console.error(err?.toString(), err?.response?.data);
	}
}

export async function syncAllUsers() {
	let page = 0;
	const pageSize = 500;
	while (true) {
		const users = await prisma.user.findMany({
			take: pageSize,
			skip: page * pageSize,
			include: {
				...userWithWalletsIncludes,
				...userWithReferrerIncludes,
			},
		});
		console.log(`Syncing ${users.length} users with Amplitude...`);
		await syncUsers(users);
		await new Promise((resolve) => setTimeout(resolve, 500));
		page++;
		if (users.length === 0) {
			break;
		}
	}
}
