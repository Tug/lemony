import { Text, View } from '@diversifiedfinance/design-system';

export function ObjectDetails({ data }) {
	return (
		<>
			{Object.keys(data ?? {}).map((property) => {
				return (
					<View tw="flex-row">
						<View>
							<Text tw={'font-bold text-black dark:text-white'}>
								{property}:{' '}
							</Text>
						</View>
						<View>
							{typeof data[property] === 'object' ? (
								<ObjectDetails data={data[property]} />
							) : (
								<Text tw="text-black dark:text-white">
									{data[property]?.toString?.()}
								</Text>
							)}
						</View>
					</View>
				);
			})}
		</>
	);
}
