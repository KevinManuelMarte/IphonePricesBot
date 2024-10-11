//Testing creating an excel workbook
import { Client, Events, GatewayIntentBits } from 'discord.js';
import ExcelJS from "exceljs";
import averageIphonePriceGroupAndExcelData from "./types/averageIphonePriceAndExcelData";
import { getRefurbMeIphonesData } from "./util/scrapping/refurbme/getRefurbMeIphonesData/getRefurbMeIphonesData";

import { getRefurbishedNLIphonesData } from "./util/scrapping/refurbishednl/getRefurbishedNLIphonesData/getRefurbishedNLMeIphonesData";
import { getRebuyEsIphonesData } from "./util/scrapping/rebuy.es/getRebuyEsIphonesData/getRebuyEsIphonesData";
import setAndGetAverageIphonePriceAndExcelDataGroup from './util/data/settingAndGettingData/setAndGetAverageIphonePriceAndExcelDataGroup';

let arrayToSend:  averageIphonePriceGroupAndExcelData [] = []

async function putAllTheDataInAnArray(allArRAYS: averageIphonePriceGroupAndExcelData[][]) {

    allArRAYS.forEach((array) => {
        array.forEach((el) => {
            el.buyPrice = el.buyPrice * 1.10
            arrayToSend = setAndGetAverageIphonePriceAndExcelDataGroup(el, arrayToSend)
            //This is a little bit complicated to explain, so take your time
            //Basically, what we are doing here is the same as we did when recollecting iphone data from websites, but a little bit different.

            //Though the funciton requires an object of type IphoneWithExcelAndPriceData, we are sending an object of type averageIphonePriceGroupAndExcelData
            //why we doing that?

            //The object we sending has the properties that the object the function requires, so there is no error. 

            //After explaining this, its very simple to understand the thing we are going here. We are just using all the groups that contain all the data of refurbished iphones we got from the webistes
            //and using their elements, aka iphone data so we can create new groups with the correct average price counting all the prices we got in the websites
            

            //If we dont create new groups with all the data we got and put before in the previous groups then the information put in the excel file will not be correct,
            //cuz it would be only taking in count and putting the data of only one website in case we use, for example, an foreach with all the groups with data.


            //Finally, you are probably asking why we change el.buyPrice. We change it because originally its the average price of the Iphone in the market.
            //But discounted by a 10%. We gotta return it to the price without discount so we can get all the prices from all the websites AND THEN discount it by 10%
            //again, getting the correct average price counting all the websites data.

            //I know this is confusing, but i tried my best to explain it. Take your time


        })
    })

    return arrayToSend
}



async function replaceExcelTemplateDataAndMakeACopy () {
    arrayToSend = []
    // await getRefurbishedNLIphonesData()
    const iphonesAllData: averageIphonePriceGroupAndExcelData[] [] = [await getRefurbMeIphonesData(), await getRebuyEsIphonesData()]
    const iphones: averageIphonePriceGroupAndExcelData[] = await putAllTheDataInAnArray(iphonesAllData)

    const excelWorkbookTemplateFilePath = './excel-template/excelWorkbookTemplate.xlsx'

    const workbook = (await new ExcelJS.Workbook().xlsx.readFile(excelWorkbookTemplateFilePath))
    const worksheet = workbook.getWorksheet(1)

    if (!worksheet) return;
        worksheet.name = 'Iphones'

    iphones.forEach((group) => {
        worksheet.getCell(group.buyCell).value = '';
       // worksheet.getCell(group.buyCell).value = group.buyPrice;
        
        worksheet.getCell(group.resellCell).value =`${Math.ceil((group.resellPrice + 1) / 10) * 10} €`;
    })

    await workbook.xlsx.writeFile('./excel-result/excelResult.xlsx')
    console.log('Excel file written!')

    return './excel-result/excelResult.xlsx'
}

// Require the necessary discord.js classes


// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.MessageCreate, async message => {
    if (message.content == "!prices") {
        const first = await message.reply({options: {ephemeral: true}, content: "Por favor espera un momento..."})
        await message.reply({ 
            options: {ephemeral: true},
            files: [`${await replaceExcelTemplateDataAndMakeACopy()}`]
        })

        await first.delete()
    }
})
// Log in to Discord with your client's token
client.login("MTI4MDYzNDcwMzYxMDkwNDY3OA.GqpYLc.4NQVKoHZWMosF_GfJKpIpDln3e5vKUds-lUzYY");