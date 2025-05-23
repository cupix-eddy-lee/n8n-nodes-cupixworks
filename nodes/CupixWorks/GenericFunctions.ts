import {
	IHookFunctions,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	IWebhookFunctions,
	IRequestOptions,
	IHttpRequestMethods,
	NodeApiError,
	JsonObject,
	IDataObject
} from "n8n-workflow";

export async function apiRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions | IWebhookFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body?: IDataObject,
	baseUri?: string,
	query: IDataObject = {},
	option: IDataObject = {}
): Promise<any> {
	const credentials = await this.getCredentials('cupixWorksApi');

	baseUri = baseUri || `https://api.${credentials.domain}/api/v1`;

	if (method === 'GET') {
		query = { ...query, ...body };
		body = {};
	}

	const options: IRequestOptions = {
		headers: {
			'x-cupix-auth': credentials.api_token,
			'Content-Type': 'application/json'
		},
		method,
		uri: `${baseUri}/${endpoint}`,
		body,
		qs: query,
		json: true
	};

	if (Object.keys(option).length > 0) {
		Object.assign(options, option);
	}

	if (body && Object.keys(body).length === 0) {
		delete options.headers?.['Content-Type'];
		delete options.body;
	}

	if (Object.keys(query).length === 0) {
		delete options.qs;
	}

	try {
		console.log(`[${new Date()}] Request CupixWorks API - options: ${JSON.stringify(options)}`);
		return await this.helpers.request(options);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}
