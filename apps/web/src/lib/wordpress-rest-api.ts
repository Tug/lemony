import axios from 'axios';
import {
	WP_Media,
	WP_REST_API_Project,
	WP_REST_API_Product,
	WP_REST_API_Oracle_Product,
} from '@diversifiedfinance/types';
import { WP_REST_API_Tag } from 'wp-types';

const WORDPRESS_API_ROOT = 'https://getdiversified.app/wp-json';

type EntityOrderby =
	| 'author'
	| 'date'
	| 'id'
	| 'include'
	| 'modified'
	| 'parent'
	| 'relevance'
	| 'slug'
	| 'include_slugs'
	| 'title';

interface WP_REST_API_Entity_QueryParams {
	page?: string | number;
	per_page?: string | number;
	slug?: string;
	lang?: string;
	orderby?: EntityOrderby;
}

export const getWPProjects = (params: WP_REST_API_Entity_QueryParams = {}) =>
	getWPEntities<WP_REST_API_Project>('project', params);

export const getWPTags = () =>
	getWPEntities<WP_REST_API_Tag>('tags', { per_page: 100 });

export const getWPProducts = (params: WP_REST_API_Entity_QueryParams = {}) => {
	if (!params.page) {
		return getAllWPEntities<WP_REST_API_Product>('product');
	}
	return getWPEntities<WP_REST_API_Product>('product', params);
};

export const getWPOracleProducts = (
	params: WP_REST_API_Entity_QueryParams = {}
) => getWPEntities<WP_REST_API_Oracle_Product>('oracle_product', params);

export const getWPOracleProduct = (id: string | number) =>
	getWPEntity<WP_REST_API_Oracle_Product>('oracle_product', id);

export async function getWPEntities<T>(
	entityName: string,
	params: WP_REST_API_Entity_QueryParams
): Promise<T[]> {
	try {
		return await axios({
			method: 'GET',
			baseURL: WORDPRESS_API_ROOT,
			url: `/wp/v2/${entityName}`,
			params,
		}).then((response) => response.data);
	} catch (error) {
		if (
			error instanceof Error &&
			error.isAxiosError &&
			error.response?.status >= 400 &&
			error.response?.status < 500
		) {
			return [];
		}
		throw error;
	}
}

export async function getWPEntity<T>(
	entityName: string,
	id: string | number
): Promise<T> {
	return await axios({
		method: 'GET',
		baseURL: WORDPRESS_API_ROOT,
		url: `/wp/v2/${entityName}/${id}`,
	}).then((response) => response.data);
}

export async function getAllWPEntities<T>(entityName: string): Promise<T[]> {
	let result = [];
	const per_page = 100;
	let page = 1;
	while (true) {
		const pageEntities = await getWPEntities(entityName, {
			page,
			per_page,
		});
		if (!pageEntities || pageEntities.length === 0) {
			return result;
		}
		result = [...result, ...pageEntities];
		page++;
	}
}

export async function getWPMedia(mediaIds: number[]): Promise<WP_Media[]> {
	const mediaIdsUnique = Array.from(new Set(mediaIds)).filter(
		(id) => !isNaN(id)
	);
	if (mediaIdsUnique.length === 0) {
		return [];
	}
	const fieldsQuery = ['id', 'source_url', 'media_details', 'alt_text']
		.map((f) => `_fields[]=${f}`)
		.join('&');
	// TODO NEXT: 100 limit => code smell, need to paginate
	return await axios({
		method: 'GET',
		url: `${WORDPRESS_API_ROOT}/wp/v2/media?${fieldsQuery}&per_page=100&include=${mediaIdsUnique.join(
			','
		)}`,
	}).then((response) => response.data);
}
