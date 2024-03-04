import { PrismaClient, Prisma } from '@prisma/client';
import * as SchemaTypes from '@prisma/client';

declare global {
	var prisma: PrismaClient | undefined;
}

const prisma = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;

export default prisma;

export { prisma, Prisma, SchemaTypes };

export type Decimal = Prisma.Decimal;
export const Decimal = Prisma.Decimal;

Decimal.set({
	precision: 12,
	rounding: Decimal.ROUND_DOWN,
	toExpNeg: -7,
	toExpPos: 21,
	maxE: 9e15,
	minE: -9e15,
	modulo: 1,
	crypto: false,
});

// const userWithWallets = Prisma.validator<Prisma.UserArgs>()({
// 	include: {
// 		wallets: true,
// 		nationality: true,
// 		countryOfResidence: true,
// 		address: true,
// 	},
// });
// export type UserWithWallets = Prisma.UserGetPayload<typeof userWithWallets>;

export const userWithWalletsIncludes = {
	wallets: true,
	nationality: true,
	countryOfResidence: true,
	address: {
		include: {
			country: true,
		},
	},
	labels: true,
};

export const userWithLabelsIncludes = {
	labels: true,
};

export const userWithCompanyIncludes = {
	company: {
		include: {
			address: {
				include: {
					country: true,
				},
			},
		},
	},
};

export const userWithReferrerIncludes = {
	referrer: {
		include: {
			labels: true,
		},
	},
};

export const legalRepresentativeIncludes = {
	...userWithWalletsIncludes,
	...userWithCompanyIncludes,
};

export const userForCheckoutSelect = {
	id: true,
	settings: true,
	mangopayId: true,
	mangopayWalletId: true,
	mangopayCreditsWalletId: true,
	sandboxMangopayId: true,
	sandboxMangopayWalletId: true,
	sandboxMangopayCreditsWalletId: true,
	mangopayActiveCardId: true,
};

export type UserWithWallets = Prisma.UserGetPayload<{
	include: {
		wallets: true;
		nationality: true;
		countryOfResidence: true;
		address: {
			include: {
				country: true;
			};
		};
		labels: true;
	};
}>;

export type UserWithReferrer = Prisma.UserGetPayload<{
	include: {
		referrer: {
			include: {
				labels: true;
			};
		};
	};
}>;

export type UserWithLabels = Prisma.UserGetPayload<{
	include: {
		labels: true;
	};
}>;

export type UserForCheckout = Pick<
	SchemaTypes.User,
	| 'id'
	| 'settings'
	| 'mangopayId'
	| 'mangopayWalletId'
	| 'mangopayCreditsWalletId'
	| 'sandboxMangopayId'
	| 'sandboxMangopayWalletId'
	| 'sandboxMangopayCreditsWalletId'
	| 'mangopayActiveCardId'
>;

export type LegalRepresentativeUser = Prisma.UserGetPayload<{
	include: {
		wallets: true;
		nationality: true;
		countryOfResidence: true;
		address: {
			include: {
				country: true;
			};
		};
		company: {
			include: {
				address: {
					include: {
						country: true;
					};
				};
			};
		};
	};
}>;

export type AddressWithCountry = Prisma.AddressGetPayload<{
	include: {
		country: true;
	};
}>;

export const projectWithProductIdsIncludes = {
	products: true,
	crowdfundingState: true,
};

export const projectWithProductsIncludes = {
	crowdfundingState: {
		select: {
			collectedAmount: true,
			maximumAmount: true,
			updatedAt: true,
		},
	},
	products: {
		include: {
			product: true,
		},
	},
};

export const projectForCheckoutIncludes = {
	owner: true,
	crowdfundingState: true,
};

export type ProjectWithProductIds = Prisma.ProjectGetPayload<{
	include: {
		products: true;
	};
}>;

export type ProjectWithProducts = Prisma.ProjectGetPayload<{
	include: {
		crowdfundingState: {
			select: {
				collectedAmount: true;
				maximumAmount: true;
				updatedAt: true;
			};
		};
		products: {
			include: {
				product: true;
			};
		};
	};
}>;

export type ProjectForCheckout = Prisma.ProjectGetPayload<{
	include: {
		owner: true;
		crowdfundingState: true;
	};
}>;

export const orderForProjectIncludes = {
	project: {
		include: {
			products: true,
		},
	},
};

export type OrderForProject =
	| Prisma.OrderGetPayload<{
			include: {
				project: true;
			};
	  }>
	| Prisma.SandboxOrderGetPayload<{
			include: {
				project: true;
			};
	  }>;

