declare module '@sumsub/api-types' {
	export interface Applicant {
		id: string; // An applicantId.
		inspectionId: string; // Inspection ID.
		externalUserId: string; // An applicant ID on the client side, should be unique.
		sourceKey?: string; // If you want to separate your clients that send applicants, provide this field to distinguish between them. It also shows up at the webhook payloads.
		email?: string; // Applicant email.
		phone?: string; // Applicant phone number.
		lang?: string; // The language in which the applicant should see the result of verification in ISO 639-1 format.
		metadata?: object[]; // Additional information that is not displayed to the end user ( Example: [{"key": "keyFromClient", "value": "valueFromClient"}] ).
		info?: FixedInfo; // Basic information about the applicant
		fixedInfo?: FixedInfo; // Basic information about the applicant that we shouldn't change from our side but cross-validate it with data recognized from documents. Has the same attributes as info.
		createdAt: string; // Time and date of applicant creation.
		requiredIdDocs?: object; // Object that describes the set of required documents and data for applicant to upload and pass verification.
		review: {
			reprocessing: boolean;
			levelName: string;
			createDate: string;
			reviewStatus: ReviewStatus;
			reviewResult?: ReviewResult;
		}; // Object that describes current applicant status.
		questionnaires?: object[];
		applicantPlatform: string;
	}

	export interface NewApplicant {
		externalUserId: string;
		email?: string;
		phone?: string;
		lang?: string;
		metadata?: object[];
		fixedInfo?: FixedInfo;
	}

	export interface FixedInfo {
		firstName: string;
		lastName: string; // Last name.
		middleName: string; // Middle name.
		firstNameEn: string; // Automatic transliteration of the first name.
		lastNameEn: string; // Automatic transliteration of the last name.
		middleNameEn: string; // Automatic transliteration of the middle name.
		legalName: string; // Legal name.
		gender: Gender; // Sex of a person (M or F).
		dob: string; // Date of birth (format YYYY-mm-dd, e.g. 2001-09-25).
		placeOfBirth: string; // Place of birth.
		countryOfBirth: string; // Country of birth.
		stateOfBirth: string; // State of birth.
		country: CountriesEnum; // Alpha-3 country code (e.g. DEU or RUS) (Wikipedia).
		nationality: string; // Alpha-3 country code (Wikipedia).
		addresses: Address[]; // List of addresses.
	}

	export interface Address {
		country: CountriesEnum; // Alpha-3 country code.
		postCode: string; // Postal code.
		town: string; // Town or city name.
		street: string; // Street name.
		subStreet: string; // Additional street information.
		state: string; // State name if applicable.
		buildingName: string; // Building name if applicable.
		flatNumber: string; // Flat or apartment number.
		buildingNumber: string; // Building number.
	}

	export interface CreateApplicantResponse {
		id: string;
		createdAt: string;
		clientId: string;
		inspectionId: string;
		externalUserId: string;
		fixedInfo: FixedInfo;
		email: string;
		phone: string;
		requiredIdDocs: {
			excludedCountries: string[];
			docSets: object[];
		};
		review: {
			reprocessing: boolean;
			levelName: string;
			createDate: string;
			reviewStatus: ReviewStatus;
		};
		type: string;
	}

	export interface GetApplicantStatusResponseSDK {
		createDate: string; // Date of creation of the applicant.
		reviewDate?: string; // Date of check ended.
		startDate?: string; // Date of check started.
		moderationComment?: string; // A human-readable comment that can be shown to the end user.
		clientComment?: string; // A human-readable comment that should not be shown to the end user.
		reviewStatus: ReviewStatus; // Current status of an applicant.
		reviewResult?: ReviewResult;
	}

	export type GetApplicantStatusResponseAPI = {
		[doctype in DocSetType]: {
			reviewResult: ReviewResult;
			country: CountriesEnum;
			idDocType: DocType;
			imageIds: number[];
			imageReviewResults: {
				[imageId: string]: {
					moderationComment: string;
					clientComment: string;
					reviewAnswer: 'RED' | 'GREEN';
					rejectLabels: RejectLabel[];
					reviewRejectType: ReviewRejectType;
				};
			};
		};
	};

