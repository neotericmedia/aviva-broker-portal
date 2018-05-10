export class LegalName {
    private name: string;
    private isPrimary: boolean;

    get getName():string {
        return this.name;
    }
    get getIsPrimary():boolean {
        return this.isPrimary;
    }
}