export const freeTokenPoolIncludes = {
	project: {
		select: {
			id: true,
			slug: true,
			tokenName: true,
			tokenDecimals: true,
		},
	},
};

export const tokenClaimIncludes = {
	pool: {
		include: freeTokenPoolIncludes,
	},
};

export type UserTokenClaimWithProject = Prisma.UserTokenClaimGetPayload<{
	include: {
		pool: {
			include: {
				project: {
					select: {
						id: true;
						slug: true;
						tokenName: true;
						tokenDecimals: true;
					};
				};
			};
		};
	};
}>;

export const transactionWithRetry = async <T>(
	fn: Parameters<typeof prisma.$transaction>[0],
	transactionOptions: Parameters<typeof prisma.$transaction>[1] = {
		maxWait: 8000, // default: 2000
		timeout: 15000, // default: 5000
		isolationLevel: Prisma.TransactionIsolationLevel.Serializable, // optional, default for CockroachDB
	},
	{
		maxRetries = 3,
		retryInterval = 5,
	}: { maxRetries: number; retryInterval: number } = {
		maxRetries: 3,
		retryInterval: 200,
	}
): Promise<any> => {
	let retryCount = 0;
	let lastError = null;
	while (retryCount++ < maxRetries) {
		try {
			return await prisma.$transaction(fn, transactionOptions);
		} catch (error) {
			//if (__DEV__) {
			console.log('Transaction Error', error?.code, error);
			//}
			// Transaction failed due to a write conflict or a deadlock. Please retry your transaction
			if (error?.code === 'P2034') {
				lastError = error;
				// log the error and wait for a bit before retrying
				console.error(
					`Transaction failed: ${error?.message ?? 'unknown'}`
				);
				await new Promise((resolve) =>
					setTimeout(resolve, retryInterval)
				);
			} else {
				throw error;
			}
		}
	}
	if (lastError) {
		throw lastError;
	}
};

export const transactionExtendable = async <T>(
	fn: (tx: Prisma.TransactionClient) => Promise<T>,
	transactionOptions = {
		maxWait: 8000, // default: 2000
		timeout: 25000, // default: 5000
		isolationLevel: Prisma.TransactionIsolationLevel.Serializable, // optional, default for CockroachDB
	}
) => prisma.$transaction((tx) => fn(extendTransaction(tx)), transactionOptions);

const isProxy = Symbol('isProxy');

export const extendTransaction = (tx: Prisma.TransactionClient) => {
	if ((tx as any)[isProxy]) {
		return tx;
	}
	return new Proxy(tx, {
		get(target, p) {
			if (p === isProxy) {
				return true;
			}
			if (p === '$transaction') {
				return async (func: (tx: Prisma.TransactionClient) => any) =>
					func(tx);
			}
			return target[p];
		},
	});
};

// https://gist.github.com/aalin/ea23b786e3d55329f6257c0f6576418b
type ConvertTupleTypes<T extends unknown[], ConvertTo> = T extends [
	infer _First,
	...infer Rest
]
	? [ConvertTo, ...ConvertTupleTypes<Rest, ConvertTo>]
	: [];

type FieldsType<T extends unknown[]> = T extends [infer _First, ...infer Rest]
	? ConvertTupleTypes<Rest, string>
	: [];

export function updateMulti<T extends unknown[]>(
	tableName: string,
	fields: FieldsType<T>,
	values: T[]
) {
	if (values.length * (fields.length + 1) > 32767) {
		throw new Error(
			`updateMulti: too many values (${
				values.length * (fields.length + 1)
			})`
		);
	}
	const setSql = fields
		.map((field) =>
			Array.isArray(field)
				? `"${field[0]}" = "t"."${field[0]}"`
				: `"${field}" = "t"."${field}"`
		)
		.join(', ');
	const fieldsSql = fields
		.map((f) => (Array.isArray(f) ? `"${f[0]}"` : `"${f}"`))
		.join(', ');

	let paramIndex = 0;
	const valuesSql = values
		.map(
			(row) =>
				`(${row.map(
					(v, rowIndex) =>
						`\$${++paramIndex}${
							Array.isArray(fields[rowIndex - 1])
								? `::"${fields[rowIndex - 1][1]}"`
								: ''
						}`
				)})`
		)
		.join(',');

	const sql = `UPDATE "${tableName}" SET ${setSql} FROM (VALUES ${valuesSql}) AS t("id", ${fieldsSql}) WHERE "${tableName}"."id" = "t"."id"`;
	return prisma.$executeRawUnsafe(sql, ...values.flat());
}