	export interface GetApplicantResponse {
		data: Applicant;
	}

	export interface CreateAccessTokenResponse {
		token: string;
		userId: string;
	}

	export interface WebhookApplicantVerificationPayload {
		applicantId: string; // applicant ID
		inspectionId: string; // applicant's inspection ID
		correlationId: string;
		externalUserId: string;
		levelName?: string;
		type: WebhookType;
		sandboxMode: boolean; // True if the webhook was sent from the Sandbox mode.
		// indicates that the verification process has been completed
		// NOTE: it does not mean that the applicant was approved,
		// it just means that an applicant was processed
		reviewStatus: ReviewStatus;
		// time of webhook creation
		createdAt: string;
		applicantType?: 'company' | 'individual'; // Type of the applicant e.g. company/individual.
		reviewResult?: ReviewResult;
		applicantMemberOf?: object[]; // Contains the list of company applicantIds that current applicant belongs as a beneficiary.
		videoIdentReviewStatus?: string; // Status of the videoIdent call.
		applicantActionId?: string; // Id of an applicant action.
		externalApplicantActionId?: string; // Unique action Id on your side.
		clientId: string; // Unique identifier of you as our client.
	}

	export type WebhookType =
		| 'applicantReviewed' // When verification is completed. Contains the verification result. More information about this type of webhook can be found here.
		| 'applicantPending' // When a user uploaded all the required documents and the applicant's status changed to pending.
		| 'applicantCreated' // When an applicant is created.
		| 'applicantOnHold' // Processing of the applicant is paused for an agreed reason.
		| 'applicantPersonalInfoChanged' // Applicant's personal info has been changed.
		| 'applicantPrechecked' // When primary data processing is completed.
		| 'applicantDeleted' // Applicant has been permanently deleted.
		| 'videoIdentStatusChanged' // Status of Video Ident type of verification has been changed.
		| 'applicantReset' // Applicant has been reset: applicant status changed to init and all documents were set as inactive. You can find more info here.
		| 'applicantActionPending' // Applicant action status changed to pending. More info about applicant actions you may find here.
		| 'applicantActionReviewed' // Applicant action verification has been completed. More info about applicant actions you may find here.
		| 'applicantActionOnHold' // Applicant action verification has been paused for an agreed reason. More info about applicant actions you may find here.
		| 'applicantTravelRuleStatusChanged'; // Travel rule request status has been changed. More info about travel rule you may find here.

	export type ReviewResult =
		| {
				// A human-readable comment that can be shown to your end user
				// Please note that individual images may also contain additional document-specific comments.
				// In this case this field might be empty.
				// In order to get them, refer to the Getting applicant status (API)
				moderationComment: string;
				// A human-readable comment that should not be shown to an end user, and is meant to be read by a client
				// This field will contain applicant's top-level comments,
				// plus, if the rejectType is not RETRY it may contain some private info, like that the user is a fraudster.
				// we envision that this field will be used for admin areas of our clients,
				// where a human can get all information
				clientComment: string;
				// final answer that should be highly trusted (only 'RED' and 'GREEN' are currently supported)
				reviewAnswer: 'RED';
				// a machine-readable constant that describes the problems in case of verification failure
				rejectLabels: RejectLabel[];
				reviewRejectType: ReviewRejectType;
		  }
		| {
				reviewAnswer: 'GREEN';
		  };

	export type ReviewStatus =
		| 'init' // Initial registration has started. A client is still in the process of filling out the applicant profile. Not all required documents are currently uploaded.
		| 'pending' // An applicant is ready to be processed.
		| 'prechecked' // The check is in a half way of being finished.
		| 'queued' // The checks have been started for the applicant.
		| 'completed' // The check has been completed.
		| 'onHold'; // Applicant waits for a final decision from compliance officer (manual check was initiated) or waits for all beneficiaries to pass KYC in case of company verification.

	export type ReviewRejectType =
		| 'FINAL' // Final reject, e.g. when a person is a fraudster, or a client does not want to accept such kinds of clients in his/her system
		| 'RETRY'; // Decline that can be fixed, e.g. by uploading an image of better quality

