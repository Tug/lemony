import { swrFetcher } from '@diversifiedfinance/app/hooks/use-infinite-list-query';
import { Project, WP_REST_API_Attachment } from '@diversifiedfinance/types';
import useSWRImmutable from 'swr/immutable';

export const useWordPressImage = (id: number) =>
	useSWRImmutable<
		Pick<
			WP_REST_API_Attachment,
			'id' | 'source_url' | 'media_details' | 'alt_text'
		>
	>(`/api/media/${id}`, swrFetcher);

export const useFirstProjectImage = (project?: Project) => {
	const slideshowBlock = project?.content?.find(
		({ blockName }) => blockName === 'jetpack/slideshow'
	);
	const firstImageId = slideshowBlock?.attrs.ids[0];
	const { data: firstImage } = useWordPressImage(firstImageId);
	return [firstImage, slideshowBlock?.attrs];
};

export const getFirstProjectImage = async (project?: Project) => {
	if (!project) {
		return undefined;
	}
	const slideshowBlock = project?.content?.find(
		({ blockName }) => blockName === 'jetpack/slideshow'
	);
	const firstImageId = slideshowBlock?.attrs.ids?.[0];
	if (!firstImageId) {
		return undefined;
	}
	const res = await swrFetcher(
		`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/media/${firstImageId}`
	);
	return res;
};
