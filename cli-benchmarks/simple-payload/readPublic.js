'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');
let payloads = require('./complaints.json');
let assetIds = [];

class MyWorkload extends WorkloadModuleBase {
    constructor() {
        super();
    }
    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);
	const payloadId = Date.now().toString();
        const payloadIndex = Math.floor(Math.random() * payloads.length);
        const payload = payloads[payloadIndex];
        console.log(`Worker ${this.workerIndex}: writing data with a size of ${Buffer.byteLength(JSON.stringify(payload))} Bytes - PDC: No / Transient Field: Yes`);
        const myArgs = {
            contractId: 'simple-payload',
            contractVersion: 'v1',
            contractFunction: 'writePayloadPublic',
            contractArguments: [payloadId, Buffer.from(JSON.stringify(payload))]
        };
        assetIds.push(payloadId);
	    await this.sutAdapter.sendRequests(myArgs);
    }
	async submitTransaction() {
		console.log(`Worker ${this.workerIndex}: reading data with id ${assetIds[0]}`);
		const myArgs = {
			contractId: 'simple-payload',
			contractVersion: 'v1',
			contractFunction: 'readPayloadPublic',
			contractArguments: [assetIds[0]]
		};
		await this.sutAdapter.sendRequests(myArgs);
	}

}

function createWorkloadModule() {
	return new MyWorkload();
}
module.exports.createWorkloadModule = createWorkloadModule;
