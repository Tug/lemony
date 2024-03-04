import { IsNotEmpty, IsObject, IsOptional } from 'class-validator';

export class DeviceTokenCreateDTO {
	@IsNotEmpty()
	platform: number | 'ios' | 'android' | 'web';

	@IsNotEmpty()
	token: string;
}

export class SendNotificationCreateDTO {
	@IsNotEmpty()
	type: string;

	@IsOptional()
	content: any;

	@IsOptional()
	imgUrl?: string;

	@IsOptional()
	visibleAt?: string | number;

	@IsOptional()
	authorId: string;

	@IsOptional()
	userId: string;

	@IsOptional()
	labels: string | string[];
}

// add notification received from the client
export class NotificationCreateDTO {
	type: string;

	@IsObject()
	content: any;
	// content: {
	// 	description: string;
	// 	title?: string;
	// 	path?: string;
	// 	url?: string;
	// };
}
