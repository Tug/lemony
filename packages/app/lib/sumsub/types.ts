declare module '@sumsub/react-native-mobilesdk-module' {
	type Status =
		| 'Ready' // SDK is initialized and ready to be presented
		| 'Failed' //SDK fails for some reasons (see errorType and errorMsg for details)
		| 'Initial' // No verification steps are passed yet
		| 'Incomplete' // Some but not all of the verification steps have been passed over
		| 'Pending' // Verification is pending
		| 'TemporarilyDeclined' // Applicant has been declined temporarily
		| 'FinallyRejected' // Applicant has been finally rejected
		| 'Approved' // Applicant has been approved
		| 'ActionCompleted'; //Applicant action has been completed

	type EventType =
		| 'ApplicantLoaded'
		| 'StepInitiated'
		| 'StepCompleted'
		| 'Analytics';

	type ErrorType =
		| 'Unknown' // Unknown or no fail
		| 'InvalidParameters' // An attempt to setup with invalid parameters
		| 'Unauthorized' // Unauthorized access detected (most likely accessToken is invalid or expired and had failed to be refreshed)
		| 'InitialLoadingFailed' // Initial loading from backend is failed
		| 'ApplicantNotFound' // No applicant is found for the given parameters
		| 'ApplicantMisconfigured' // Applicant is found, but is misconfigured (most likely lacks of idDocs)
		| 'InititlizationError' // An initialization error occured
		| 'NetworkError' // A network error occured (the user will be presented with Network Oops screen)
		| 'UnexpectedError'; // Some unexpected error occured (the user will be presented with Fatal Oops screen)

	interface ApplicantLoadedEvent {
		eventType: 'ApplicantLoaded';
		payload: {
			applicantId: string;
		};
	}
	interface StepInitiatedEvent {
		eventType: 'StepInitiated';
		payload: {
			idDocSetType: '$idDocSetType';
		};
	}
	interface StepCompletedEvent {
		eventType: 'StepCompleted';
		payload: {
			idDocSetType: '$idDocSetType';
			isCancelled: boolean;
		};
	}
	interface AnalyticsEvent {
		eventType: 'Analytics';
		payload: {
			eventName: string;
			eventPayload: object;
		};
	}

	type Event =
		| ApplicantLoadedEvent
		| StepInitiatedEvent
		| StepCompletedEvent
		| AnalyticsEvent;

	interface StatusChangedEvent {
		prevStatus: Status;
		newStatus: Status;
	}

	interface LogEvent {
		message: string;
	}

	export interface Result {
		success: boolean;
		status: Status;
		actionResult: ActionResult;
	}

	export interface ActionResult {
		actionId: string;
		actionType: string;
		answer: 'GREEN' | 'RED' | 'ERROR';
		allowContinuing: boolean;
	}

	export interface SNSMobileSDK {
		launch: () => Promise<Result>;
		dismiss: () => void;
		getNewAccessToken: () => void;
	}

	export type OnActionResult = (result: Result) => void;
	export type OnStatusChanged = (event: StatusChangedEvent) => void;
	export type OnLog = (event: LogEvent) => void;
	export type OnEvent = (event: Event) => void;

	interface Handlers {
		onActionResult?: OnActionResult;
		onStatusChanged?: OnStatusChanged;
		onLog?: OnLog;
		onEvent?: OnEvent;
	}

	export type TokenExpirationHandler = () => Promise<string>;

	interface SNSMobileSDKBuilder {
		build: () => SNSMobileSDK;
		withAccessToken: (
			accessToken: string | undefined,
			expirationHandler: TokenExpirationHandler
		) => SNSMobileSDKBuilder;
		withHandlers: (handlers: Handlers) => SNSMobileSDKBuilder;
		withDebug: (debug: boolean) => SNSMobileSDKBuilder;
		withLocale: (locale: string) => SNSMobileSDKBuilder;
		withAnalyticsEnabled: (debug: boolean) => SNSMobileSDKBuilder;
		withSupportEmail: (email: string) => SNSMobileSDKBuilder;
		withApplicantConf: (applicantConf: object) => SNSMobileSDKBuilder;
		withStrings: (strings: object) => SNSMobileSDKBuilder;
		withTheme: (theme: object) => SNSMobileSDKBuilder;
		withBaseUrl: (apiUrl: string) => SNSMobileSDKBuilder;
		onTestEnv: () => SNSMobileSDKBuilder;
	}

	interface SDK {
		init: SNSMobileSDKBuilder['withAccessToken'];
		Builder: (baseUrl: string, flowName: string) => SNSMobileSDKBuilder;
		reset: () => void;
	}

	const sdk: SDK;

	export default sdk;
}
