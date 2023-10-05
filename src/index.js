
// Canto区块链节点地址
const jsonrpc_canto = 'https://jsonrpc.canto.nodestake.top'
const chain_id = 7700
// dex 路由合约地址
const addr_router = '0xe6e35e2AFfE85642eeE4a534d4370A689554133c'
// dex 路由合约abi
const router_uni_v2_abi = require('./abi/router_uni_v2.json')
const erc20_abi = require('./abi/erc20.json') 
const { ethers } = require('ethers')

// LP合约地址
const addr_lp = '0x74f29Af6525839f18ff6f03280005664D869F547'
// 持有LP的私钥
const pri_key = ''

const removeLP = async ()=>{

    const provide = new ethers.JsonRpcProvider(jsonrpc_canto) 
    const w = new ethers.Wallet(pri_key,provide)
    const lp_cantract = new ethers.Contract(addr_lp,erc20_abi,w)

    const lp_balance = await lp_cantract.balanceOf(w.address)
    // const lp_balance = await lp_cantract.balanceOf('0x9f2b4211f564A44E95cfa4FD6010029037777777')
    const lp_balance_eth = ethers.formatEther(lp_balance)
    console.log(`LP 余额:${lp_balance_eth}`)

    // 撤销lp
    const lp_allowance = await lp_cantract.allowance(w.address,addr_router)
    const lp_allowance_eth = ethers.formatEther(lp_allowance)
    console.log(`给router的LP授权量:${lp_allowance_eth}`)

    if(lp_allowance_eth<lp_balance_eth){
        console.log(`LP授权不足,执行授权...`)
        await (await lp_cantract.approve(addr_router,lp_balance)).wait()
    }

    const router_contract = new ethers.Contract(addr_router,router_uni_v2_abi,w)
    // 执行撤销LP
    await ( await router_contract.removeLiquidityETH(
        addr_lp,lp_balance,0,0,w.address,
        Math.floor( Date.now()/1000 + 600)
    )).wait()

    console.log(`remove lp`)
}

removeLP()

