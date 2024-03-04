import Mangopay from 'mangopay2-nodejs-sdk';

const mango = new Mangopay({
	clientId: process.env.NEXT_PUBLIC_MANGOPAY_CLIENT_ID,
	clientApiKey: process.env.MANGOPAY_CLIENT_PASSWORD,
	baseUrl: process.env.NEXT_PUBLIC_MANGOPAY_BASE_URL,
});

export const createNaturalUser = (userData) => {
	mango.Users.create({
		FirstName: userData.first_name,
		LastName: userData.last_name,
		Address: {
			AddressLine1: userData.address,
			City: userData.city,
			Region: userData.region,
			PostalCode: userData.postal_code,
			Country: userData.country,
		},
		Birthday: userData.birthDate,
		Nationality: userData.nationality,
		CountryOfResidence: userData.country_of_residence,
		PersonType: 'NATURAL',
		Email: userData.email,
	});
};

export const createNaturalUserSoft = (userData) =>
	mango.Users.create({
		FirstName: userData.first_name,
		LastName: userData.last_name,
		Birthday: userData.birthday,
		Nationality: userData.nationality,
		CountryOfResidence: userData.country_of_residence,
		PersonType: 'NATURAL',
		Email: userData.email,
	});

export const createWallet = (walletData) =>
	mango.Wallets.create({
		Owners: walletData.owners, // ['73723']
		Description: walletData.description,
		Currency: walletData.currency,
	});

export const addBankAccount = (bankAccountData) =>
	mango.Users.createBankAccount(bankAccountData.user_id, {
		OwnerAddress: {
			AddressLine1: bankAccountData.address,
			City: bankAccountData.city,
			Region: bankAccountData.region,
			PostalCode: bankAccountData.postal_code,
			Country: bankAccountData.country,
		},
		OwnerName: bankAccountData.owner_name,
		IBAN: bankAccountData.iban,
		BIC: bankAccountData.bic,
		Type: 'IBAN',
	});

export const createCardRegistration = (cardData) =>
	mango.CardRegistrations.create({
		UserId: cardData.user_id,
		Currency: cardData.currency,
	});

export const updateCardRegistration = (cardData) =>
	mango.CardRegistrations.update(cardData.card_registration_object);

export const getCardRegistration = (cardData) =>
	mango.CardRegistrations.get(cardData.card_registration_id);

export const createPreAuthorization = (authData) =>
	mango.CardPreAuthorizations.create({
		AuthorId: authData.author_id,
		DebitedFunds: {
			Currency: authData.debited_currency,
			Amount: authData.debited_amount,
		},
		CardId: authData.card_id,
		SecureModeReturnURL: authData.return_url,
		StatementDescriptor: authData.statement_descriptor,
	});

const createDirectPayin = (payinData) =>
	mango.PayIns.create({
		PaymentType: payinData.payment_type,
		ExecutionType: payinData.execution_type,
		AuthorId: payinData.author_id,
		CreditedUserId: payinData.credited_user_id,
		CreditedWalletId: payinData.wallet_id,
		DebitedFunds: {
			Currency: payinData.debited_currency,
			Amount: payinData.debited_amount,
		},
		Fees: {
			Currency: payinData.fee_currency,
			Amount: payinData.fee_amount,
		},
		PreauthorizationId: payinData.preauthorization_id,
		SecureModeReturnURL: payinData.return_url,
		CardId: payinData.card_id,
	});

export const refund = (refundData) =>
	mango.PayIns.createRefund(refundData.payin_id, {
		AuthorId: refundData.author_id,
		DebitedFunds: {
			Currency: refundData.debited_currency,
			Amount: refundData.debited_amount,
		},
		Fees: {
			Currency: refundData.fee_currency,
			Amount: refundData.fee_amount,
		},
	});

export const transfer = (transferData) =>
	mango.Transfers.create({
		AuthorId: transferData.author_id,
		CreditedUserId: transferData.credited_user_id,
		DebitedFunds: {
			Currency: transferData.debited_currency,
			Amount: transferData.debited_amount,
		},
		Fees: {
			Currency: transferData.fee_currency,
			Amount: transferData.fee_amount,
		},
		DebitedWalletId: transferData.debited_wallet_id,
		CreditedWalletId: transferData.credited_wallet_id,
	});

export const transferRefund = (transferRefundData) =>
	mango.Transfers.createRefund(transferRefundData.transfer_id, {
		AuthorId: transferRefundData.author_id,
		DebitedFunds: {
			Currency: transferRefundData.debited_currency,
			Amount: transferRefundData.debited_amount,
		},
		Fees: {
			Currency: transferRefundData.fee_currency,
			Amount: transferRefundData.fee_amount,
		},
	});

export const payout = (payoutData) =>
	mango.PayOuts.create({
		AuthorId: payoutData.author_id,
		DebitedFunds: {
			Currency: payoutData.debited_currency,
			Amount: payoutData.debited_amount,
		},
		Fees: {
			Currency: payoutData.fee_currency,
			Amount: payoutData.fee_amount,
		},
		BankAccountId: payoutData.bank_account_id,
		DebitedWalletId: payoutData.debited_wallet_id,
		BankWireRef: payoutData.bank_wire_ref,
		PaymentType: 'BANK_WIRE',
	});

export const addKYCDoc = (kycDoc) => {
	let ressourceId = '';

	return mango.Users.createKycDocument(kycDoc.user_id, {
		Type: kycDoc.type,
	})
		.then((resultat) => {
			ressourceId = resultat.Id;
			/*return fetch(MANGOPAY_BASE_URL+`/${MANGOPAY_API_VERSION}/${MANGOPAY_CLIENT_ID}/users/${resultat.UserId}/kyc/documents/${resultat.Id}/pages/`, {
		  body: JSON.stringify({"File": base64_file}),
		  headers: {
			'Authorization': 'Basic ' + (Buffer.from(MANGOPAY_CLIENT_ID + ':' + MANGOPAY_CLIENT_PASSWORD).toString('base64')),
			'Content-Type': 'application/json'
		  },
		  method: "POST"
		})
		*/
			const KycPage = new mango.models.KycPage({
				File: kycDoc.file_base64_encoded,
			});
			return mango.Users.createKycPage(
				resultat.UserId,
				resultat.Id,
				KycPage
			);
		})
		.then((resultat) => {
			return mango.Users.updateKycDocument(kycDoc.user_id, {
				Id: ressourceId,
				Status: 'VALIDATION_ASKED',
			});
		});
};
