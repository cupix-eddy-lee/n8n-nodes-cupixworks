import {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class CupixWorksApi implements ICredentialType {
	name = 'cupixWorksApi';
	displayName = 'CupixWorks API';
	documentationUrl = "https://github.com/cupixrnd/cupix-api";
	icon: Icon = 'file:cupixworks.svg';
	properties: INodeProperties[] = [
		{
			displayName: 'API Token',
			description: 'Go to the <a href="https://app.cupix.works/setting/personal target="_blank"">[Personal Page]</a> to find your API Key.',
			name: 'api_token',
			type: 'string',
			default: '',
			typeOptions: {
				password: true,
			}
		}
	];

	// This allows the credential to be used by other parts of n8n
	// stating how this credential is injected as part of the request
	// An example is the Http Request node that can make generic calls
	// reusing this credential
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-Cupix-Auth': '={{$credentials.api_token}}',
			},
		},
	};

	// The block below tells how this credential can be tested
	test: ICredentialTestRequest = {
		request: {
			method: 'GET',
			baseURL: 'https://api.cupix.works/api/v1',
			url: '/me',
		},
	};
}
