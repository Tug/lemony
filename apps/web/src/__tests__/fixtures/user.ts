import { Role } from '@prisma/client';
import { Prisma } from '../../lib/prismadb';

export const user1: Prisma.UserCreateInput = {
	id: 'clfb286tb0001mf08orgk1yse',
	firstName: 'John',
	lastName: 'Doe',
	birthDate: new Date('1988-01-01'),
	email: 'user@gmail.com',
	role: Role.USER,
	emailVerified: new Date(),
	kycStatus: 'completed',
	kycUpdatedAt: new Date(),
	termsAndConditionsAcceptedAt: new Date(),
	nationality: {
		connect: {
			code: 'LU',
		},
	},
	countryOfResidence: {
		connect: {
			code: 'LU',
		},
	},
};

export const seller1: Prisma.UserCreateInput = {
	id: 'clfmgc6i40001l008pxq8sqoi',
	firstName: 'Walter',
	lastName: 'McSeller',
	birthDate: new Date('1987-01-01'),
	email: 'seller@diversified.fi',
	role: Role.SELLER,
	emailVerified: new Date(),
	kycStatus: 'completed',
	kycUpdatedAt: new Date(),
	termsAndConditionsAcceptedAt: new Date(),
	nationality: {
		connect: {
			code: 'LU',
		},
	},
	countryOfResidence: {
		connect: {
			code: 'LU',
		},
	},
};

export const user2: Prisma.UserCreateInput = {
	id: 'j32lj532lk5n533245235jk',
	firstName: 'Marilyn',
	lastName: 'Monroe',
	birthDate: new Date('1926-06-01'),
	email: 'marilyn@gmail.com',
	role: Role.USER,
	emailVerified: new Date(),
	kycStatus: 'init',
	kycUpdatedAt: new Date(),
	termsAndConditionsAcceptedAt: new Date(),
	nationality: {
		connect: {
			code: 'FR',
		},
	},
	countryOfResidence: {
		connect: {
			code: 'FR',
		},
	},
};