	export type DocSetType =
		| 'PHONE_VERIFICATION' // Phone verification step
		| 'EMAIL_VERIFICATION' // Email verification step
		| 'QUESTIONNAIRE' // Questionnaire
		| 'APPLICANT_DATA' // Applicant data
		| 'IDENTITY' // Identity step
		| 'IDENTITY2' // 2nd Identity step
		| 'IDENTITY3' // 3rd Identity step
		| 'IDENTITY4' // 4th Identity step
		| 'PROOF_OF_RESIDENCE' // Proof of residence
		| 'PROOF_OF_RESIDENCE2' // 2nd Proof of residence
		| 'SELFIE' // Selfie step
		| 'SELFIE2'; // 2nd Selfie step

	export type DocType =
		| 'ID_CARD' // An ID card
		| 'PASSPORT' // A passport
		| 'DRIVERS' //A driving license
		| 'RESIDENCE_PERMIT' // Residence permit or registration document in the foreign city/country
		| 'UTILITY_BILL' // Proof of address document. Check here for the full list of acceptable docs as UTILITY_BILL
		| 'SELFIE' // A selfie with a document
		| 'VIDEO_SELFIE' // A selfie video (can be used in webSDK or mobileSDK)
		| 'PROFILE_IMAGE' // A profile image, i.e. avatar (in this case no additional metadata should be sent)
		| 'ID_DOC_PHOTO' // Photo from an ID doc (like a photo from a passport) (No additional metadata should be sent)
		| 'AGREEMENT' // Agreement of some sort, e.g. for processing personal info
		| 'CONTRACT' // Some sort of contract
		| 'DRIVERS_TRANSLATION' // Translation of the driving license required in the target country
		| 'INVESTOR_DOC' // A document from an investor, e.g. documents which disclose assets of the investor
		| 'VEHICLE_REGISTRATION_CERTIFICATE' // Certificate of vehicle registration
		| 'INCOME_SOURCE' // A proof of income
		| 'PAYMENT_METHOD' // Entity confirming payment (like bank card, crypto wallet, etc)
		| 'BANK_CARD' // A bank card, like Visa or Maestro
		| 'COVID_VACCINATION_FORM	COVID' // vaccination document (may contain the QR code)
		| 'OTHER'; // Should be used only when nothing else applies

