import { getWPMedia } from '../../../lib/wordpress-rest-api';
import type { NextApiRequest } from 'next';
import {
	Catch,
	createHandler,
	Get,
	NotFoundException,
	Param,
	Query,
	Req,
} from 'next-api-decorators';
import { exceptionHandler } from '../../../lib/error';
import { WP_Media } from '@diversifiedfinance/types';

@Catch(exceptionHandler)
class MediaHandler {
	// GET /api/media
	@Get('/')
	public async listMedia(
		@Req() req: NextApiRequest,
		@Query('include') include: string | string[]
	): Promise<WP_Media[]> {
		const mediaIds = (
			include && Array.isArray(include)
				? include
				: (include ?? '').split(',')
		).map(Number);
		return await getWPMedia(mediaIds);
	}

	// GET /api/media/:media_id
	@Get('/:media_id')
	public async getMedia(
		@Req() req: NextApiRequest,
		@Param('media_id') mediaId: string
	): Promise<WP_Media> {
		if (!mediaId || isNaN(Number(mediaId))) {
			throw new Error('Invalid media id');
		}
		const mediaRes = await getWPMedia([Number(mediaId)]);
		if (!mediaRes || mediaRes.length === 0) {
			throw new NotFoundException('Media not found');
		}
		return mediaRes[0];
	}
}

export default createHandler(MediaHandler);
