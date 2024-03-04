import { DateTimePickerProps } from './types';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export const DateTimePicker = (props: DateTimePickerProps) => {
	const { value, type, onChange, maximumDate, minimumDate, disabled } = props;
	return (
		<DatePicker
			selected={value}
			disabled={disabled}
			onChange={(date: any) => onChange(date)}
			showTimeSelect={type === 'datetime' || type === 'time'}
			showTimeSelectOnly={type === 'time'}
			maxDate={maximumDate}
			minDate={minimumDate}
			dateFormat={
				type === 'datetime'
					? 'MMMM d, yyyy h:mm aa'
					: type === 'time'
					? 'h:mm aa'
					: 'MMMM d, yyyy'
			}
		/>
	);
};
