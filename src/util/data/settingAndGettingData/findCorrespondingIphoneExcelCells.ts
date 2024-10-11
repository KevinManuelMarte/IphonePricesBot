import { IphoneGroup } from "../../../types/IphoneGroup";
import IphonePublicationData from "../../../types/IphonePublicationData";

//Function to find what are the corresponding cells to the iphone with the specific space (64GB, 128GB, 256, ETC.)
export function findCorrespondingExcelCells (iphone: IphoneGroup, publicationData: IphonePublicationData) {
    //Space and cells are together in a string array. For example, for the Iphone X, that has 64GB and 256 GB, its array is something like this
    //"64GB - C5 - D5", "256 GB - C7 - D7"
    //Two elements in the array. First, we indicate the space, after that, the cell name of buying price and last the cell name of reselling price

    const spaceAndCells = iphone.spaceAndCorrespondingCells 

    let finalSpaceAndCells: string [] | undefined; //The space and cells data that we will return

    spaceAndCells.forEach((spaceAndCellsData: string) => {
        const data = spaceAndCellsData.split(' ').join('').split('-'); //Remove the white spaces and after that split. It should look something like (space - buy cell price - resell cell price)

        const publicationTitle = publicationData.publicationTitle.toLowerCase()
        
        const spaceSeparated = data[0].replace("GB", ' GB').toLowerCase() //EX: 64 GB (default)


        const space = data[0].toLowerCase()


        //We should get an array like [64GB, C#, D#] obviously the letters and # correspond to the buy price cell and re sell price cell
        if (publicationTitle.includes(spaceSeparated)) {
            finalSpaceAndCells = data
            return;
            
        }
        else if (publicationTitle.includes(space)){
            finalSpaceAndCells = data
            return;
        }
    })


    return finalSpaceAndCells
    
}