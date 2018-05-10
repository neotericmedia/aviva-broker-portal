import { Skip } from 'serializer.ts/Decorators';

export class LOB {
    public LOBCode: string;
    public Locale: Description;
    public LOBExistence: string;
    public LOBSequence: number;
    public MajorLine: string;

    @Skip()
    public selected: boolean;
}

class Description {
    public Title: string;
}
