import playwright, { Page } from 'playwright';
import { chromium } from 'playwright';
import iphones from '../../../../data/iphones.json';
import { IphoneGroup } from '../../../../types/IphoneGroup';
import IphonePublicationData from '../../../../types/IphonePublicationData';

import IphoneWithExcelAndPriceData  from '../../../../types/IphoneWithExcelAndPriceData';
import averageIphonePriceAndExcelData from '../../../../types/averageIphonePriceAndExcelData';
import setAndGetAverageIphonePriceAndExcelDataGroup from '../../../data/settingAndGettingData/setAndGetAverageIphonePriceAndExcelDataGroup';
import publicationHasRenewedWordInTitle from '../../../data/checking/publicationHasRenewedWordInTitle';
import { findCorrespondingExcelCells } from '../../../data/settingAndGettingData/findCorrespondingIphoneExcelCells';
import publicationDataIsUncompleted from '../../../data/checking/publicationDataIsUncompleted';
import publicationTitleCorrespondsToIphoneName from '../../../data/checking/publicationTitleCorrespondsToPhoneName';

const averageIphonesPricesAndExcelData: averageIphonePriceAndExcelData [] = []

async function getIphoneProductsDataFromSearchResults (page: playwright.Page, iphone: IphoneGroup) {
    const products: IphonePublicationData [] = await page.$$eval('[data-component-type="s-search-result"]', results => {
        return results.map((el) => {
            //All the tags of the websites scrapped for this bot may change and so the bot would require further mainteanance in the future

            const publicationTitle = el.querySelector('h2 > a > span')?.textContent //Publication title
            const price = el.querySelector('.a-price-whole')?.textContent; //Price
            const typeOfCurrency = 'Euro' //This dependes on the website

            //Dont check if any of the properties are undefined or if the publication title corresponds to the Iphone we are looking for. We will do that
            //in the corresponding function
            return {publicationTitle, price, typeOfCurrency} as IphonePublicationData
        })
    }).catch()
    

    products.forEach((obtainedProductData) => {
        //First check if the publicacion has all the necessary data. If not, deny it.
        //The function will always return true if any of the properties are undefined
        if (publicationDataIsUncompleted(obtainedProductData)) return;


        //Second, check if the publication title has a 'renewed' indicator in the title
        if (!publicationHasRenewedWordInTitle(obtainedProductData)) return;

        //third, check if the publication is really about the iphone we want to search about by comparing iphone name to publication title
        if (!publicationTitleCorrespondsToIphoneName(obtainedProductData, iphone)) return;

        //Finally we gotta find the corresponding space according to the publication name so we can get the cells for the Excel
        const spaceAndCellsData = findCorrespondingExcelCells(iphone, obtainedProductData) //Should return something like [64GB, C#, B#]



        if (spaceAndCellsData == undefined) {
            return 
        };

        
        const publicationPrice = obtainedProductData.price.slice(0, -1 ) //In the case of Amazon, the price is recovered with a ',' in the end of it for some reason, so we gotta get rid of that
        //Now we create the object with the excel and price data that will pushed to the final array that we made before
        const IphoneExcelAndPriceData: IphoneWithExcelAndPriceData = new IphoneWithExcelAndPriceData()
        IphoneExcelAndPriceData.name = `${iphone.name}`
        IphoneExcelAndPriceData.space = spaceAndCellsData[0]
        IphoneExcelAndPriceData.buyPrice = (Number(publicationPrice)) 
        IphoneExcelAndPriceData.resellPrice = (Number(publicationPrice))
        IphoneExcelAndPriceData.buyCell = spaceAndCellsData[1]
        IphoneExcelAndPriceData.resellCell = spaceAndCellsData[2]

        setAndGetAverageIphonePriceAndExcelDataGroup(IphoneExcelAndPriceData, averageIphonesPricesAndExcelData)
    })
    return;

}

export async function getAmazonIphonesData () {    
    const browser = await chromium.launch({headless: true})
    const page = await browser.newPage()

    for (const iphone of iphones.groups) {
        
        await page.goto(iphone.scrapperLinks.Amazon).catch()
        await getIphoneProductsDataFromSearchResults(page, iphone).catch()

    }

    //Wait a few seconds before returning in case the is a iphone to push to the array yet 

    setTimeout(() => {
        
    }, 2000);
    console.log(averageIphonesPricesAndExcelData)
    return averageIphonesPricesAndExcelData
}