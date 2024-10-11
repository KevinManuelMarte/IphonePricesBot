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

async function getIphoneProductsDataFromSearchResults (page: playwright.Page, iphone: IphoneGroup, link: string) {

    if (page.url() != link) {
        console.log('\x1b[31m%s\x1b[0m', '!---------------------------------------!')
        console.log('\x1b[31m%s\x1b[0m', 'El link que se supone del que hay que recoger datos y el link de la pagina no es el mismo.')
        console.log('\x1b[31m%s\x1b[0m', `Link de la pagina actual: ${page.url()}`)
        console.log('\x1b[31m%s\x1b[0m', `Link del que hay que buscar informacion: ${link}`)
        console.log('\x1b[31m%s\x1b[0m', '!---------------------------------------!')
        return 
    }

    const products: IphonePublicationData [] = await page.$$eval('[data-cy="product-link-container"]', results => {
        return results.map((el) => {
            //All the tags of the websites scrapped for this bot may change and so the bot would require further mainteanance in the future

            let publicationDetails: string = el.querySelector(".productTitle > a")?.textContent as string
        

            const publicationTitle = `${el.querySelector('.title')?.textContent} - renewed` //I


            el.querySelector('.productPrice > span')?.remove()
            let price = el.querySelector('[data-cy="product-price"]')?.textContent?.replace(/,[0-9]*/, '').match(/[0-9]{1,6}/g)?.join('')  //Price
            price = price?.replace('  ', '') //1 000 $ = 1000$ = we can use it
            price = price?.replace('€', '') //We dont want the symbol because it would make the price variable a NaN object when turning it to number
            price = price?.replace('  ', '') //1 000 $ = 1000$ = we can use it
            

            const typeOfCurrency = 'Dollar' //This dependes on the website

            //Dont check if any of the properties are undefined or if the publication title corresponds to the Iphone we are looking for. We will do that
            //in the corresponding function
            return {publicationTitle, price, typeOfCurrency} as IphonePublicationData
        })
    }).catch(error => {
        console.log('\x1b[31m%s\x1b[0m', '!---------------------------------------!')
        console.log('\x1b[31m%s\x1b[0m', `Ha ocurrido un error al momento de buscar informacion sobre el Iphone ${iphone.name} en RebuyEs. El error es: `)
        console.log('\x1b[31m%s\x1b[0m',error)
        console.log('\x1b[31m%s\x1b[0m', '!---------------------------------------!')
        return []
    })
    
 

    products.forEach((obtainedProductData) => {
        console.log(obtainedProductData)
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

   
        //Now we create the object with the excel and price data that will pushed to the final array that we made before
        const IphoneExcelAndPriceData: IphoneWithExcelAndPriceData = new IphoneWithExcelAndPriceData()
        IphoneExcelAndPriceData.name = `${iphone.name}`
        IphoneExcelAndPriceData.space = spaceAndCellsData[0]

        //I know this does not make a lot of sense, but ill explain this
        //The reason because the buyPrice property and resellPrice property are the same,
        //is because we will apply the 10% discount on the buyPrice later when creating the group with the function used below.
        //the resellPrice is the same but there will be no 10% discount applied to it. 

        IphoneExcelAndPriceData.buyPrice = Number(obtainedProductData.price) 
        IphoneExcelAndPriceData.resellPrice = Number(obtainedProductData.price) 
        //Thats why both get the same value here.
        
        IphoneExcelAndPriceData.buyCell = spaceAndCellsData[1]
        IphoneExcelAndPriceData.resellCell = spaceAndCellsData[2]

        setAndGetAverageIphonePriceAndExcelDataGroup(IphoneExcelAndPriceData, averageIphonesPricesAndExcelData) 
    })
    return;

}

export async function getRebuyEsIphonesData () {    
    const browser = await chromium.launch({headless: true})
    const page = await browser.newPage()

    for (const iphone of iphones.groups) {
        const link = `${iphone.scrapperLinks.rebuyes}`
        console.log('\x1b[34m%s\x1b[0m','---------------------------------------')
        console.log('\x1b[34m%s\x1b[0m',`Recogiendo datos del ${iphone.name} en RebuyEs.`)
        console.log('\x1b[34m%s\x1b[0m',`Pagina: 1`)
        console.log('\x1b[34m%s\x1b[0m',"Link de RefurbMe: " + link)
        console.log('\x1b[34m%s\x1b[0m','---------------------------------------')
        await page.goto(link, {timeout: 10000}).catch(error => {
            console.log('\x1b[31m%s\x1b[0m','---------------------------------------')
            console.log('\x1b[31m%s\x1b[0m', 'Error al intentar navegar a la pagina, posiblemente por conexion lenta')
            console.log('\x1b[31m%s\x1b[0m', 'El error es:')
            console.log('\x1b[31m%s\x1b[0m', error)
            console.log('\x1b[1m%s\x1b[0m','---------------------------------------')
        }
        )
        await getIphoneProductsDataFromSearchResults(page, iphone, link)

        //So we dont make too many HTTP requests in case the bot get blocked by that
        await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 0 + 1000)))

        

    }

    await page.close()
    await browser.close()

    //Wait a few seconds bef
    //ore returning in case the is a iphone to push to the array yet 

    return averageIphonesPricesAndExcelData
}
