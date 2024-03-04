import HomePage from '@diversifiedfinance/app/pages/home';
import axios from 'axios';

export async function getServerSideProps({ req, res }) {
	res.setHeader(
		'Cache-Control',
		'public, s-maxage=10, stale-while-revalidate=60'
	);

	try {
		const fetchResponse = await axios.get(
			`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/feed/projects`
		);
		const fallback = {
			'/api/feed/projects': fetchResponse.data,
		};

		if (fetchResponse.data) {
			return {
				props: {
					fallback,
				},
			};
		}
	} catch (e) {
		console.error(e);
	}

	return {
		props: {},
	};
}

export default HomePage;
