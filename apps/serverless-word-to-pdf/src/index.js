const AWS = require('aws-sdk');
const stepfunctions = new AWS.StepFunctions();

exports.handler = async (event) => {
	if (event.Records.length > 0) {
		event.Records.forEach((record) => {
			stepfunctions.startExecution({
				stateMachineArn: process.env.STATE_MACHINE_ARN,
				input: JSON.stringify(record.s3),
			});
		});
	}
};
