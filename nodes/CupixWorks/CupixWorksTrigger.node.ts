import {
	INodeType,
	IDataObject,
	IHookFunctions,
	IWebhookFunctions,
	INodeTypeDescription,
	IWebhookResponseData,
	NodeConnectionType,
	ILoadOptionsFunctions,
	INodePropertyOptions
} from 'n8n-workflow';
import { apiRequest } from './GenericFunctions';

export class CupixWorksTrigger implements INodeType {
	description: INodeTypeDescription = {
		name: 'cupixWorksTrigger',
		displayName: 'CupixWorks Trigger',
		icon: 'file:cupixworks.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["events"]}}',
		description: 'Starts the workflow on a CupixWorks update',
		defaults: {
			name: 'CupixWorks Trigger'
		},
		inputs: [],
		outputs: [NodeConnectionType.Main],
		outputNames: ['data'],
		credentials: [
			{
				name: 'cupixWorksApi',
				required: true
			}
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook'
			}
		],
		properties: [
			{
				displayName: 'Project',
				name: 'facility_key',
				type: 'options',
				description:
					'Choose from the list',
				typeOptions: {
					loadOptionsMethod: 'loadFacilities',
				},
				required: true,
				default: '',
				displayOptions: {
					hide: {
						events: [
							'facility_create',
							'facility_update',
							'facility_delete'
						]
					}
				},
			},
			{
				displayName: 'Trigger on',
				name: 'events',
				type: 'options',
				default: '',
				required: true,
				description: 'Events types',
				options: [
					{
						name: 'Project Created',
						value: 'facility_create',
						description: 'Triggered when a new project is created',
					},
					{
						name: 'Project Updated',
						value: 'facility_update',
						description: 'Triggered when a project is updated',
					},
					{
						name: 'Project Deleted',
						value: 'facility_delete',
						description: 'Triggered when a project is deleted',
					},
					{
						name: 'Annotation Created',
						value: 'annotation_create',
						description: 'Triggered when an annotation is created',
					},
					{
						name: 'Annotation Updated',
						value: 'annotation_update',
						description: 'Triggered when an annotation is updated',
					},
					{
						name: 'Annotation Deleted',
						value: 'annotation_delete',
						description: 'Triggered when an annotation is deleted',
					},
					{
						name: 'Comment Created',
						value: 'comment_create',
						description: 'Triggered when a comment is created',
					},
					{
						name: 'Comment Updated',
						value: 'comment_update',
						description: 'Triggered when a comment is updated',
					},
					{
						name: 'Comment Deleted',
						value: 'comment_delete',
						description: 'Triggered when a comment is deleted',
					},
					{
						name: 'Capture Processing Completed',
						value: 'record_processing_completed',
						description: 'Triggered when a capture is processed',
					},
					{
						name: 'Capture Created',
						value: 'record_create',
						description: 'Triggered when a capture is created',
					},
					{
						name: 'Capture Updated',
						value: 'record_update',
						description: 'Triggered when a capture is updated',
					},
					{
						name: 'Capture Deleted',
						value: 'record_delete',
						description: 'Triggered when a capture is deleted',
					},
					{
						name: 'Area Created',
						value: 'capture_create',
						description: 'Triggered when an area is created',
					},
					{
						name: 'Area Updated',
						value: 'capture_update',
						description: 'Triggered when an area is updated',
					},
					{
						name: 'Area Deleted',
						value: 'capture_delete',
						description: 'Triggered when an area is deleted',
					}
				]
			}
		]
	};

	methods = {
		loadOptions: {
			async loadFacilities(
				this: ILoadOptionsFunctions,
			): Promise<INodePropertyOptions[]> {
				const responses = await apiRequest.call(
					this,
					'GET',
					'facilities',
					{ fields: 'id,name,key'}
				);

				const facilities: FacilityItem[] = responses.result?.data;

				if (!facilities) {
					return [];
				}

				return facilities.map((value) => ({
					name: value.attributes.name! + ` (${value.attributes.key!})`,
					value: value.attributes.key!,
				}));
			}
		}
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<any> {
				const webhookData = this.getWorkflowStaticData('node');
				if (webhookData.webhookId) return true;

				return false;
			},
			async create(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				const hookUrl = this.getNodeWebhookUrl('default');
				const events = this.getNodeParameter('events');
				const credentials = await this.getCredentials('cupixWorksApi');
				const capitalize = (str: string) => {
					return str.charAt(0).toUpperCase() + str.slice(1);
				};

				if (!events) throw new Error('No events specified');

				const facilityKey = events.toString().startsWith('facility') ? undefined : this.getNodeParameter('facility_key');
				let [ triggerModel, triggerAction ] = events.toString().split('_');
				let triggerReason = 'all';

				if (triggerAction === 'processing_completed') {
					triggerReason = events.toString();
					triggerAction = 'update';
				}

				const response = await apiRequest.call(
					this,
					'POST',
					'recipes/v2',
					{
						name: events.toString(),
						kind: 'user_recipe',
						eventable_type: capitalize(triggerModel),
						trigger_action: triggerAction,
						trigger_reason: triggerReason,
						event_action_name: 'n8n',
						facility_key: facilityKey,
						hook_url: hookUrl,
						version: this.getNode().typeVersion.toString(),
						fields: 'id'
					},
					`https://api.${credentials.domain}/api`,
				);

				console.log(`[${new Date()}] Create Recipe - response: ${JSON.stringify(response)}`);
				if (response.result.data.id === undefined) {
					return false;
				}

				webhookData.webhookId = response.result.data.id;

				return true;
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				const credentials = await this.getCredentials('cupixWorksApi');
				const webhookData = this.getWorkflowStaticData('node');
				if (!webhookData.webhookId) return false;

				const response = await apiRequest.call(
					this,
					'DELETE',
					`recipes/v2/${webhookData.webhookId}`,
					undefined,
					`https://api.${credentials.domain}/api`,
				);

				console.log(`[${new Date()}] Delete Recipe - response: ${JSON.stringify(response)}`);
				return true;
			}
		}
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const returnData: IDataObject[] = [];

		returnData.push({
			'data': {
				body: this.getBodyData(),
				headers: this.getHeaderData(),
				query: this.getQueryData()
			}
		});

		return {
			workflowData: [this.helpers.returnJsonArray(returnData)],
			webhookResponse: { status: 200, body: '' }
		};
	}
}

interface FacilityItem {
	id: number;
	type: 'facility';
	attributes: Facility;
}

interface Facility {
	id?: number;
	name?: string;
	key?: string;
}