	export type RejectLabel =
		| 'FORGERY' // Forgery attempt has been made
		| 'DOCUMENT_TEMPLATE' // Documents supplied are templates, downloaded from internet
		| 'LOW_QUALITY' // Documents have low-quality that does not allow definitive conclusions to be made
		| 'SPAM' // An applicant has been created by mistake or is just a spam user (irrelevant images were supplied)
		| 'NOT_DOCUMENT' // Documents supplied are not relevant for the verification procedure
		| 'SELFIE_MISMATCH' // A user photo (profile image) does not match a photo on the provided documents
		| 'ID_INVALID' // A document that identifies a person (like a passport or an ID card) is not valid
		| 'FOREIGNER' // When a client does not accept applicants from a different country or e.g. without a residence permit
		| 'DUPLICATE' // This applicant was already created for this client, and duplicates are not allowed by the regulations
		| 'BAD_AVATAR' // When avatar does not meet the client's requirements
		| 'WRONG_USER_REGION' // When applicants from certain regions/countries are not allowed to be registered
		| 'INCOMPLETE_DOCUMENT' // Some information is missing from the document, or it's partially visible
		| 'BLACKLIST' // User is blocklisted
		| 'UNSATISFACTORY_PHOTOS' // There were problems with the photos, like poor quality or masked information
		| 'DOCUMENT_PAGE_MISSING' // Some pages of a document are missing (if applicable)
		| 'DOCUMENT_DAMAGED' // Document is damaged
		| 'REGULATIONS_VIOLATIONS' // Regulations violations
		| 'INCONSISTENT_PROFILE' // Data or documents of different persons were uploaded to one applicant
		| 'PROBLEMATIC_APPLICANT_DATA' // Applicant data does not match the data in the documents
		| 'ADDITIONAL_DOCUMENT_REQUIRED' // Additional documents required to pass the check
		| 'AGE_REQUIREMENT_MISMATCH' // Age requirement is not met (e.g. cannot rent a car to a person below 25yo)
		| 'EXPERIENCE_REQUIREMENT_MISMATCH' // Not enough experience (e.g. driving experience is not enough)
		| 'CRIMINAL' // The user is involved in illegal actions
		| 'WRONG_ADDRESS' // The address from the documents doesn't match the address that the user entered
		| 'GRAPHIC_EDITOR' // The document has been edited by a graphical editor
		| 'DOCUMENT_DEPRIVED' // The user has been deprived of the document
		| 'COMPROMISED_PERSONS' // The user does not correspond to Compromised Person Politics
		| 'PEP' // The user belongs to the PEP category
		| 'ADVERSE_MEDIA' // The user was found in the adverse media
		| 'FRAUDULENT_PATTERNS' // Fraudulent behavior was detected
		| 'SANCTIONS' // The user was found on sanction lists
		| 'NOT_ALL_CHECKS_COMPLETED' // All checks were not completed
		| 'FRONT_SIDE_MISSING' // Front side of the document is missing
		| 'BACK_SIDE_MISSING' // Back side of the document is missing
		| 'SCREENSHOTS' // The user uploaded screenshots
		| 'BLACK_AND_WHITE' // The user uploaded black and white photos of documents
		| 'INCOMPATIBLE_LANGUAGE' // The user should upload translation of his document
		| 'EXPIRATION_DATE' // The user uploaded expired document
		| 'UNFILLED_ID' // The user uploaded the document without signatures and stamps
		| 'BAD_SELFIE' // The user uploaded a bad selfie
		| 'BAD_VIDEO_SELFIE' // The user uploaded a bad video selfie
		| 'BAD_FACE_MATCHING' // Face check between document and selfie failed
		| 'BAD_PROOF_OF_IDENTITY' // The user uploaded a bad ID document
		| 'BAD_PROOF_OF_ADDRESS' // The user uploaded a bad proof of address
		| 'BAD_PROOF_OF_PAYMENT' // The user uploaded a bad proof of payment
		| 'SELFIE_WITH_PAPER' // The user should upload a special selfie (e.g. selfie with paper and date on it)
		| 'FRAUDULENT_LIVENESS' // There was an attempt to bypass liveness check
		| 'OTHER' // Some unclassified reason
		| 'REQUESTED_DATA_MISMATCH' // Provided info doesn't match with recognized from document data
		| 'OK' // Custom reject label
		| 'COMPANY_NOT_DEFINED_STRUCTURE' // Could not establish the entity's control structure
		| 'COMPANY_NOT_DEFINED_BENEFICIARIES' // Could not identify and duly verify the entity's beneficial owners
		| 'COMPANY_NOT_VALIDATED_BENEFICIARIES' // Beneficiaries are not validated
		| 'COMPANY_NOT_DEFINED_REPRESENTATIVES' // Representatives are not defined
		| 'COMPANY_NOT_VALIDATED_REPRESENTATIVES'; // Representatives are not validated

