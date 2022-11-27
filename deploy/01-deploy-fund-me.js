//https://www.youtube.com/watch?v=gyMwXuJrbJQ&t=23199s
// function deployFunc() {
//     console.log("Hi!")
// }

const { network } = require("hardhat")

// module.exports.default = deployFunc

const { networkConfig, developmentChains } = require("../helper-hardhat-config") //https://www.youtube.com/watch?v=gyMwXuJrbJQ&t=23199s
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    //const {getNamedAccounts, deployments} = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    let ethUsdPriceFeedAddress

    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    const args = [ethUsdPriceFeedAddress]

    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, //put price feed address,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    log("Fund Me deployed")
    log("______________________________")

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args)
    }
}

module.exports.tags = ["all", "fundme"]
