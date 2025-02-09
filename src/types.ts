interface ProducerMissed {
	producer: string
}
interface ProducerReward {
	producer: string
	vesting_shares: string
}

export interface OpInBlock {
	block: number
	op: [
		string,
		ProducerMissed | ProducerReward,
	]
	op_in_trx: number
	timestamp: string
	trx_id: string
	trx_in_block: number
	virtual_op: boolean
}

export interface OpenHiveMessage {
	icon_emoji: string
	text: string
}