	export enum CountriesEnum { // ISO 3166-1 alpha-3
		AFG = 'Afghanistan',
		ALA = 'Aland Islands',
		ALB = 'Albania',
		DZA = 'Algeria',
		ASM = 'American Samoa',
		AND = 'Andorra',
		AGO = 'Angola',
		AIA = 'Anguilla',
		ATA = 'Antarctica',
		ATG = 'Antigua and Barbuda',
		ARG = 'Argentina',
		ARM = 'Armenia',
		ABW = 'Aruba',
		AUS = 'Australia',
		AUT = 'Austria',
		AZE = 'Azerbaijan',
		BHS = 'Bahamas',
		BHR = 'Bahrain',
		BGD = 'Bangladesh',
		BRB = 'Barbados',
		BLR = 'Belarus',
		BEL = 'Belgium',
		BLZ = 'Belize',
		BEN = 'Benin',
		BMU = 'Bermuda',
		BTN = 'Bhutan',
		BOL = 'Bolivia',
		BIH = 'Bosnia and Herzegovina',
		BWA = 'Botswana',
		BVT = 'Bouvet Island',
		BRA = 'Brazil',
		IOT = 'British Indian Ocean Territory',
		BRN = 'Brunei Darussalam',
		BGR = 'Bulgaria',
		BFA = 'Burkina Faso',
		BDI = 'Burundi',
		KHM = 'Cambodia',
		CMR = 'Cameroon',
		CAN = 'Canada',
		CPV = 'Cape Verde',
		CYM = 'Cayman Islands',
		CAF = 'Central African Republic',
		TCD = 'Chad',
		CHL = 'Chile',
		CHN = 'China',
		CXR = 'Christmas Island',
		CCK = 'Cocos Keeling Islands',
		COL = 'Colombia',
		COM = 'Comoros',
		COG = 'Congo',
		COD = 'Congo Democratic Republic',
		COK = 'Cook Islands',
		CRI = 'Costa Rica',
		CIV = "Cote D'Ivoire",
		HRV = 'Croatia',
		CUB = 'Cuba',
		CYP = 'Cyprus',
		CZE = 'CzechRepublic',
		DNK = 'Denmark',
		DJI = 'Djibouti',
		DMA = 'Dominica',
		DOM = 'Dominican Republic',
		ECU = 'Ecuador',
		EGY = 'Egypt',
		SLV = 'El Salvador',
		GNQ = 'Equatorial Guinea',
		ERI = 'Eritrea',
		EST = 'Estonia',
		ETH = 'Ethiopia',
		FLK = 'Falkland Islands',
		FRO = 'Faroe Islands',
		FJI = 'Fiji',
		FIN = 'Finland',
		FRA = 'France',
		GUF = 'French Guiana',
		PYF = 'French Polynesia',
		ATF = 'French Southern Territories',
		GAB = 'Gabon',
		GMB = 'Gambia',
		GEO = 'Georgia',
		DEU = 'Germany',
		GHA = 'Ghana',
		GIB = 'Gibraltar',
		GRC = 'Greece',
		GRL = 'Greenland',
		GRD = 'Grenada',
		GLP = 'Guadeloupe',
		GUM = 'Guam',
		GTM = 'Guatemala',
		GGY = 'Guernsey',
		GIN = 'Guinea',
		GNB = 'Guinea Bissau',
		GUY = 'Guyana',
		HTI = 'Haiti',
		HMD = 'Heard Island Mcdonald Islands',
		VAT = 'Holy See Vatican City State',
		HND = 'Honduras',
		HKG = 'HongKong',
		HUN = 'Hungary',
		ISL = 'Iceland',
		IND = 'India',
		IDN = 'Indonesia',
		IRN = 'Iran',
		IRQ = 'Iraq',
		IRL = 'Ireland',
		IMN = 'Isle Of Man',
		ISR = 'Israel',
		ITA = 'Italy',
		JAM = 'Jamaica',
		JPN = 'Japan',
		JEY = 'Jersey',
		JOR = 'Jordan',
		KAZ = 'Kazakhstan',
		KEN = 'Kenya',
		KIR = 'Kiribati',
		KOR = 'Korea, Republic of',
		PRK = "Korea, Democratic People's Republic of",
		KWT = 'Kuwait',
		KGZ = 'Kyrgyzstan',
		LAO = 'Lao Peoples Democratic Republic',
		LVA = 'Latvia',
		LBN = 'Lebanon',
		LSO = 'Lesotho',
		LBR = 'Liberia',
		LBY = 'Libyan Arab Jamahiriya',
		LIE = 'Liechtenstein',
		LTU = 'Lithuania',
		LUX = 'Luxembourg',
		MAC = 'Macao',
		MDG = 'Madagascar',
		MWI = 'Malawi',
		MYS = 'Malaysia',
		MDV = 'Maldives',
		MLI = 'Mali',
		MLT = 'Malta',
		MHL = 'Marshall Islands',
		MTQ = 'Martinique',
		MRT = 'Mauritania',
		MUS = 'Mauritius',
		MYT = 'Mayotte',
		MEX = 'Mexico',
		FSM = 'Micronesia',
		MDA = 'Moldova',
		MCO = 'Monaco',
		MNG = 'Mongolia',
		MNE = 'Montenegro',
		MSR = 'Montserrat',
		MAR = 'Morocco',
		MOZ = 'Mozambique',
		MMR = 'Myanmar',
		NAM = 'Namibia',
		NRU = 'Nauru',
		NPL = 'Nepal',
		NLD = 'Netherlands',
		NCL = 'New Caledonia',
		NZL = 'New Zealand',
		NIC = 'Nicaragua',
		NER = 'Niger',
		NGA = 'Nigeria',
		NIU = 'Niue',
		NFK = 'Norfolk Island',
		MNP = 'Northern Mariana Islands',
		NOR = 'Norway',
		OMN = 'Oman',
		PAK = 'Pakistan',
		PLW = 'Palau',
		PSE = 'Palestinian Territory',
		PAN = 'Panama',
		PNG = 'Papua New Guinea',
		PRY = 'Paraguay',
		PER = 'Peru',
		PHL = 'Philippines',
		PCN = 'Pitcairn',
		POL = 'Poland',
		PRT = 'Portugal',
		PRI = 'Puerto Rico',
		QAT = 'Qatar',
		MKD = 'Republic of North Macedonia',
		REU = 'Réunion',
		ROU = 'Romania',
		RUS = 'Russian Federation',
		RWA = 'Rwanda',
		BLM = 'Saint Barthelemy',
		SHN = 'Saint Helena',
		KNA = 'Saint Kitts And Nevis',
		LCA = 'Saint Lucia',
		MAF = 'Saint Martin',
		SPM = 'Saint Pierre And Miquelon',
		VCT = 'Saint Vincent And Grenadines',
		WSM = 'Samoa',
		SMR = 'San Marino',
		STP = 'Sao Tome And Principe',
		SAU = 'Saudi Arabia',
		SEN = 'Senegal',
		SRB = 'Serbia',
		SYC = 'Seychelles',
		SLE = 'Sierra Leone',
		SGP = 'Singapore',
		SXM = 'Sint Maarten (Dutch part)',
		SVK = 'Slovakia',
		SVN = 'Slovenia',
		SLB = 'Solomon Islands',
		SOM = 'Somalia',
		ZAF = 'South Africa',
		SGS = 'South Georgia And Sandwich Island',
		SSD = 'South Sudan',
		ESP = 'Spain',
		LKA = 'Sri Lanka',
		SDN = 'Sudan',
		SUR = 'Suriname',
		SJM = 'Svalbard And Jan Mayen',
		SWZ = 'Swaziland',
		SWE = 'Sweden',
		CHE = 'Switzerland',
		SYR = 'Syrian Arab Republic',
		TWN = 'Taiwan',
		TJK = 'Tajikistan',
		TZA = 'Tanzania',
		THA = 'Thailand',
		TLS = 'Timor-Leste',
		TGO = 'Togo',
		TKL = 'Tokelau',
		TON = 'Tonga',
		TTO = 'Trinidad And Tobago',
		TUN = 'Tunisia',
		TUR = 'Turkey',
		TKM = 'Turkmenistan',
		TCA = 'Turks And Caicos Islands',
		TUV = 'Tuvalu',
		UGA = 'Uganda',
		UKR = 'Ukraine',
		ARE = 'United Arab Emirates',
		GBR = 'United Kingdom',
		UMI = 'United States Outlying Islands',
		USA = 'United States',
		URY = 'Uruguay',
		UZB = 'Uzbekistan',
		VUT = 'Vanuatu',
		VEN = 'Venezuela',
		VNM = 'Vietnam',
		VGB = 'Virgin Islands British',
		VIR = 'Virgin Islands US',
		WLF = 'Wallis And Futuna',
		ESH = 'Western Sahara',
		YEM = 'Yemen',
		ZMB = 'Zambia',
		ZWE = 'Zimbabwe',
	}

	export type Gender = 'M' | 'F';
}
