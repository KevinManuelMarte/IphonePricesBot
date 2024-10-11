import IphonePublicationData from "../../../types/IphonePublicationData";

export default function publicationHasRenewedWordInTitle (publicationData: IphonePublicationData) {
    const words = ['reacondicionado', 'renewed', 'renovado']
    for (let index = 0; index < words.length; index++) {
        if (publicationData.publicationTitle.toLowerCase().includes(words[index].toLowerCase())) return true
    }

    return false;
}