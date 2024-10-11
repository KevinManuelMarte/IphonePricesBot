import IphonePublicationData from "../../../types/IphonePublicationData"

export default function publicationDataIsUncompleted (publicationData: IphonePublicationData) {
    if (!publicationData.publicationTitle) return true
    if (!publicationData.price) return true
    if (!publicationData.typeOfCurrency) return true
    else {
        return false
    };
}
