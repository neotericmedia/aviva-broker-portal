import { LOB } from './Lob.model';

export class OfferingLobs {
    public OfferingCode: string;
    public Locale: LocaleTitle;
    public LOBList: LOB[];
    public Product: ProductInfo;
}

class ProductInfo {
    public Locale: LocaleTitle;
}

class LocaleTitle {
    public Title: string;
    // public UsageNote: string
}

class Description {
    public Title: string;
}
