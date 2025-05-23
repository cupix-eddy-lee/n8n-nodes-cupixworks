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
			displayName: 'domain',
			name: 'domain',
			type: 'options',
			default: 'cupix.works',
			required: true,
			options: [
				{
					name: 'cupix.works',
					value: 'cupix.works',
					description: 'US Region'
				},
				{
					name: 'cupix-eu.works',
					value: 'cupix-eu.works',
					description: 'Europe Region'
				},
				{
					name: 'cupix-au.works',
					value: 'cupix-au.works',
					description: 'Australia Region'
				},
				{
					name: 'cupix-jp.works',
					value: 'cupix-jp.works',
					description: 'Japan Region'
				},
				{
					name: 'cupix-sg.works',
					value: 'cupix-sg.works',
					description: 'Singapore Region'
				},
				{
					name: 'cupix-ca.works',
					value: 'cupix-ca.works',
					description: 'Canada Region'
				}
			]
		},
		{
			displayName: 'API Token',
			description: 'Visit https://app.[your domain]/settings/api to create a new token. (e.g., https://app.cupix-eu.works/settings/api)',
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
				'x-cupix-auth': '={{$credentials.api_token}}',
			}
		},
	};

	// The block below tells how this credential can be tested
	test: ICredentialTestRequest = {
		request: {
			method: 'GET',
			baseURL: '={{"https://api." + $credentials.domain + "/api/v1"}}',
			url: '/me?fields=id'
		},
	};
}
