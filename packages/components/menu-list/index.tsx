import { Link } from '@diversifiedfinance/app/navigation/link';
import { Text, View } from '@diversifiedfinance/design-system';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import ChevronRight from '@diversifiedfinance/design-system/icon/ChevronRight';
import { colors, TW } from '@diversifiedfinance/design-system/tailwind';
import React, { Fragment } from 'react';

const Separator = () => <View tw="h-px min-w-full bg-gray-300"></View>;

export interface MenuListProps {
	tw?: string | string[] | TW[];
	title?: string;
	list: Array<{
		label: string;
		value?: string;
		href: string;
		labelTw?: string;
		valueTw?: string;
		onPress?: (event: any) => void;
	}>;
	withSeparator?: boolean;
}

export const MenuList = ({
	tw,
	title,
	list,
	withSeparator = false,
}: MenuListProps) => {
	const isDark = useIsDarkMode();
	return (
		<View tw={tw}>
			{title && (
				<View tw="m-4">
					<Text tw="text-2xl font-bold text-black dark:text-white">
						{title}
					</Text>
				</View>
			)}
			<View tw="flex-col">
				{list.map(
					(
						{
							title: label,
							value,
							href,
							onPress,
							labelTw,
							valueTw,
						},
						index
					) => (
						<Fragment key={index.toString()}>
							<Link href={href} onPress={onPress}>
								<View tw="mx-4 my-4 flex-row items-center justify-between">
									<Text
										tw={[
											'text-base text-gray-900 dark:text-white',
											labelTw ?? '',
										]}
									>
										{label}
									</Text>
									<View tw="shrink flex-row items-center justify-end">
										{value && (
											<View tw="ml-8 shrink flex-row items-center justify-end">
												<Text
													numberOfLines={1}
													tw={[
														'text-ellipsis text-left text-sm text-gray-500 dark:text-gray-400',
														valueTw ?? '',
													]}
												>
													{value}
												</Text>
											</View>
										)}
										<View tw="h-8 w-8 items-center justify-center">
											<ChevronRight
												width={24}
												height={24}
												color={
													isDark
														? colors.gray[200]
														: colors.gray[700]
												}
											/>
										</View>
									</View>
								</View>
							</Link>
							{withSeparator && <Separator />}
						</Fragment>
					)
				)}
			</View>
		</View>
	);
};

export default MenuList;
