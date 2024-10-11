import { IphoneGroup } from "../../../types/IphoneGroup"
import IphonePublicationData from "../../../types/IphonePublicationData"

export default function publicationTitleCorrespondsToIphoneName (publicationData: IphonePublicationData, iphone: IphoneGroup) {
    const publicationTitle = publicationData.publicationTitle.toLowerCase() //In case there is a extra space in neither the iphone name or the publication we remove the white space
    const iphoneName = iphone.name.toLowerCase()
    if (publicationTitle.includes(iphoneName)) return true
    else {

        return false
    };
}