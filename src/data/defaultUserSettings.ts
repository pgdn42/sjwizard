// src/data/defaultUserSettings.ts
import type { UserSettings } from "../App";

export const defaultUserSettings: UserSettings = {
  copyConfig: {
    ersattning: [
      {
        id: "btn-ersattning-1",
        label: "Kopiera Beslut",
        icon: "CopyIcon",
        type: "copy",
        displayType: "icon",
        template: "Beslut: {ersattning.decision}\nÄrende: {ersattning.caseNumber}"
      },
      {
        id: "btn-ersattning-2",
        label: "Logg",
        icon: "CopyCheckIcon",
        type: "copy",
        displayType: "icon",
        template: "Beviljat {ersattning.decision} för tåg {ersattning.trainNumber} ({ersattning.delay} min försening)."
      },
    ],
    merkostnader: [
      {
        id: "btn-merk-1",
        label: "Kopiera Merkostnad",
        icon: "CopyIcon",
        type: "copy",
        displayType: "icon",
        template: "Kategori: {merkostnader.category}\nBeslut: {merkostnader.decision}\nSumma: {merkostnader.compensation}"
      },
    ],
    ticket: [
      {
        id: "btn-ticket-1",
        label: "Kopiera Biljettinfo",
        icon: "CopyIcon",
        type: "copy",
        displayType: "icon",
        template: "Bokningsnr: {ticket.bookingNumber}\nKort: {ticket.cardNumber}"
      },
    ],
    notes: [
      {
        id: "btn-notes-1",
        label: "Kopiera Notering",
        icon: "CopyIcon",
        type: "copy",
        displayType: "icon",
        template: "{notes.notesContent}"
      },
    ],
    train: [],
  },
};