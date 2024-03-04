import { DropdownMenuItemIcon } from '@diversifiedfinance/design-system/dropdown-menu';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import { ComponentType } from 'react';
import { SvgProps } from 'react-native-svg';
import * as DropdownMenu from 'zeego/src/dropdown-menu';
import type { MenuItemIconProps as ZeegoMenuItemIconProps } from 'zeego/src/menu/types';
import { Platform } from 'react-native';

type MenuItemIconProps = ZeegoMenuItemIconProps & {
	Icon: ComponentType<SvgProps>;
};

export const MenuItemIcon = DropdownMenu.menuify(
	({ Icon, ...rest }: MenuItemIconProps) => {
		if (Platform.OS === 'web') {
			return (
				<DropdownMenuItemIcon style={{ marginRight: 8 }}>
					<Icon
						width="1em"
						height="1em"
						color={colors.gray[500]}
						{...rest}
					/>
				</DropdownMenuItemIcon>
			);
		}
		// see https://github.com/andrewtavis/sf-symbols-online
		// for a list of available ios icons
		return <DropdownMenu.ItemIcon {...rest} />;
	},
	'ItemIcon'
);
