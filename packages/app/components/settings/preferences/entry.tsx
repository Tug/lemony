import { Button, Text, View } from '@diversifiedfinance/design-system';
import {
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuItemTitle,
	DropdownMenuRoot,
	DropdownMenuTrigger,
} from '@diversifiedfinance/design-system/dropdown-menu';
import { Switch } from '@diversifiedfinance/design-system/switch';

interface PreferencesEntryProps<T> {
	preferenceName: string;
	currentValue: T;
	optionsValues?: Array<T>;
	optionsLabels?: (value: T) => string;
	onChange?: (newValue: T) => void;
}

export const PreferencesEntry = <T extends string | null | undefined>({
	preferenceName,
	currentValue,
	optionsValues,
	optionsLabels,
	onChange,
}: PreferencesEntryProps<T>) => {
	return (
		<View tw="flex-row items-center justify-between p-4">
			<Text tw="flex-1 text-base text-gray-900 dark:text-white">
				{preferenceName
					.replace(/_/g, ' ')
					.replace(/^\S/, (s) => s.toUpperCase())}
			</Text>
			<View tw="w-2" />
			<View tw="flex-row items-center">
				{typeof currentValue === 'boolean' ? (
					<Switch
						size="small"
						checked={currentValue}
						onChange={onChange}
					/>
				) : (
					<DropdownMenuRoot>
						<DropdownMenuTrigger>
							<Button variant="tertiary">
								<Text tw="text-sm text-gray-900 dark:text-white">
									{optionsLabels?.(currentValue) ??
										currentValue}
								</Text>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent loop>
							{optionsValues?.map((option, index) => (
								<DropdownMenuItem
									key={index.toString()}
									disabled={option === currentValue}
									onSelect={() => onChange?.(option)}
								>
									<DropdownMenuItemTitle tw="font-semibold text-gray-700 dark:text-neutral-300">
										{optionsLabels?.(option) ?? option}
									</DropdownMenuItemTitle>
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenuRoot>
				)}
			</View>
		</View>
	);
};

export const BooleanPreferencesEntry = ({
	preferenceName,
	currentValue,
	onChange,
}: PreferencesEntryProps<boolean>) => {
	return (
		<View tw="flex-row items-center justify-between p-4">
			<Text tw="flex-1 text-sm text-gray-900 dark:text-white">
				{preferenceName
					.replace(/_/g, ' ')
					.replace(/^\S/, (s) => s.toUpperCase())}
			</Text>
			<View tw="w-2" />
			<Switch
				checked={currentValue}
				onChange={() => onChange?.(!currentValue)}
			/>
		</View>
	);
};

export default PreferencesEntry;
