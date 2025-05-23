import type {
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';

/* to use actions with openapi
import { N8NPropertiesBuilder, N8NPropertiesBuilderConfig } from '@devlikeapro/n8n-openapi-node';
import * as doc from './openapi.json';

const config: N8NPropertiesBuilderConfig = {};
const parser = new N8NPropertiesBuilder(doc, config);
const properties = parser.build();
*/

export class CupixWorks implements INodeType {
	description: INodeTypeDescription = {
		// name: 'cupixWorks', // to use actions with openapi
		name: 'cupixWorksTrigger',
		displayName: 'CupixWorks',
		icon: 'file:cupixworks.svg',
		group: ['tools'],
		version: 1,
		subtitle: '={{$parameter["resource"]}}',
		description: 'CupixWorks Node',
		defaults: {
			name: 'CupixWorks',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'cupixWorksApi',
				required: true,
			}
		],
		// properties // to use actions with openapi
		properties: [
			{
				displayName: 'information',
				name: 'information',
				type: 'string',
				default: 'no actions available yet'
			}
		]
	};
}
