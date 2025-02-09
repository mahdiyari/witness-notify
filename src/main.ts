import { call } from 'hive-tx'
import { OpenHiveMessage, OpInBlock } from './types.ts'

const openHiveHook = Deno.env.get('OPENHIVE_HOOK')
if (typeof openHiveHook !== 'string') {
	throw Error('OPENHIVE_HOOK env variable is not set')
}

const main = async () => {
	const headBlock = await getHeadBlock()
	if (headBlock) {
		const ops = await getOpsInBlock(headBlock)
		for (let i = 0; i < ops.length; i++) {
			const op = ops[i].op
			if (op[0] === 'producer_missed') {
				printMissed(op[1].producer)
			}
			if (op[0] === 'producer_reward') {
				printRecovered(op[1].producer, headBlock)
			}
		}
	}
}
setInterval(main, 1000)
console.log('Application started.')

let lastBlock = 0
const getHeadBlock = async () => {
	const result = await call('condenser_api.get_dynamic_global_properties')
	if (result.result.head_block_number > lastBlock) {
		lastBlock = result.result.head_block_number
		return lastBlock
	} else {
		return null
	}
}

const getOpsInBlock = async (blockNum: number): Promise<OpInBlock[]> => {
	const result = await call('condenser_api.get_ops_in_block', [blockNum, true])
	return result.result
}

const recentlyMissedWitnesses: string[] = []
const printMissed = async (witness: string) => {
	const time = new Date().toISOString()
	console.log(`${witness} missed a block. ${time}`)
	const result = await call('condenser_api.get_witness_by_account', [witness])
	let totalMissedBlocks = undefined
	if (result?.result?.total_missed) {
		totalMissedBlocks = result.result.total_missed
	}
	const messageString =
		`Witness ${witness} missed a new block. Totall missed blocks=${totalMissedBlocks}. ${time}`
	const message = {
		icon_emoji: ':head_bandage:',
		text: messageString,
	}
	if (!recentlyMissedWitnesses.includes(witness)) {
		recentlyMissedWitnesses.push(witness)
	}
	sendMessage(message)
}

const printRecovered = async (witness: string, blockNum: number) => {
	if (!recentlyMissedWitnesses.includes(witness)) {
		return
	}
	const time = new Date().toISOString()
	const result = await call('condenser_api.get_witness_by_account', [witness])
	let totalMissedBlocks = undefined
	if (result?.result?.total_missed) {
		totalMissedBlocks = result.result.total_missed
	}
	const messageString =
		`Witness ${witness} recovered on block ${blockNum}. Totall missed blocks=${totalMissedBlocks}. ${time}`
	const message = {
		icon_emoji: ':white_check_mark:',
		text: messageString,
	}
	sendMessage(message)
	delete recentlyMissedWitnesses[recentlyMissedWitnesses.indexOf(witness)]
}

const sendMessage = (message: OpenHiveMessage) => {
	fetch(openHiveHook, {
		method: 'post',
		body: JSON.stringify(message),
		headers: { 'Content-Type': 'application/json' },
	}).catch((e) => {
		console.error('Failed to deliver message', e)
	})
}
