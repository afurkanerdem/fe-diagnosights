export interface LabRecord {
    barcodeId: string;
    patientNameSurname: string;
    department: string;
    organismName: string;
    uploadDate: Date;
    requestDate: Date;
    barcodeDate: Date;
    resistantAntibiotics: Array<string>;
    susceptibleAntibiotics: Array<string>;
    susceptibleAtHighDoseAntibiotics: Array<string>;
}