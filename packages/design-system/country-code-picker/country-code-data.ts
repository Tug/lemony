import i18n from '@diversifiedfinance/app/lib/i18n';

export type CountryDataType = {
	name: string;
	dial_code: string;
	code: string;
	emoji: string;
	nationality: string;
};

export const getCountryList = (t = i18n.t): Array<CountryDataType> => [
	{
		name: t('Afghanistan', { ns: 'design-system' }),
		dial_code: '+93',
		code: 'AF',
		emoji: '🇦🇫',
		nationality: 'Afghan',
	},
	{
		name: t('Aland Islands', { ns: 'design-system' }),
		dial_code: '+358',
		code: 'AX',
		emoji: '🇦🇽',
		nationality: 'Åland Island',
	},
	{
		name: t('Albania', { ns: 'design-system' }),
		dial_code: '+355',
		code: 'AL',
		emoji: '🇦🇱',
		nationality: 'Albanian',
	},
	{
		name: t('Algeria', { ns: 'design-system' }),
		dial_code: '+213',
		code: 'DZ',
		emoji: '🇩🇿',
		nationality: 'Algerian',
	},
	{
		name: t('American Samoa', { ns: 'design-system' }),
		dial_code: '+1684',
		code: 'AS',
		emoji: '🇦🇸',
		nationality: 'American Samoan',
	},
	{
		name: t('Andorra', { ns: 'design-system' }),
		dial_code: '+376',
		code: 'AD',
		emoji: '🇦🇩',
		nationality: 'Andorran',
	},
	{
		name: t('Angola', { ns: 'design-system' }),
		dial_code: '+244',
		code: 'AO',
		emoji: '🇦🇴',
		nationality: 'Angolan',
	},
	{
		name: t('Anguilla', { ns: 'design-system' }),
		dial_code: '+1264',
		code: 'AI',
		emoji: '🇦🇮',
		nationality: 'Anguillan',
	},
	{
		name: t('Antarctica', { ns: 'design-system' }),
		dial_code: '+672',
		code: 'AQ',
		emoji: '🇦🇶',
		nationality: 'Antarctic',
	},
	{
		name: t('Antigua and Barbuda', { ns: 'design-system' }),
		dial_code: '+1268',
		code: 'AG',
		emoji: '🇦🇬',
		nationality: 'Antiguan or Barbudan',
	},
	{
		name: t('Argentina', { ns: 'design-system' }),
		dial_code: '+54',
		code: 'AR',
		emoji: '🇦🇷',
		nationality: 'Argentine',
	},
	{
		name: t('Armenia', { ns: 'design-system' }),
		dial_code: '+374',
		code: 'AM',
		emoji: '🇦🇲',
		nationality: 'Armenian',
	},
	{
		name: t('Aruba', { ns: 'design-system' }),
		dial_code: '+297',
		code: 'AW',
		emoji: '🇦🇼',
		nationality: 'Aruban',
	},
	{
		name: t('Australia', { ns: 'design-system' }),
		dial_code: '+61',
		code: 'AU',
		emoji: '🇦🇺',
		nationality: 'Australian',
	},
	{
		name: t('Austria', { ns: 'design-system' }),
		dial_code: '+43',
		code: 'AT',
		emoji: '🇦🇹',
		nationality: 'Austrian',
	},
	{
		name: t('Azerbaijan', { ns: 'design-system' }),
		dial_code: '+994',
		code: 'AZ',
		emoji: '🇦🇿',
		nationality: 'Azerbaijani, Azeri',
	},
	{
		name: t('Bahamas', { ns: 'design-system' }),
		dial_code: '+1242',
		code: 'BS',
		emoji: '🇧🇸',
		nationality: 'Bahamian',
	},
	{
		name: t('Bahrain', { ns: 'design-system' }),
		dial_code: '+973',
		code: 'BH',
		emoji: '🇧🇭',
		nationality: 'Bahraini',
	},
	{
		name: t('Bangladesh', { ns: 'design-system' }),
		dial_code: '+880',
		code: 'BD',
		emoji: '🇧🇩',
		nationality: 'Bangladeshi',
	},
	{
		name: t('Barbados', { ns: 'design-system' }),
		dial_code: '+1246',
		code: 'BB',
		emoji: '🇧🇧',
		nationality: 'Barbadian',
	},
	{
		name: t('Belarus', { ns: 'design-system' }),
		dial_code: '+375',
		code: 'BY',
		emoji: '🇧🇾',
		nationality: 'Belarusian',
	},
	{
		name: t('Belgium', { ns: 'design-system' }),
		dial_code: '+32',
		code: 'BE',
		emoji: '🇧🇪',
		nationality: 'Belgian',
	},
	{
		name: t('Belize', { ns: 'design-system' }),
		dial_code: '+501',
		code: 'BZ',
		emoji: '🇧🇿',
		nationality: 'Belizean',
	},
	{
		name: t('Benin', { ns: 'design-system' }),
		dial_code: '+229',
		code: 'BJ',
		emoji: '🇧🇯',
		nationality: 'Beninese, Beninois',
	},
	{
		name: t('Bermuda', { ns: 'design-system' }),
		dial_code: '+1441',
		code: 'BM',
		emoji: '🇧🇲',
		nationality: 'Bermudian, Bermudan',
	},
	{
		name: t('Bhutan', { ns: 'design-system' }),
		dial_code: '+975',
		code: 'BT',
		emoji: '🇧🇹',
		nationality: 'Bhutanese',
	},
	{
		name: t('Bolivia, Plurinational State of', { ns: 'design-system' }),
		dial_code: '+591',
		code: 'BO',
		emoji: '🇧🇴',
		nationality: 'Bolivian',
	},
	{
		name: t('Bosnia and Herzegovina', { ns: 'design-system' }),
		dial_code: '+387',
		code: 'BA',
		emoji: '🇧🇦',
		nationality: 'Bosnian or Herzegovinian',
	},
	{
		name: t('Botswana', { ns: 'design-system' }),
		dial_code: '+267',
		code: 'BW',
		emoji: '🇧🇼',
		nationality: 'Motswana, Botswanan',
	},
	{
		name: t('Brazil', { ns: 'design-system' }),
		dial_code: '+55',
		code: 'BR',
		emoji: '🇧🇷',
		nationality: 'Brazilian',
	},
	{
		name: t('British Indian Ocean Territory', { ns: 'design-system' }),
		dial_code: '+246',
		code: 'IO',
		emoji: '🇮🇴',
		nationality: 'BIOT',
	},
	{
		name: t('Brunei Darussalam', { ns: 'design-system' }),
		dial_code: '+673',
		code: 'BN',
		emoji: '🇧🇳',
		nationality: 'Bruneian',
	},
	{
		name: t('Bulgaria', { ns: 'design-system' }),
		dial_code: '+359',
		code: 'BG',
		emoji: '🇧🇬',
		nationality: 'Bulgarian',
	},
	{
		name: t('Burkina Faso', { ns: 'design-system' }),
		dial_code: '+226',
		code: 'BF',
		emoji: '🇧🇫',
		nationality: 'Burkinabé',
	},
	{
		name: t('Burundi', { ns: 'design-system' }),
		dial_code: '+257',
		code: 'BI',
		emoji: '🇧🇮',
		nationality: 'Burundian',
	},
	{
		name: t('Cambodia', { ns: 'design-system' }),
		dial_code: '+855',
		code: 'KH',
		emoji: '🇰🇭',
		nationality: 'Cambodian',
	},
	{
		name: t('Cameroon', { ns: 'design-system' }),
		dial_code: '+237',
		code: 'CM',
		emoji: '🇨🇲',
		nationality: 'Cameroonian',
	},
	{
		name: t('Canada', { ns: 'design-system' }),
		dial_code: '+1',
		code: 'CA',
		emoji: '🇨🇦',
		nationality: 'Canadian',
	},
	{
		name: t('Cape Verde', { ns: 'design-system' }),
		dial_code: '+238',
		code: 'CV',
		emoji: '🇨🇻',
		nationality: 'Cabo Verdean',
	},
	{
		name: t('Cayman Islands', { ns: 'design-system' }),
		dial_code: '+ 345',
		code: 'KY',
		emoji: '🇰🇾',
		nationality: 'Caymanian',
	},
	{
		name: t('Central African Republic', { ns: 'design-system' }),
		dial_code: '+236',
		code: 'CF',
		emoji: '🇨🇫',
		nationality: 'Central African',
	},
	{
		name: t('Chad', { ns: 'design-system' }),
		dial_code: '+235',
		code: 'TD',
		emoji: '🇹🇩',
		nationality: 'Chadian',
	},
	{
		name: t('Chile', { ns: 'design-system' }),
		dial_code: '+56',
		code: 'CL',
		emoji: '🇨🇱',
		nationality: 'Chilean',
	},
	{
		name: t('China', { ns: 'design-system' }),
		dial_code: '+86',
		code: 'CN',
		emoji: '🇨🇳',
		nationality: 'Chinese',
	},
	{
		name: t('Christmas Island', { ns: 'design-system' }),
		dial_code: '+61',
		code: 'CX',
		emoji: '🇨🇽',
		nationality: 'Christmas Island',
	},
	{
		name: t('Cocos (Keeling) Islands', { ns: 'design-system' }),
		dial_code: '+61',
		code: 'CC',
		emoji: '🇨🇨',
		nationality: 'Cocos Island',
	},
	{
		name: t('Colombia', { ns: 'design-system' }),
		dial_code: '+57',
		code: 'CO',
		emoji: '🇨🇴',
		nationality: 'Colombian',
	},
	{
		name: t('Comoros', { ns: 'design-system' }),
		dial_code: '+269',
		code: 'KM',
		emoji: '🇰🇲',
		nationality: 'Comoran, Comorian',
	},
	{
		name: t('Congo', { ns: 'design-system' }),
		dial_code: '+242',
		code: 'CG',
		emoji: '🇨🇬',
		nationality: 'Congolese',
	},
	{
		name: t('Congo, The Democratic Republic of the Congo', {
			ns: 'design-system',
		}),
		dial_code: '+243',
		code: 'CD',
		emoji: '🇨🇩',
		nationality: 'Congolese',
	},
	{
		name: t('Cook Islands', { ns: 'design-system' }),
		dial_code: '+682',
		code: 'CK',
		emoji: '🇨🇰',
		nationality: 'Cook Island',
	},
	{
		name: t('Costa Rica', { ns: 'design-system' }),
		dial_code: '+506',
		code: 'CR',
		emoji: '🇨🇷',
		nationality: 'Costa Rican',
	},
	{
		name: t("Cote d'Ivoire"),
		dial_code: '+225',
		code: 'CI',
		emoji: '🇨🇮',
		nationality: 'Ivorian',
	},
	{
		name: t('Croatia', { ns: 'design-system' }),
		dial_code: '+385',
		code: 'HR',
		emoji: '🇭🇷',
		nationality: 'Croatian',
	},
	{
		name: t('Cuba', { ns: 'design-system' }),
		dial_code: '+53',
		code: 'CU',
		emoji: '🇨🇺',
		nationality: 'Cuban',
	},
	{
		name: t('Cyprus', { ns: 'design-system' }),
		dial_code: '+357',
		code: 'CY',
		emoji: '🇨🇾',
		nationality: 'Cypriot',
	},
	{
		name: t('Czech Republic', { ns: 'design-system' }),
		dial_code: '+420',
		code: 'CZ',
		emoji: '🇨🇿',
		nationality: 'Czech',
	},
	{
		name: t('Denmark', { ns: 'design-system' }),
		dial_code: '+45',
		code: 'DK',
		emoji: '🇩🇰',
		nationality: 'Danish',
	},
	{
		name: t('Djibouti', { ns: 'design-system' }),
		dial_code: '+253',
		code: 'DJ',
		emoji: '🇩🇯',
		nationality: 'Djiboutian',
	},
	{
		name: t('Dominica', { ns: 'design-system' }),
		dial_code: '+1767',
		code: 'DM',
		emoji: '🇩🇲',
		nationality: 'Dominican',
	},
	{
		name: t('Dominican Republic', { ns: 'design-system' }),
		dial_code: '+1849',
		code: 'DO',
		emoji: '🇩🇴',
		nationality: 'Dominican',
	},
	{
		name: t('Ecuador', { ns: 'design-system' }),
		dial_code: '+593',
		code: 'EC',
		emoji: '🇪🇨',
		nationality: 'Ecuadorian',
	},
	{
		name: t('Egypt', { ns: 'design-system' }),
		dial_code: '+20',
		code: 'EG',
		emoji: '🇪🇬',
		nationality: 'Egyptian',
	},
	{
		name: t('El Salvador', { ns: 'design-system' }),
		dial_code: '+503',
		code: 'SV',
		emoji: '🇸🇻',
		nationality: 'Salvadoran',
	},
	{
		name: t('Equatorial Guinea', { ns: 'design-system' }),
		dial_code: '+240',
		code: 'GQ',
		emoji: '🇬🇶',
		nationality: 'Equatorial Guinean, Equatoguinean',
	},
	{
		name: t('Eritrea', { ns: 'design-system' }),
		dial_code: '+291',
		code: 'ER',
		emoji: '🇪🇷',
		nationality: 'Eritrean',
	},
	{
		name: t('Estonia', { ns: 'design-system' }),
		dial_code: '+372',
		code: 'EE',
		emoji: '🇪🇪',
		nationality: 'Estonian',
	},
	{
		name: t('Ethiopia', { ns: 'design-system' }),
		dial_code: '+251',
		code: 'ET',
		emoji: '🇪🇹',
		nationality: 'Ethiopian',
	},
	{
		name: t('Falkland Islands (Malvinas)', { ns: 'design-system' }),
		dial_code: '+500',
		code: 'FK',
		emoji: '🇫🇰',
		nationality: 'Falkland Island',
	},
	{
		name: t('Faroe Islands', { ns: 'design-system' }),
		dial_code: '+298',
		code: 'FO',
		emoji: '🇫🇴',
		nationality: 'Faroese',
	},
	{
		name: t('Fiji', { ns: 'design-system' }),
		dial_code: '+679',
		code: 'FJ',
		emoji: '🇫🇯',
		nationality: 'Fijian',
	},
	{
		name: t('Finland', { ns: 'design-system' }),
		dial_code: '+358',
		code: 'FI',
		emoji: '🇫🇮',
		nationality: 'Finnish',
	},
	{
		name: t('France', { ns: 'design-system' }),
		dial_code: '+33',
		code: 'FR',
		emoji: '🇫🇷',
		nationality: 'French',
	},
	{
		name: t('French Guiana', { ns: 'design-system' }),
		dial_code: '+594',
		code: 'GF',
		emoji: '🇬🇫',
		nationality: 'French Guianese',
	},
	{
		name: t('French Polynesia', { ns: 'design-system' }),
		dial_code: '+689',
		code: 'PF',
		emoji: '🇵🇫',
		nationality: 'French Polynesian',
	},
	{
		name: t('Gabon', { ns: 'design-system' }),
		dial_code: '+241',
		code: 'GA',
		emoji: '🇬🇦',
		nationality: 'Gabonese',
	},
	{
		name: t('Gambia', { ns: 'design-system' }),
		dial_code: '+220',
		code: 'GM',
		emoji: '🇬🇲',
		nationality: 'Gambian',
	},
	{
		name: t('Georgia', { ns: 'design-system' }),
		dial_code: '+995',
		code: 'GE',
		emoji: '🇬🇪',
		nationality: 'Georgian',
	},
	{
		name: t('Germany', { ns: 'design-system' }),
		dial_code: '+49',
		code: 'DE',
		emoji: '🇩🇪',
		nationality: 'German',
	},
	{
		name: t('Ghana', { ns: 'design-system' }),
		dial_code: '+233',
		code: 'GH',
		emoji: '🇬🇭',
		nationality: 'Ghanaian',
	},
	{
		name: t('Gibraltar', { ns: 'design-system' }),
		dial_code: '+350',
		code: 'GI',
		emoji: '🇬🇮',
		nationality: 'Gibraltar',
	},
	{
		name: t('Greece', { ns: 'design-system' }),
		dial_code: '+30',
		code: 'GR',
		emoji: '🇬🇷',
		nationality: 'Greek, Hellenic',
	},
	{
		name: t('Greenland', { ns: 'design-system' }),
		dial_code: '+299',
		code: 'GL',
		emoji: '🇬🇱',
		nationality: 'Greenlandic',
	},
	{
		name: t('Grenada', { ns: 'design-system' }),
		dial_code: '+1473',
		code: 'GD',
		emoji: '🇬🇩',
		nationality: 'Grenadian',
	},
	{
		name: t('Guadeloupe', { ns: 'design-system' }),
		dial_code: '+590',
		code: 'GP',
		emoji: '🇬🇵',
		nationality: 'Guadeloupe',
	},
	{
		name: t('Guam', { ns: 'design-system' }),
		dial_code: '+1671',
		code: 'GU',
		emoji: '🇬🇺',
		nationality: 'Guamanian, Guambat',
	},
	{
		name: t('Guatemala', { ns: 'design-system' }),
		dial_code: '+502',
		code: 'GT',
		emoji: '🇬🇹',
		nationality: 'Guatemalan',
	},
	{
		name: t('Guernsey', { ns: 'design-system' }),
		dial_code: '+44',
		code: 'GG',
		emoji: '🇬🇬',
		nationality: 'Channel Island',
	},
	{
		name: t('Guinea', { ns: 'design-system' }),
		dial_code: '+224',
		code: 'GN',
		emoji: '🇬🇳',
		nationality: 'Guinean',
	},
	{
		name: t('Guinea-Bissau', { ns: 'design-system' }),
		dial_code: '+245',
		code: 'GW',
		emoji: '🇬🇼',
		nationality: 'Bissau-Guinean',
	},
	{
		name: t('Guyana', { ns: 'design-system' }),
		dial_code: '+595',
		code: 'GY',
		emoji: '🇬🇾',
		nationality: 'Guyanese',
	},
	{
		name: t('Haiti', { ns: 'design-system' }),
		dial_code: '+509',
		code: 'HT',
		emoji: '🇭🇹',
		nationality: 'Haitian',
	},
	{
		name: t('Holy See (Vatican City State)', { ns: 'design-system' }),
		dial_code: '+379',
		code: 'VA',
		emoji: '🇻🇦',
		nationality: 'Vatican',
	},
	{
		name: t('Honduras', { ns: 'design-system' }),
		dial_code: '+504',
		code: 'HN',
		emoji: '🇭🇳',
		nationality: 'Honduran',
	},
	{
		name: t('Hong Kong', { ns: 'design-system' }),
		dial_code: '+852',
		code: 'HK',
		emoji: '🇭🇰',
		nationality: 'Hong Kong, Hong Kongese',
	},
	{
		name: t('Hungary', { ns: 'design-system' }),
		dial_code: '+36',
		code: 'HU',
		emoji: '🇭🇺',
		nationality: 'Hungarian, Magyar',
	},
	{
		name: t('Iceland', { ns: 'design-system' }),
		dial_code: '+354',
		code: 'IS',
		emoji: '🇮🇸',
		nationality: 'Icelandic',
	},
	{
		name: t('India', { ns: 'design-system' }),
		dial_code: '+91',
		code: 'IN',
		emoji: '🇮🇳',
		nationality: 'Indian',
	},
	{
		name: t('Indonesia', { ns: 'design-system' }),
		dial_code: '+62',
		code: 'ID',
		emoji: '🇮🇩',
		nationality: 'Indonesian',
	},
	{
		name: t('Iran, Islamic Republic of Persian Gulf', {
			ns: 'design-system',
		}),
		dial_code: '+98',
		code: 'IR',
		emoji: '🇮🇷',
		nationality: 'Iranian, Persian',
	},
	{
		name: t('Iraq', { ns: 'design-system' }),
		dial_code: '+964',
		code: 'IQ',
		emoji: '🇮🇶',
		nationality: 'Iraqi',
	},
	{
		name: t('Ireland', { ns: 'design-system' }),
		dial_code: '+353',
		code: 'IE',
		emoji: '🇮🇪',
		nationality: 'Irish',
	},
	{
		name: t('Isle of Man', { ns: 'design-system' }),
		dial_code: '+44',
		code: 'IM',
		emoji: '🇮🇲',
		nationality: 'Manx',
	},
	{
		name: t('Israel', { ns: 'design-system' }),
		dial_code: '+972',
		code: 'IL',
		emoji: '🇮🇱',
		nationality: 'Israeli',
	},
	{
		name: t('Italy', { ns: 'design-system' }),
		dial_code: '+39',
		code: 'IT',
		emoji: '🇮🇹',
		nationality: 'Italian',
	},
	{
		name: t('Jamaica', { ns: 'design-system' }),
		dial_code: '+1876',
		code: 'JM',
		emoji: '🇯🇲',
		nationality: 'Jamaican',
	},
	{
		name: t('Japan', { ns: 'design-system' }),
		dial_code: '+81',
		code: 'JP',
		emoji: '🗾',
		nationality: 'Japanese',
	},
	{
		name: t('Jersey', { ns: 'design-system' }),
		dial_code: '+44',
		code: 'JE',
		emoji: '🇯🇪',
		nationality: 'Channel Island',
	},
	{
		name: t('Jordan', { ns: 'design-system' }),
		dial_code: '+962',
		code: 'JO',
		emoji: '🇯🇴',
		nationality: 'Jordanian',
	},
	{
		name: t('Kazakhstan', { ns: 'design-system' }),
		dial_code: '+77',
		code: 'KZ',
		emoji: '🇰🇿',
		nationality: 'Kazakhstani, Kazakh',
	},
	{
		name: t('Kenya', { ns: 'design-system' }),
		dial_code: '+254',
		code: 'KE',
		emoji: '🇰🇪',
		nationality: 'Kenyan',
	},
	{
		name: t('Kiribati', { ns: 'design-system' }),
		dial_code: '+686',
		code: 'KI',
		emoji: '🇰🇮',
		nationality: 'I-Kiribati',
	},
	{
		name: t("Korea, Democratic People's Republic of Korea"),
		dial_code: '+850',
		code: 'KP',
		emoji: '🇰🇵',
		nationality: 'North Korean',
	},
	{
		name: t('Korea, Republic of South Korea', { ns: 'design-system' }),
		dial_code: '+82',
		code: 'KR',
		emoji: '🇰🇷',
		nationality: 'South Korean',
	},
	{
		name: t('Kuwait', { ns: 'design-system' }),
		dial_code: '+965',
		code: 'KW',
		emoji: '🇰🇼',
		nationality: 'Kuwaiti',
	},
	{
		name: t('Kyrgyzstan', { ns: 'design-system' }),
		dial_code: '+996',
		code: 'KG',
		emoji: '🇰🇬',
		nationality: 'Kyrgyzstani, Kyrgyz, Kirgiz, Kirghiz',
	},
	{
		name: t('Laos', { ns: 'design-system' }),
		dial_code: '+856',
		code: 'LA',
		emoji: '🇱🇦',
		nationality: 'Lao, Laotian',
	},
	{
		name: t('Latvia', { ns: 'design-system' }),
		dial_code: '+371',
		code: 'LV',
		emoji: '🇱🇻',
		nationality: 'Latvian',
	},
	{
		name: t('Lebanon', { ns: 'design-system' }),
		dial_code: '+961',
		code: 'LB',
		emoji: '🇱🇧',
		nationality: 'Lebanese',
	},
	{
		name: t('Lesotho', { ns: 'design-system' }),
		dial_code: '+266',
		code: 'LS',
		emoji: '🇱🇸',
		nationality: 'Basotho',
	},
	{
		name: t('Liberia', { ns: 'design-system' }),
		dial_code: '+231',
		code: 'LR',
		emoji: '🇱🇷',
		nationality: 'Liberian',
	},
	{
		name: t('Libyan Arab Jamahiriya', { ns: 'design-system' }),
		dial_code: '+218',
		code: 'LY',
		emoji: '🇱🇾',
		nationality: 'Libyan',
	},
	{
		name: t('Liechtenstein', { ns: 'design-system' }),
		dial_code: '+423',
		code: 'LI',
		emoji: '🇱🇮',
		nationality: 'Liechtenstein',
	},
	{
		name: t('Lithuania', { ns: 'design-system' }),
		dial_code: '+370',
		code: 'LT',
		emoji: '🇱🇹',
		nationality: 'Lithuanian',
	},
	{
		name: t('Luxembourg', { ns: 'design-system' }),
		dial_code: '+352',
		code: 'LU',
		emoji: '🇱🇺',
		nationality: 'Luxembourg, Luxembourgish',
	},
	{
		name: t('Macao', { ns: 'design-system' }),
		dial_code: '+853',
		code: 'MO',
		emoji: '🇲🇴',
		nationality: 'Macanese, Chinese',
	},
	{
		name: t('Macedonia', { ns: 'design-system' }),
		dial_code: '+389',
		code: 'MK',
		emoji: '🇲🇰',
		nationality: 'Macedonian',
	},
	{
		name: t('Madagascar', { ns: 'design-system' }),
		dial_code: '+261',
		code: 'MG',
		emoji: '🇲🇬',
		nationality: 'Malagasy',
	},
	{
		name: t('Malawi', { ns: 'design-system' }),
		dial_code: '+265',
		code: 'MW',
		emoji: '🇲🇼',
		nationality: 'Malawian',
	},
	{
		name: t('Malaysia', { ns: 'design-system' }),
		dial_code: '+60',
		code: 'MY',
		emoji: '🇲🇾',
		nationality: 'Malaysian',
	},
	{
		name: t('Maldives', { ns: 'design-system' }),
		dial_code: '+960',
		code: 'MV',
		emoji: '🇲🇻',
		nationality: 'Maldivian',
	},
	{
		name: t('Mali', { ns: 'design-system' }),
		dial_code: '+223',
		code: 'ML',
		emoji: '🇲🇱',
		nationality: 'Malian, Malinese',
	},
	{
		name: t('Malta', { ns: 'design-system' }),
		dial_code: '+356',
		code: 'MT',
		emoji: '🇲🇹',
		nationality: 'Maltese',
	},
	{
		name: t('Marshall Islands', { ns: 'design-system' }),
		dial_code: '+692',
		code: 'MH',
		emoji: '🇲🇭',
		nationality: 'Marshallese',
	},
	{
		name: t('Martinique', { ns: 'design-system' }),
		dial_code: '+596',
		code: 'MQ',
		emoji: '🇲🇶',
		nationality: 'Martiniquais, Martinican',
	},
	{
		name: t('Mauritania', { ns: 'design-system' }),
		dial_code: '+222',
		code: 'MR',
		emoji: '🇲🇷',
		nationality: 'Mauritanian',
	},
	{
		name: t('Mauritius', { ns: 'design-system' }),
		dial_code: '+230',
		code: 'MU',
		emoji: '🇲🇺',
		nationality: 'Mauritian',
	},
	{
		name: t('Mayotte', { ns: 'design-system' }),
		dial_code: '+262',
		code: 'YT',
		emoji: '🇾🇹',
		nationality: 'Mahoran',
	},
	{
		name: t('Mexico', { ns: 'design-system' }),
		dial_code: '+52',
		code: 'MX',
		emoji: '🇲🇽',
		nationality: 'Mexican',
	},
	{
		name: t('Micronesia, Federated States of Micronesia', {
			ns: 'design-system',
		}),
		dial_code: '+691',
		code: 'FM',
		emoji: '🇫🇲',
		nationality: 'Micronesian',
	},
	{
		name: t('Moldova', { ns: 'design-system' }),
		dial_code: '+373',
		code: 'MD',
		emoji: '🇲🇩',
		nationality: 'Moldovan',
	},
	{
		name: t('Monaco', { ns: 'design-system' }),
		dial_code: '+377',
		code: 'MC',
		emoji: '🇲🇨',
		nationality: 'Monégasque, Monacan',
	},
	{
		name: t('Mongolia', { ns: 'design-system' }),
		dial_code: '+976',
		code: 'MN',
		emoji: '🇲🇳',
		nationality: 'Mongolian',
	},
	{
		name: t('Montenegro', { ns: 'design-system' }),
		dial_code: '+382',
		code: 'ME',
		emoji: '🇲🇪',
		nationality: 'Montenegrin',
	},
	{
		name: t('Montserrat', { ns: 'design-system' }),
		dial_code: '+1664',
		code: 'MS',
		emoji: '🇲🇸',
		nationality: 'Montserratian',
	},
	{
		name: t('Morocco', { ns: 'design-system' }),
		dial_code: '+212',
		code: 'MA',
		emoji: '🇲🇦',
		nationality: 'Moroccan',
	},
	{
		name: t('Mozambique', { ns: 'design-system' }),
		dial_code: '+258',
		code: 'MZ',
		emoji: '🇲🇿',
		nationality: 'Mozambican',
	},
	{
		name: t('Myanmar', { ns: 'design-system' }),
		dial_code: '+95',
		code: 'MM',
		emoji: '🇲🇲',
		nationality: 'Burmese',
	},
	{
		name: t('Namibia', { ns: 'design-system' }),
		dial_code: '+264',
		code: 'NA',
		emoji: '🇳🇦',
		nationality: 'Namibian',
	},
	{
		name: t('Nauru', { ns: 'design-system' }),
		dial_code: '+674',
		code: 'NR',
		emoji: '🇳🇷',
		nationality: 'Nauruan',
	},
	{
		name: t('Nepal', { ns: 'design-system' }),
		dial_code: '+977',
		code: 'NP',
		emoji: '🇳🇵',
		nationality: 'Nepali, Nepalese',
	},
	{
		name: t('Netherlands', { ns: 'design-system' }),
		dial_code: '+31',
		code: 'NL',
		emoji: '🇳🇱',
		nationality: 'Dutch, Netherlandic',
	},
	{
		name: t('New Caledonia', { ns: 'design-system' }),
		dial_code: '+687',
		code: 'NC',
		emoji: '🇳🇨',
		nationality: 'New Caledonian',
	},
	{
		name: t('New Zealand', { ns: 'design-system' }),
		dial_code: '+64',
		code: 'NZ',
		emoji: '🇳🇿',
		nationality: 'New Zealand, NZ',
	},
	{
		name: t('Nicaragua', { ns: 'design-system' }),
		dial_code: '+505',
		code: 'NI',
		emoji: '🇳🇮',
		nationality: 'Nicaraguan',
	},
	{
		name: t('Niger', { ns: 'design-system' }),
		dial_code: '+227',
		code: 'NE',
		emoji: '🇳🇪',
		nationality: 'Nigerien',
	},
	{
		name: t('Nigeria', { ns: 'design-system' }),
		dial_code: '+234',
		code: 'NG',
		emoji: '🇳🇬',
		nationality: 'Nigerian',
	},
	{
		name: t('Niue', { ns: 'design-system' }),
		dial_code: '+683',
		code: 'NU',
		emoji: '🇳🇺',
		nationality: 'Niuean',
	},
	{
		name: t('Norfolk Island', { ns: 'design-system' }),
		dial_code: '+672',
		code: 'NF',
		emoji: '🇳🇫',
		nationality: 'Norfolk Island',
	},
	{
		name: t('Northern Mariana Islands', { ns: 'design-system' }),
		dial_code: '+1670',
		code: 'MP',
		emoji: '🇲🇵',
		nationality: 'Northern Marianan',
	},
	{
		name: t('Norway', { ns: 'design-system' }),
		dial_code: '+47',
		code: 'NO',
		emoji: '🇳🇴',
		nationality: 'Norwegian',
	},
	{
		name: t('Oman', { ns: 'design-system' }),
		dial_code: '+968',
		code: 'OM',
		emoji: '🇴🇲',
		nationality: 'Omani',
	},
	{
		name: t('Pakistan', { ns: 'design-system' }),
		dial_code: '+92',
		code: 'PK',
		emoji: '🇵🇰',
		nationality: 'Pakistani',
	},
	{
		name: t('Palau', { ns: 'design-system' }),
		dial_code: '+680',
		code: 'PW',
		emoji: '🇵🇼',
		nationality: 'Palauan',
	},
	{
		name: t('Palestinian Territory, Occupied', { ns: 'design-system' }),
		dial_code: '+970',
		code: 'PS',
		emoji: '🇵🇸',
		nationality: 'Palestinian',
	},
	{
		name: t('Panama', { ns: 'design-system' }),
		dial_code: '+507',
		code: 'PA',
		emoji: '🇵🇦',
		nationality: 'Panamanian',
	},
	{
		name: t('Papua New Guinea', { ns: 'design-system' }),
		dial_code: '+675',
		code: 'PG',
		emoji: '🇵🇬',
		nationality: 'Papua New Guinean, Papuan',
	},
	{
		name: t('Paraguay', { ns: 'design-system' }),
		dial_code: '+595',
		code: 'PY',
		emoji: '🇵🇾',
		nationality: 'Paraguayan',
	},
	{
		name: t('Peru', { ns: 'design-system' }),
		dial_code: '+51',
		code: 'PE',
		emoji: '🇵🇪',
		nationality: 'Peruvian',
	},
	{
		name: t('Philippines', { ns: 'design-system' }),
		dial_code: '+63',
		code: 'PH',
		emoji: '🇵🇭',
		nationality: 'Philippine, Filipino',
	},
	{
		name: t('Pitcairn', { ns: 'design-system' }),
		dial_code: '+872',
		code: 'PN',
		emoji: '🇵🇳',
		nationality: 'Pitcairn Island',
	},
	{
		name: t('Poland', { ns: 'design-system' }),
		dial_code: '+48',
		code: 'PL',
		emoji: '🇵🇱',
		nationality: 'Polish',
	},
	{
		name: t('Portugal', { ns: 'design-system' }),
		dial_code: '+351',
		code: 'PT',
		emoji: '🇵🇹',
		nationality: 'Portuguese',
	},
	{
		name: t('Puerto Rico', { ns: 'design-system' }),
		dial_code: '+1939',
		code: 'PR',
		emoji: '🇵🇷',
		nationality: 'Puerto Rican',
	},
	{
		name: t('Qatar', { ns: 'design-system' }),
		dial_code: '+974',
		code: 'QA',
		emoji: '🇶🇦',
		nationality: 'Qatari',
	},
	{
		name: t('Romania', { ns: 'design-system' }),
		dial_code: '+40',
		code: 'RO',
		emoji: '🇷🇴',
		nationality: 'Romanian',
	},
	{
		name: t('Russia', { ns: 'design-system' }),
		dial_code: '+7',
		code: 'RU',
		emoji: '🇷🇺',
		nationality: 'Russian',
	},
	{
		name: t('Rwanda', { ns: 'design-system' }),
		dial_code: '+250',
		code: 'RW',
		emoji: '🇷🇼',
		nationality: 'Rwandan',
	},
	{
		name: t('Reunion', { ns: 'design-system' }),
		dial_code: '+262',
		code: 'RE',
		emoji: '🇷🇪',
		nationality: 'Réunionese, Réunionnais',
	},
	{
		name: t('Saint Barthelemy', { ns: 'design-system' }),
		dial_code: '+590',
		code: 'BL',
		emoji: '🇧🇱',
		nationality: 'Barthélemois',
	},
	{
		name: t('Saint Helena, Ascension and Tristan Da Cunha', {
			ns: 'design-system',
		}),
		dial_code: '+290',
		code: 'SH',
		emoji: '🇸🇭',
		nationality: 'Saint Helenian',
	},
	{
		name: t('Saint Kitts and Nevis', { ns: 'design-system' }),
		dial_code: '+1869',
		code: 'KN',
		emoji: '🇰🇳',
		nationality: 'Kittitian or Nevisian',
	},
	{
		name: t('Saint Lucia', { ns: 'design-system' }),
		dial_code: '+1758',
		code: 'LC',
		emoji: '🇱🇨',
		nationality: 'Saint Lucian',
	},
	{
		name: t('Saint Martin', { ns: 'design-system' }),
		dial_code: '+590',
		code: 'MF',
		emoji: '🇫🇷',
		nationality: 'Saint-Martinoise',
	},
	{
		name: t('Saint Pierre and Miquelon', { ns: 'design-system' }),
		dial_code: '+508',
		code: 'PM',
		emoji: '🇵🇲',
		nationality: 'Saint-Pierrais or Miquelonnais',
	},
	{
		name: t('Saint Vincent and the Grenadines', { ns: 'design-system' }),
		dial_code: '+1784',
		code: 'VC',
		emoji: '🇻🇨',
		nationality: 'Saint Vincentian, Vincentian',
	},
	{
		name: t('Samoa', { ns: 'design-system' }),
		dial_code: '+685',
		code: 'WS',
		emoji: '🇼🇸',
		nationality: 'Samoan',
	},
	{
		name: t('San Marino', { ns: 'design-system' }),
		dial_code: '+378',
		code: 'SM',
		emoji: '🇸🇲',
		nationality: 'Sammarinese',
	},
	{
		name: t('Sao Tome and Principe', { ns: 'design-system' }),
		dial_code: '+239',
		code: 'ST',
		emoji: '🇸🇹',
		nationality: 'São Toméan',
	},
	{
		name: t('Saudi Arabia', { ns: 'design-system' }),
		dial_code: '+966',
		code: 'SA',
		emoji: '🇸🇦',
		nationality: 'Saudi, Saudi Arabian',
	},
	{
		name: t('Senegal', { ns: 'design-system' }),
		dial_code: '+221',
		code: 'SN',
		emoji: '🇸🇳',
		nationality: 'Senegalese',
	},
	{
		name: t('Serbia', { ns: 'design-system' }),
		dial_code: '+381',
		code: 'RS',
		emoji: '🇷🇸',
		nationality: 'Serbian',
	},
	{
		name: t('Seychelles', { ns: 'design-system' }),
		dial_code: '+248',
		code: 'SC',
		emoji: '🇸🇨',
		nationality: 'Seychellois',
	},
	{
		name: t('Sierra Leone', { ns: 'design-system' }),
		dial_code: '+232',
		code: 'SL',
		emoji: '🇸🇱',
		nationality: 'Sierra Leonean',
	},
	{
		name: t('Singapore', { ns: 'design-system' }),
		dial_code: '+65',
		code: 'SG',
		emoji: '🇸🇬',
		nationality: 'Singaporean',
	},
	{
		name: t('Slovakia', { ns: 'design-system' }),
		dial_code: '+421',
		code: 'SK',
		emoji: '🇸🇰',
		nationality: 'Slovak',
	},
	{
		name: t('Slovenia', { ns: 'design-system' }),
		dial_code: '+386',
		code: 'SI',
		emoji: '🇸🇮',
		nationality: 'Slovenian, Slovene',
	},
	{
		name: t('Solomon Islands', { ns: 'design-system' }),
		dial_code: '+677',
		code: 'SB',
		emoji: '🇸🇧',
		nationality: 'Solomon Island',
	},
	{
		name: t('Somalia', { ns: 'design-system' }),
		dial_code: '+252',
		code: 'SO',
		emoji: '🇸🇴',
		nationality: 'Somali, Somalian',
	},
	{
		name: t('South Africa', { ns: 'design-system' }),
		dial_code: '+27',
		code: 'ZA',
		emoji: '🇿🇦',
		nationality: 'South African',
	},
	{
		name: t('South Sudan', { ns: 'design-system' }),
		dial_code: '+211',
		code: 'SS',
		emoji: '🇸🇸',
		nationality: 'South Sudanese',
	},
	{
		name: t('South Georgia and the South Sandwich Islands', {
			ns: 'design-system',
		}),
		dial_code: '+500',
		code: 'GS',
		emoji: '🇬🇸',
		nationality: 'South Georgia or South Sandwich Islands',
	},
	{
		name: t('Spain', { ns: 'design-system' }),
		dial_code: '+34',
		code: 'ES',
		emoji: '🇪🇸',
		nationality: 'Spanish',
	},
	{
		name: t('Sri Lanka', { ns: 'design-system' }),
		dial_code: '+94',
		code: 'LK',
		emoji: '🇱🇰',
		nationality: 'Sri Lankan',
	},
	{
		name: t('Sudan', { ns: 'design-system' }),
		dial_code: '+249',
		code: 'SD',
		emoji: '🇸🇩',
		nationality: 'Sudanese',
	},
	{
		name: t('Suriname', { ns: 'design-system' }),
		dial_code: '+597',
		code: 'SR',
		emoji: '🇸🇷',
		nationality: 'Surinamese',
	},
	{
		name: t('Svalbard and Jan Mayen', { ns: 'design-system' }),
		dial_code: '+47',
		code: 'SJ',
		emoji: '🇳🇴',
		nationality: 'Svalbard',
	},
	{
		name: t('Swaziland', { ns: 'design-system' }),
		dial_code: '+268',
		code: 'SZ',
		emoji: '🇸🇿',
		nationality: 'Swazi',
	},
	{
		name: t('Sweden', { ns: 'design-system' }),
		dial_code: '+46',
		code: 'SE',
		emoji: '🇸🇪',
		nationality: 'Swedish',
	},
	{
		name: t('Switzerland', { ns: 'design-system' }),
		dial_code: '+41',
		code: 'CH',
		emoji: '🇨🇭',
		nationality: 'Swiss',
	},
	{
		name: t('Syrian Arab Republic', { ns: 'design-system' }),
		dial_code: '+963',
		code: 'SY',
		emoji: '🇸🇾',
		nationality: 'Syrian',
	},
	{
		name: t('Taiwan', { ns: 'design-system' }),
		dial_code: '+886',
		code: 'TW',
		emoji: '🇹🇼',
		nationality: 'Chinese, Taiwanese',
	},
	{
		name: t('Tajikistan', { ns: 'design-system' }),
		dial_code: '+992',
		code: 'TJ',
		emoji: '🇹🇯',
		nationality: 'Tajikistani',
	},
	{
		name: t('Tanzania, United Republic of Tanzania', {
			ns: 'design-system',
		}),
		dial_code: '+255',
		code: 'TZ',
		emoji: '🇹🇿',
		nationality: 'Tanzanian',
	},
	{
		name: t('Thailand', { ns: 'design-system' }),
		dial_code: '+66',
		code: 'TH',
		emoji: '🇹🇭',
		nationality: 'Thai',
	},
	{
		name: t('Timor-Leste', { ns: 'design-system' }),
		dial_code: '+670',
		code: 'TL',
		emoji: '🇹🇱',
		nationality: 'Timorese',
	},
	{
		name: t('Togo', { ns: 'design-system' }),
		dial_code: '+228',
		code: 'TG',
		emoji: '🇹🇬',
		nationality: 'Togolese',
	},
	{
		name: t('Tokelau', { ns: 'design-system' }),
		dial_code: '+690',
		code: 'TK',
		emoji: '🇹🇰',
		nationality: 'Tokelauan',
	},
	{
		name: t('Tonga', { ns: 'design-system' }),
		dial_code: '+676',
		code: 'TO',
		emoji: '🇹🇴',
		nationality: 'Tongan',
	},
	{
		name: t('Trinidad and Tobago', { ns: 'design-system' }),
		dial_code: '+1868',
		code: 'TT',
		emoji: '🇹🇹',
		nationality: 'Trinidadian or Tobagonian',
	},
	{
		name: t('Tunisia', { ns: 'design-system' }),
		dial_code: '+216',
		code: 'TN',
		emoji: '🇹🇳',
		nationality: 'Tunisian',
	},
	{
		name: t('Turkey', { ns: 'design-system' }),
		dial_code: '+90',
		code: 'TR',
		emoji: '🇹🇷',
		nationality: 'Turkish',
	},
	{
		name: t('Turkmenistan', { ns: 'design-system' }),
		dial_code: '+993',
		code: 'TM',
		emoji: '🇹🇲',
		nationality: 'Turkmen',
	},
	{
		name: t('Turks and Caicos Islands', { ns: 'design-system' }),
		dial_code: '+1649',
		code: 'TC',
		emoji: '🇹🇨',
		nationality: 'Turks and Caicos Island',
	},
	{
		name: t('Tuvalu', { ns: 'design-system' }),
		dial_code: '+688',
		code: 'TV',
		emoji: '🇹🇻',
		nationality: 'Tuvaluan',
	},
	{
		name: t('Uganda', { ns: 'design-system' }),
		dial_code: '+256',
		code: 'UG',
		emoji: '🇺🇬',
		nationality: 'Ugandan',
	},
	{
		name: t('Ukraine', { ns: 'design-system' }),
		dial_code: '+380',
		code: 'UA',
		emoji: '🇺🇦',
		nationality: 'Ukrainian',
	},
	{
		name: t('United Arab Emirates', { ns: 'design-system' }),
		dial_code: '+971',
		code: 'AE',
		emoji: '🇦🇪',
		nationality: 'Emirati, Emirian, Emiri',
	},
	{
		name: t('United Kingdom', { ns: 'design-system' }),
		dial_code: '+44',
		code: 'UK',
		emoji: '🇬🇧',
		nationality: 'British',
	},
	{
		name: t('United States', { ns: 'design-system' }),
		dial_code: '+1',
		code: 'US',
		emoji: '🇺🇸',
		nationality: 'American',
	},
	{
		name: t('Uruguay', { ns: 'design-system' }),
		dial_code: '+598',
		code: 'UY',
		emoji: '🇺🇾',
		nationality: 'Uruguayan',
	},
	{
		name: t('Uzbekistan', { ns: 'design-system' }),
		dial_code: '+998',
		code: 'UZ',
		emoji: '🇺🇿',
		nationality: 'Uzbekistani, Uzbek',
	},
	{
		name: t('Vanuatu', { ns: 'design-system' }),
		dial_code: '+678',
		code: 'VU',
		emoji: '🇻🇺',
		nationality: 'Ni-Vanuatu, Vanuatuan',
	},
	{
		name: t('Venezuela, Bolivarian Republic of Venezuela', {
			ns: 'design-system',
		}),
		dial_code: '+58',
		code: 'VE',
		emoji: '🇻🇪',
		nationality: 'Venezuelan',
	},
	{
		name: t('Vietnam', { ns: 'design-system' }),
		dial_code: '+84',
		code: 'VN',
		emoji: '🇻🇳',
		nationality: 'Vietnamese',
	},
	{
		name: t('Virgin Islands, British', { ns: 'design-system' }),
		dial_code: '+1284',
		code: 'VG',
		emoji: '🇻🇬',
		nationality: 'British Virgin Island',
	},
	{
		name: t('Virgin Islands, U.S.', { ns: 'design-system' }),
		dial_code: '+1340',
		code: 'VI',
		emoji: '🇻🇮',
		nationality: 'U.S. Virgin Island',
	},
	{
		name: t('Wallis and Futuna', { ns: 'design-system' }),
		dial_code: '+681',
		code: 'WF',
		emoji: '🇼🇫',
		nationality: 'Wallis and Futuna, Wallisian or Futunan',
	},
	{
		name: t('Yemen', { ns: 'design-system' }),
		dial_code: '+967',
		code: 'YE',
		emoji: '🇾🇪',
		nationality: 'Yemeni',
	},
	{
		name: t('Zambia', { ns: 'design-system' }),
		dial_code: '+260',
		code: 'ZM',
		emoji: '🇿🇲',
		nationality: 'Zambian',
	},
	{
		name: t('Zimbabwe', { ns: 'design-system' }),
		dial_code: '+263',
		code: 'ZW',
		emoji: '🇿🇼',
		nationality: 'Zimbabwean',
	},
];

// Missing a few here such as: [
//     "Bonaire, Sint Eustatius and Saba",
//     "Bouvet Island",
//     "Curaçao",
//     "French Southern Territories",
//     "Heard Island and McDonald Islands",
//     "Sint Maarten (Dutch part)",
//     "United Kingdom of Great Britain and Northern Ireland",
//     "United States Minor Outlying Islands",
//     "Western Sahara"
// ]

export default {
	get countryList() {
		return getCountryList();
	},
};
