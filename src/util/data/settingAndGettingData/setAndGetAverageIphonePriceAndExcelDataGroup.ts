import averageIphonePriceGroupAndExcelData from "../../../types/averageIphonePriceAndExcelData"
import { IphoneGroup } from "../../../types/IphoneGroup"
import IphoneWithExcelAndPriceData from "../../../types/IphoneWithExcelAndPriceData"

export default function setAndGetAverageIphonePriceAndExcelDataGroup (iphonePriceAndExcelData: IphoneWithExcelAndPriceData, dataGroup: averageIphonePriceGroupAndExcelData []) {

    const groupName = `${iphonePriceAndExcelData.name}-${iphonePriceAndExcelData.space}`

    const group = dataGroup.find((group) => {
        return group.name == groupName
    })

    if (group) {
        group.iphonesRegistered = group.iphonesRegistered + 1
        group.sumOfAllIphonesPrice = group.sumOfAllIphonesPrice + Number(iphonePriceAndExcelData.buyPrice) 
        group.averagePrice = group.sumOfAllIphonesPrice  / group.iphonesRegistered
        group.buyPrice = group.averagePrice * 0.85 //The price we want the iphones to have to buy them
        group.resellPrice = group.averagePrice //The average prices of the iphones in the market, the price we want to resell them/
    }
    else {
        const newGroup = {
            name: groupName,
            space: iphonePriceAndExcelData.space,
            sumOfAllIphonesPrice: Number(iphonePriceAndExcelData.buyPrice),
            iphonesRegistered: 1,
            averagePrice: Number(iphonePriceAndExcelData.buyPrice),
            buyPrice: Number(iphonePriceAndExcelData.buyPrice) * 0.85, //The idea is to buy the iphones with a 10% discount compared to the average price.
            //so, in the buyPrice property, the price we want the iphone to have to buy it, we will have to multiply it by 0.90 to discount a 10%
            resellPrice: Number(iphonePriceAndExcelData.resellPrice), //Resell price is, at least in the day im writing this comment, the same as the buyPrice, but without 10% discounted.
            buyCell: iphonePriceAndExcelData.buyCell,
            resellCell: iphonePriceAndExcelData.resellCell,
        }
        dataGroup.push(newGroup)
    }

    return dataGroup
}
