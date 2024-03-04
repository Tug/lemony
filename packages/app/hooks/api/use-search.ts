import useDebounce from '@diversifiedfinance/app/hooks/use-debounce';
import { swrFetcher } from '@diversifiedfinance/app/hooks/use-infinite-list-query';
import useSWR from 'swr';

export type SearchResponseItem = {
	id: number;
	name: string;
	username: string;
	verified: boolean;
	img_url: string;
	address0: string;
};

type SearchResponse = {
	results: Array<SearchResponseItem>;
};

export const useSearch = (term: string) => {
	const debouncedSearch = useDebounce(term, 200);
	const { data, error } = useSWR<SearchResponse>(
		term.length >= 2 && debouncedSearch
			? '/v2/search?q=' + debouncedSearch
			: null,
		swrFetcher
	);

	return {
		data: data?.results,
		loading: !data,
		error,
	};
};
