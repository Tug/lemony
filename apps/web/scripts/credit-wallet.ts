import './script-setup';
import { getSellerUser } from '../src/lib/user';
import { getPaymentContextForUser } from '../src/lib/payment/client';
import prisma from '../src/lib/prismadb';
import {
	dbAddressToMangopayAddress,
	getSystemUser,
} from '../src/lib/payment/utils';
import MangoPayKit, {
	CardData,
	CardRegistrationData,
} from 'mangopay-cardregistration-js-kit';
import {
	creditOwnWalletWithCard,
	getCardRegistrationData,
} from '../src/lib/payment';
import Mangopay from 'mangopay2-nodejs-sdk';
import { getUser } from '../src/lib/auth';

export default async function run({
	userId,
	amount = 2500,
	useSandbox = true,
	paymentType = 'CARD',
}: {
	userId?: string;
	amount?: number;
	useSandbox?: boolean;
	paymentType?: 'BANK_WIRE' | 'CARD';
}) {
	let user;
	if (!userId) {
		user = await getSellerUser();
	} else {
		user = await getUser(userId);
	}
	const ownerUser = await getSystemUser('OWNER', {
		useSandbox,
	});
	// const payerUser = await getSystemUser('PAYER', {
	// 	useSandbox,
	// });
	const { mangoClient, mangopayWalletId } = getPaymentContextForUser(user, {
		paymentSandbox: useSandbox,
	});
	if (!mangopayWalletId) {
		throw new Error(
			'Mangopay wallet not set up for propco marketing seller user'
		);
	}
	// const mandates = await mangoClient.Mandates.getMandatesForUser(
	// 	payerUser.id
	// );
	// let mandate = mandates?.[0];
	if (paymentType === 'BANK_WIRE') {
		const bankAccounts = await mangoClient.Users.getBankAccounts(
			ownerUser.mangopayId
		);
		let bankAccount = bankAccounts?.[0];
		if (!bankAccount) {
			bankAccount = await mangoClient.Users.createBankAccount(
				ownerUser.mangopayId,
				new mangoClient.models.BankAccountDetailsIBAN({
					Type: 'IBAN',
					OwnerName: user.company?.name,
					OwnerAddress: dbAddressToMangopayAddress(
						mangoClient,
						user.company.address
					),
					// IBAN test
					IBAN: 'FR7630004000031234567890143',
					BIC: 'BNPAFRPP',
					Tag: `Bank account for seller ${user.email}`,
				})
			);
		}
		const transaction = await mangoClient.PayIns.create({
			ExecutionType: 'DIRECT',
			PaymentType: 'BANK_WIRE',
			AuthorId: ownerUser.mangopayId,
			CreditedUserId: ownerUser.mangopayId,
			CreditedWalletId: mangopayWalletId,
			DeclaredDebitedFunds: {
				Amount: amount * 100,
				Currency: 'EUR',
			},
			DeclaredFees: {
				Amount: 0,
				Currency: 'EUR',
			},
			Tag: 'Recredit markerting wallet',
		});
		// console.log('transaction', transaction);
		// console.log(
		// 	`Accept the transfer here: https://dashboard.sandbox.mangopay.com/User/${ownerUser.mangopayId}/Wallets/${mangopayWalletId}`
		// );
		console.log(
			`Accept the transfer here: https://dashboard.sandbox.mangopay.com/PayIn/${transaction.Id}`
		);
	} else {
		// does not work from node at the moment, maybe with core
		const cardData: CardData = {
			cardNumber: '4970107111111119',
			// cardNumber: '4970105181818183',
			cardExpirationDate: `01${(new Date().getFullYear() + 1)
				.toString()
				.substring(2, 4)}`,
			cardCvx: '123',
			cardType: 'CB_VISA_MASTERCARD',
		};

		const cardRegisterData: Mangopay.cardRegistration.CardRegistrationData =
			await getCardRegistrationData(user, {
				cardType: cardData.cardType,
			});

		MangoPayKit.cardRegistration.baseURL = useSandbox
			? process.env.NEXT_PUBLIC_MANGOPAY_SANDBOX_BASE_URL
			: process.env.NEXT_PUBLIC_MANGOPAY_BASE_URL;
		MangoPayKit.cardRegistration.clientId = useSandbox
			? process.env.NEXT_PUBLIC_MANGOPAY_SANDBOX_CLIENT_ID
			: process.env.NEXT_PUBLIC_MANGOPAY_CLIENT_ID;
		MangoPayKit.cardRegistration.init({
			Id: cardRegisterData.Id,
			cardRegistrationURL: cardRegisterData.CardRegistrationURL,
			preregistrationData: cardRegisterData.PreregistrationData,
			accessKey: cardRegisterData.AccessKey,
		});

		const card: CardRegistrationData = await new Promise(
			(resolve, reject) =>
				MangoPayKit.cardRegistration.registerCard(
					cardData,
					resolve,
					reject
				)
		);

		const payin = await creditOwnWalletWithCard({
			user,
			cardId: card.CardId,
			amountCent: amount * 100,
			currency: 'EUR',
			ipAddress: '192.168.43.21',
			browserInfo: {
				AcceptHeader:
					'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
				JavaEnabled: false,
				Language: 'en-GB',
				ColorDepth: 30,
				ScreenHeight: 982,
				ScreenWidth: 1512,
				TimeZoneOffset: -120,
				JavascriptEnabled: true,
				UserAgent:
					'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
			},
		});

		if (payin.Status === 'SUCCEEDED') {
			console.log(
				`Successfully credited ${amount} on user wallet using ${paymentType}`
			);
		} else {
			console.log(payin);
			throw new Error(payin.ResultMessage);
		}
	}
	if (user.role === 'SELLER') {
		await prisma.user.update({
			where: { id: user.id },
			data: {
				creditsEur: user.creditsEur.add(amount),
			},
		});
	}
}

if (require.main === module) {
	const yargs = require('yargs/yargs');
	const { hideBin } = require('yargs/helpers');
	const args = yargs(hideBin(process.argv))
		.option('amount', {
			type: 'number',
			description: 'Amount in Eur to credit',
		})
		.option('useSandbox', {
			type: 'boolean',
			description: 'Amount in Eur to credit',
		}).argv;
	run(args);
}
